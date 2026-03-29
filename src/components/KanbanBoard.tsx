"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import DragOverlayCard from "./DragOverlayCard";
import { useTasks, useMoveTask } from "@/hooks/useTasks";
import { Task, ColumnId, COLUMNS } from "@/types/task";
import KanbanColumn from "./KanbanColumn";
import TaskDialog from "./TaskDialog";
import KanbanHeader from "./KanbanHeader";

function sortKeyOrder(order: number | undefined): number {
  return order ?? 0;
}

/** Build a Record<ColumnId, string[]> of task IDs sorted by their order field */
function buildColumnItems(tasks: Task[]): Record<string, string[]> {
  const map: Record<string, string[]> = {
    backlog: [],
    in_progress: [],
    review: [],
    done: [],
  };
  const sorted = [...tasks].sort((a, b) => {
    const byOrder = sortKeyOrder(a.order) - sortKeyOrder(b.order);
    if (byOrder !== 0) return byOrder;
    return a.createdAt.localeCompare(b.createdAt);
  });
  sorted.forEach((t) => {
    if (map[t.column] !== undefined) map[t.column].push(t.id);
  });
  return map;
}

export default function KanbanBoard() {
  const { data: tasks = [], isLoading, error } = useTasks();
  const moveTask = useMoveTask();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultColumn, setDefaultColumn] = useState<ColumnId>("backlog");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Local state that drives live reordering during drag
  // null means "no drag in progress, derive from server data"
  const [liveColumnItems, setLiveColumnItems] = useState<Record<
    string,
    string[]
  > | null>(null);
  // Ref mirrors state so onDragEnd always reads the latest value (avoids stale closures)
  const liveColumnItemsRef = useRef<Record<string, string[]> | null>(null);
  const previousItemsRef = useRef<Record<string, string[]> | null>(null);

  // Task lookup map
  const tasksById = useMemo(() => {
    const m: Record<string, Task> = {};
    tasks.forEach((t) => (m[t.id] = t));
    return m;
  }, [tasks]);

  // The authoritative column items: live state during drag, server-derived otherwise
  const serverColumnItems = useMemo(() => buildColumnItems(tasks), [tasks]);
  const columnItems = liveColumnItems ?? serverColumnItems;

  // For search: filter task ids per column
  const filteredColumnItems = useMemo(() => {
    if (!searchQuery.trim()) return columnItems;
    const q = searchQuery.toLowerCase();
    const result: Record<string, string[]> = {};
    (Object.keys(columnItems) as ColumnId[]).forEach((col) => {
      result[col] = columnItems[col].filter((id) => {
        const t = tasksById[id];
        if (!t) return false;
        return (
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
      });
    });
    return result;
  }, [columnItems, tasksById, searchQuery]);

  const totalTasks = tasks.length;

  const filteredTotal = useMemo(
    () =>
      Object.values(filteredColumnItems).reduce((s, ids) => s + ids.length, 0),
    [filteredColumnItems],
  );

  const handleAddTask = useCallback((column: ColumnId) => {
    setEditingTask(null);
    setDefaultColumn(column);
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultColumn(task.column);
    setDialogOpen(true);
  }, []);

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Failed to load tasks. Please try again later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={(theme) => ({
        minHeight: "100vh",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #020617 100%)"
            : "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fff7ed 100%)",
      })}
    >
      <KanbanHeader
        totalTasks={totalTasks}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredTotal={filteredTotal}
        onAddTask={handleAddTask}
      />


      {/* Loading Spinner */}
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "70vh",
          }}
        >
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      ) : (
        <DragDropProvider
          onDragStart={(event) => {
            // Snapshot for rollback on cancel
            const current = buildColumnItems(tasks);
            previousItemsRef.current = current;
            liveColumnItemsRef.current = current;
            setLiveColumnItems(current);

            const sourceId = event.operation.source?.id;
            if (sourceId) {
              const task = tasksById[String(sourceId)];
              if (task) setActiveTask(task);
            }
          }}
          onDragOver={(event) => {
            // Live visual reorder — move() shifts ids between columns instantly
            setLiveColumnItems((prev) => {
              const next = move(prev ?? serverColumnItems, event);
              liveColumnItemsRef.current = next;
              return next;
            });
          }}
          onDragEnd={(event) => {
            setActiveTask(null);

            if (event.canceled) {
              // Rollback to pre-drag state
              setLiveColumnItems(previousItemsRef.current);
              // Brief delay then clear so server state re-takes control
              setTimeout(() => setLiveColumnItems(null), 0);
              return;
            }

            // Persist the final ordering to the API
            // Use ref (always fresh) instead of stale closure state
            const finalItems = liveColumnItemsRef.current ?? serverColumnItems;
            const { source } = event.operation;
            if (!source) {
              setLiveColumnItems(null);
              return;
            }

            const movedTaskId = String(source.id);
            const movedTask = tasksById[movedTaskId];
            if (!movedTask) {
              setLiveColumnItems(null);
              return;
            }

            // Find which column the card ended up in and its index
            let newColumn: ColumnId | undefined;
            let newIndex = -1;
            for (const [col, ids] of Object.entries(finalItems)) {
              const idx = ids.indexOf(movedTaskId);
              if (idx !== -1) {
                newColumn = col as ColumnId;
                newIndex = idx;
                break;
              }
            }

            if (!newColumn) {
              setLiveColumnItems(null);
              return;
            }

            const siblings = finalItems[newColumn];
            // Compute order value using midpoint strategy
            const prevId = newIndex > 0 ? siblings[newIndex - 1] : undefined;
            const nextId =
              newIndex < siblings.length - 1
                ? siblings[newIndex + 1]
                : undefined;

            const prevOrder = prevId
              ? sortKeyOrder(tasksById[prevId]?.order)
              : 0;
            const nextOrder = nextId
              ? sortKeyOrder(tasksById[nextId]?.order)
              : undefined;

            let newOrder: number;
            if (newIndex === 0 && siblings.length === 1) {
              // Only item
              newOrder = sortKeyOrder(movedTask.order);
            } else if (!prevId) {
              // First item
              newOrder =
                nextOrder !== undefined && nextOrder > 0 ? nextOrder / 2 : 512;
            } else if (nextOrder === undefined) {
              // Last item
              newOrder = prevOrder + 1024;
            } else {
              newOrder = (prevOrder + nextOrder) / 2;
            }

            // Only mutate if something actually changed
            const unchanged =
              movedTask.column === newColumn &&
              Math.abs(sortKeyOrder(movedTask.order) - newOrder) < 0.001;

            if (!unchanged) {
              moveTask.mutate({ task: movedTask, newColumn, newOrder });
            }

            // Clear live state — server state will re-sync after mutation settles
            liveColumnItemsRef.current = null;
            setLiveColumnItems(null);
          }}
        >
          <Box
            sx={(theme) => ({
              display: "flex",
              gap: 2.5,
              p: { xs: 2, md: 3 },
              overflowX: "auto",
              minHeight: "calc(100vh - 80px)",
              alignItems: "flex-start",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  theme.palette.mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.1)",
                borderRadius: 4,
              },
            })}
          >
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                taskIds={filteredColumnItems[col.id] ?? []}
                tasksById={tasksById}
                onAddTask={() => handleAddTask(col.id)}
                onEditTask={handleEditTask}
              />
            ))}
          </Box>

          <DragOverlay>
            {activeTask ? <DragOverlayCard task={activeTask} /> : null}
          </DragOverlay>
        </DragDropProvider>
      )}

      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        task={editingTask}
        defaultColumn={defaultColumn}
      />
    </Box>
  );
}
