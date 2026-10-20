import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Task = Database["public"]["Tables"]["tasks"]["Row"];
type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];

export function useTasks() {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Task[];
    },
  });

  const createTask = useMutation({
    mutationFn: async (task: Omit<TaskInsert, "user_id">) => {
      const { data, error } = await supabase.from("tasks").insert([task] as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TaskUpdate }) => {
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleTask = useMutation({
    mutationFn: async (task: Task) => {
      const updates: TaskUpdate = {
        status: task.status === "completed" ? "not_started" : "completed",
        completed_at: task.status === "completed" ? null : new Date().toISOString(),
      };
      const { data, error } = await supabase.from("tasks").update(updates).eq("id", task.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}

export function useTaskStats() {
  return useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("status, due_date");
      if (error) throw error;
      const tasks = (data ?? []) as { status: string; due_date: string | null }[];
      const today = new Date().toISOString().split("T")[0];
      return {
        total: tasks.length,
        completed: tasks.filter((t) => t.status === "completed").length,
        pending: tasks.filter((t) => t.status !== "completed").length,
        overdue: tasks.filter((t) => t.status !== "completed" && t.due_date && t.due_date < today).length,
      };
    },
  });
}
