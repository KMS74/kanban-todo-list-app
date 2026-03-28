import { ControlledTextField } from "@/components/ControlledTextField";
import { COLUMNS, PRIORITY_CONFIG, Priority } from "@/types/task";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, MenuItem } from "@mui/material";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .optional(),
  column: z.enum(["backlog", "in_progress", "review", "done"] as const),
  priority: z.enum(["low", "medium", "high"] as const),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

export function useTaskForm(defaultValues?: Partial<TaskFormValues>) {
  return useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      column: "backlog",
      priority: "medium",
      ...defaultValues,
    },
    mode: "onChange",
  });
}

type TaskFormProps = {
  id?: string;
  form: UseFormReturn<TaskFormValues>;
  onSubmit: (data: TaskFormValues) => void;
};

export function TaskForm({ id, form, onSubmit }: TaskFormProps) {
  const { control, handleSubmit } = form;

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
        <ControlledTextField
          control={control}
          name="title"
          label="Title"
          fullWidth
          autoFocus
        />

        <ControlledTextField
          control={control}
          name="description"
          label="Description"
          fullWidth
          multiline
          rows={3}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <ControlledTextField
            control={control}
            name="column"
            select
            label="Column"
            fullWidth
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
          </ControlledTextField>

          <ControlledTextField
            control={control}
            name="priority"
            select
            label="Priority"
            fullWidth
          >
            {(
              Object.entries(PRIORITY_CONFIG) as [
                Priority,
                typeof PRIORITY_CONFIG.high,
              ][]
            ).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
            ))}
          </ControlledTextField>
        </Box>
      </Box>
    </form>
  );
}
