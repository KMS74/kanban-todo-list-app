import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchTasks, createTask, updateTask, patchTask, deleteTask } from "@/api/tasks";
import { Task, ColumnId } from "@/types/task";

const TASKS_KEY = ["tasks"];

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: async () => {
      const dbTasks = await fetchTasks();
      return dbTasks.sort((a, b) => {
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return a.createdAt.localeCompare(b.createdAt);
      });
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        old?.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      );
      return { previousTasks };
    },
    onError: (_err, _updatedTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      task,
      newColumn,
      newOrder,
    }: {
      task: Task;
      newColumn: ColumnId;
      newOrder?: number;
    }) => {
      const updates: Partial<Task> = { column: newColumn };
      if (newOrder !== undefined) updates.order = newOrder;
      return patchTask(task.id, updates);
    },
    onMutate: async ({ task, newColumn, newOrder }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) => {
        if (!old) return old;
        const newTasks = old.map((t) => {
          if (t.id === task.id) {
            return { ...t, column: newColumn, order: newOrder !== undefined ? newOrder : t.order };
          }
          return t;
        });
        return newTasks.sort((a, b) => {
          const oa = a.order ?? 0;
          const ob = b.order ?? 0;
          if (oa !== ob) return oa - ob;
          return a.createdAt.localeCompare(b.createdAt);
        });
      });
      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previousTasks = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (old) =>
        old?.filter((t) => t.id !== taskId)
      );
      return { previousTasks };
    },
    onError: (_err, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
