"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  InputAdornment,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import DragOverlayCard from "./DragOverlayCard";
import { useTasks, useMoveTask } from "@/hooks/useTasks";
import { Task, ColumnId, COLUMNS } from "@/types/task";
import KanbanColumn from "./KanbanColumn";
import TaskDialog from "./TaskDialog";

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
  const [liveColumnItems, setLiveColumnItems] = useState<Record<string, string[]> | null>(null);
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
    [filteredColumnItems]
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
          Failed to load tasks. Make sure json-server is running on port 4000.
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fff7ed 100%)",
      }}
    >
      {/* TODO: move it in reusable component */}
      {/* Header */}
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 2.5,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              <DashboardIcon sx={{ color: "#fff", fontSize: 22 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.2,
                }}
              >
                Kanban Board
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                {totalTasks} tasks
              </Typography>
            </Box>
          </Box>

          <TextField
            placeholder="Search tasks..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 600 },
              order: { xs: 3, sm: 0 },
              "& .MuiOutlinedInput-root": {
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: 3,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 16px rgba(99, 102, 241, 0.15)",
                },
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: "text.secondary", fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Tooltip title="Create new task" arrow>
            <IconButton
              onClick={() => handleAddTask("backlog")}
              sx={{
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "#fff",
                width: 40,
                height: 40,
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {searchQuery && (
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Showing {filteredTotal} of {totalTasks} tasks
            </Typography>
            <Chip
              label={`"${searchQuery}"`}
              size="small"
              onDelete={() => setSearchQuery("")}
              sx={{
                borderRadius: 2,
                backgroundColor: "rgba(99, 102, 241, 0.08)",
                color: "#6366f1",
                fontWeight: 600,
                "& .MuiChip-deleteIcon": {
                  color: "#6366f1",
                  "&:hover": { color: "#4f46e5" },
                },
              }}
            />
          </Box>
        )}
      </Box>

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
              newOrder = nextOrder !== undefined && nextOrder > 0
                ? nextOrder / 2
                : 512;
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
            sx={{
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
                background: "rgba(0,0,0,0.1)",
                borderRadius: 4,
              },
            }}
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
