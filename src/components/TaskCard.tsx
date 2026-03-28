"use client";

import {
  Box,
  Typography,
  IconButton,
  Chip,
  alpha,
  Tooltip,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import toast from "react-hot-toast";
import { useSortable } from "@dnd-kit/react/sortable";
import { Task, ColumnId, PRIORITY_CONFIG } from "@/types/task";
import { useDeleteTask } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  columnId: ColumnId;
  columnColor: string;
  onEdit: () => void;
  index: number;
}

export default function TaskCard({
  task,
  columnId,
  columnColor,
  onEdit,
  index,
}: TaskCardProps) {
  const deleteTask = useDeleteTask();

  const { ref, isDragging } = useSortable({
    id: task.id,
    group: columnId,
    index,
  });

  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        toast.success("Task deleted successfully!");
      }
    });
  };

  return (
    <Box
      ref={ref}
      onClick={onEdit}
      sx={{
        p: 2,
        borderRadius: 3,
        backgroundColor: "#ffffff",
        border: "1px solid",
        borderColor: isDragging ? alpha(columnColor, 0.3) : "rgba(0,0,0,0.05)",
        cursor: isDragging ? "grabbing" : "grab",
        opacity: isDragging ? 0.4 : 1,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          borderColor: alpha(columnColor, 0.2),
          boxShadow: `0 4px 16px ${alpha(columnColor, 0.1)}`,
          transform: "translateY(-1px)",
          "& .task-actions": {
            opacity: 1,
          },
          "& .drag-handle": {
            opacity: 0.5,
          },
        },
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Drag Handle */}
      <Box
        className="drag-handle"
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          opacity: 0,
          transition: "opacity 0.15s ease",
          color: "text.secondary",
        }}
      >
        <DragIndicatorIcon sx={{ fontSize: 16 }} />
      </Box>

      {/* Priority Badge */}
      <Chip
        label={priorityConfig.label}
        size="small"
        sx={{
          height: 20,
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.04em",
          backgroundColor: priorityConfig.bgColor,
          color: priorityConfig.color,
          mb: 1,
          "& .MuiChip-label": {
            px: 1,
          },
        }}
      />

      {/* Title */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: "0.85rem",
          lineHeight: 1.4,
          color: "text.primary",
          mb: 0.5,
          pr: 3,
        }}
      >
        {task.title}
      </Typography>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          fontSize: "0.78rem",
          color: "text.secondary",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          mb: 1.5,
        }}
      >
        {task.description}
      </Typography>

      {/* Actions — visible on hover */}
      <Box
        className="task-actions"
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 0.5,
          opacity: 0,
          transition: "opacity 0.15s ease",
        }}
      >
        <Tooltip title="Edit" arrow>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            sx={{
              width: 28,
              height: 28,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: alpha(columnColor, 0.08),
                color: columnColor,
              },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <IconButton
            size="small"
            onClick={handleDelete}
            sx={{
              width: 28,
              height: 28,
              color: "text.secondary",
              "&:hover": {
                backgroundColor: "rgba(239, 68, 68, 0.08)",
                color: "#ef4444",
              },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
