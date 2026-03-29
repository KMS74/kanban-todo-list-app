"use client";

import { Box, Typography, Chip, alpha } from "@mui/material";
import { Task, PRIORITY_CONFIG, COLUMNS } from "@/types/task";

interface DragOverlayCardProps {
  task: Task;
}

export default function DragOverlayCard({ task }: DragOverlayCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const column = COLUMNS.find((c) => c.id === task.column);
  const columnColor = column?.color ?? "#6366f1";

  return (
    <Box
      sx={(theme) => ({
        p: 2,
        borderRadius: 3,
        backgroundColor:
          theme.palette.mode === "dark" ? "rgba(30,41,59,0.95)" : "#ffffff",
        border: "1px solid",
        borderColor: alpha(columnColor, 0.3),
        cursor: "grabbing",
        boxShadow:
          theme.palette.mode === "dark"
            ? `0 16px 48px ${alpha(columnColor, 0.25)}, 0 4px 12px rgba(0,0,0,0.6)`
            : `0 16px 48px ${alpha(columnColor, 0.25)}, 0 4px 12px rgba(0,0,0,0.1)`,
        width: 300,
        userSelect: "none",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: column?.gradient ?? columnColor,
        },
      })}
    >
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
          "& .MuiChip-label": { px: 1 },
        }}
      />

      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: "0.85rem",
          lineHeight: 1.4,
          color: "text.primary",
          mb: 0.5,
        }}
      >
        {task.title}
      </Typography>

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
        }}
      >
        {task.description}
      </Typography>
    </Box>
  );
}
