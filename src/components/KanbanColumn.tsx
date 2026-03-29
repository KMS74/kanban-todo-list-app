"use client";

import { useState } from "react";
import { Box, Typography, Button, Chip, alpha } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { Task, ColumnConfig } from "@/types/task";
import TaskCard from "./TaskCard";

const ITEMS_PER_PAGE = 5;

interface KanbanColumnProps {
  column: ColumnConfig;
  /** Ordered list of task ids to render */
  taskIds: string[];
  /** Full task lookup map */
  tasksById: Record<string, Task>;
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}

export default function KanbanColumn({
  column,
  taskIds,
  tasksById,
  onAddTask,
  onEditTask,
}: KanbanColumnProps) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Low priority so item-to-item sortable collisions win over the column droppable
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    collisionPriority: CollisionPriority.Low,
  });

  const visibleIds = taskIds.slice(0, visibleCount);
  const hasMore = visibleCount < taskIds.length;

  return (
    <Box
      ref={ref}
      sx={(theme) => ({
        minWidth: 300,
        maxWidth: 340,
        width: "100%",
        flex: "1 1 0",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        background: isDropTarget
          ? alpha(column.color, 0.04)
          : theme.palette.mode === "dark"
          ? "rgba(30,41,59,0.6)"
          : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(20px)",
        border: "1px solid",
        borderColor: isDropTarget
          ? alpha(column.color, 0.3)
          : theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.06)"
          : "rgba(0,0,0,0.06)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isDropTarget
          ? `0 0 0 2px ${alpha(column.color, 0.2)}, 0 8px 32px ${alpha(column.color, 0.12)}`
          : "0 1px 3px rgba(0,0,0,0.04)",
        transform: isDropTarget ? "scale(1.01)" : "scale(1)",
        maxHeight: "calc(100vh - 100px)",
        overflow: "hidden",
      })}
    >
      {/* Column Header */}
      <Box
        sx={{
          p: 2,
          pb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: column.gradient,
            boxShadow: `0 0 8px ${alpha(column.color, 0.4)}`,
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            color: "text.primary",
          }}
        >
          {column.title}
        </Typography>
        <Chip
          label={taskIds.length}
          size="small"
          sx={{
            height: 22,
            minWidth: 22,
            fontSize: "0.7rem",
            fontWeight: 700,
            backgroundColor: alpha(column.color, 0.1),
            color: column.color,
            "& .MuiChip-label": {
              px: 0.75,
            },
          }}
        />
      </Box>

      {/* Cards Container */}
      <Box
        sx={(theme) => ({
          flex: 1,
          overflowY: "auto",
          px: 1.5,
          pb: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          "&::-webkit-scrollbar": {
            width: 4,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.08)",
            borderRadius: 2,
          },
        })}
      >
        {visibleIds.map((id, index) => {
          const task = tasksById[id];
          if (!task) return null;
          return (
            <TaskCard
              key={id}
              task={task}
              columnId={column.id}
              columnColor={column.color}
              index={index}
              onEdit={() => onEditTask(task)}
            />
          );
        })}

        {hasMore && (
          <Button
            size="small"
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            sx={{
              color: column.color,
              fontSize: "0.75rem",
              fontWeight: 600,
              py: 0.75,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: alpha(column.color, 0.06),
              },
            }}
          >
            Load more ({taskIds.length - visibleCount} remaining)
          </Button>
        )}
      </Box>

      {/* Add Task Button */}
      <Box sx={{ p: 1.5, pt: 0.5 }}>
        <Button
          fullWidth
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={onAddTask}
          disableElevation
          disableRipple
          disableTouchRipple
          disableFocusRipple
          sx={(theme) => ({
            color: "text.secondary",
            fontSize: "0.8rem",
            fontWeight: 600,
            py: 1,
            borderRadius: 2.5,
            border: "1px dashed",
            borderColor:
              theme.palette.mode === "dark"
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.1)",
            "&:hover": {
              borderColor: alpha(column.color, 0.4),
              backgroundColor: alpha(column.color, 0.04),
              color: column.color,
            },
            transition: "all 0.2s ease",
          })}
        >
          Add task
        </Button>
      </Box>
    </Box>
  );
}
