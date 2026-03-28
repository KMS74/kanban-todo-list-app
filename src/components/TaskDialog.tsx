"use client";

import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { COLUMNS, ColumnId, PRIORITY_CONFIG, Priority, Task } from "@/types/task";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";

interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  defaultColumn: ColumnId;
}

export default function TaskDialog({
  open,
  onClose,
  task,
  defaultColumn,
}: TaskDialogProps) {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEditing = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [column, setColumn] = useState<ColumnId>(defaultColumn);
  const [priority, setPriority] = useState<Priority>("medium");
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setColumn(task.column);
        setPriority(task.priority);
      } else {
        setTitle("");
        setDescription("");
        setColumn(defaultColumn);
        setPriority("medium");
      }
      setErrors({});
    }
  }, [open, task, defaultColumn]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setErrors({ title: "Title is required" });
      return;
    }

    if (isEditing && task) {
      updateTask.mutate(
        {
          ...task,
          title: title.trim(),
          description: description.trim(),
          column,
          priority,
        },
        { onSuccess: onClose }
      );
    } else {
      createTask.mutate(
        {
          title: title.trim(),
          description: description.trim(),
          column,
          priority,
          order: Date.now(),
        },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "0 24px 64px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isEditing
                ? "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            }}
          />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
            {isEditing ? "Edit Task" : "New Task"}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors({});
            }}
            error={!!errors.title}
            helperText={errors.title}
            autoFocus
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              select
              label="Column"
              fullWidth
              value={column}
              onChange={(e) => setColumn(e.target.value as ColumnId)}
            >
              {COLUMNS.map((col) => (
                <MenuItem key={col.id} value={col.id}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: col.color,
                      }}
                    />
                    {col.title}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              fullWidth
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG.high][]).map(
                ([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: config.color,
                        }}
                      />
                      {config.label}
                    </Box>
                  </MenuItem>
                )
              )}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={createTask.isPending || updateTask.isPending}
          sx={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            "&:hover": {
              background:
                "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
            },
            px: 3,
          }}
        >
          {isEditing ? "Update" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
