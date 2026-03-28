"use client";

import { useCreateTask, useUpdateTask } from "@/hooks/useTasks";
import { ColumnId, Task } from "@/types/task";
import toast from "react-hot-toast";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { TaskForm, TaskFormValues, useTaskForm } from "./TaskForm";

const getTimestamp = () => Date.now();

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

  const form = useTaskForm({ column: defaultColumn });
  const { reset } = form;

  useEffect(() => {
    if (open) {
      if (task) {
        reset({
          title: task.title,
          description: task.description,
          column: task.column,
          priority: task.priority,
        });
      } else {
        reset({
          title: "",
          description: "",
          column: defaultColumn,
          priority: "medium",
        });
      }
    }
  }, [open, task, defaultColumn, reset]);

  const onSubmit = (data: TaskFormValues) => {
    if (isEditing && task) {
      updateTask.mutate(
        {
          ...task,
          title: data.title.trim(),
          description: data.description?.trim() || "",
          column: data.column,
          priority: data.priority,
        },
        { 
          onSuccess: () => {
            onClose();
            toast.success("Task updated successfully!");
          }
        },
      );
    } else {
      createTask.mutate(
        {
          title: data.title.trim(),
          description: data.description?.trim() || "",
          column: data.column,
          priority: data.priority,
          order: getTimestamp(),
        },
        { 
          onSuccess: () => {
            onClose();
            toast.success("Task created successfully!");
          }
        },
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
        <TaskForm id="task-form" form={form} onSubmit={onSubmit} />
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
          type="submit"
          form="task-form"
          variant="contained"
          disabled={createTask.isPending || updateTask.isPending}
          sx={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
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
