import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Habit = Database["public"]["Tables"]["habits"]["Row"];
type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];
type HabitCompletion = Database["public"]["Tables"]["habit_completions"]["Row"];

export function useHabits() {
  const queryClient = useQueryClient();

  const { data: habits = [], isLoading, error, refetch } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Habit[];
    },
  });

  const createHabit = useMutation({
    mutationFn: async (habit: Omit<HabitInsert, "user_id">) => {
      const { data, error } = await supabase.from("habits").insert([habit] as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const updateHabit = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: HabitUpdate }) => {
      const { data, error } = await supabase.from("habits").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const deleteHabit = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });

  const toggleHabitCompletion = useMutation({
    mutationFn: async ({ habitId, date, quantity }: { habitId: string; date: string; quantity: number }) => {
      const { data: existing } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("habit_id", habitId)
        .eq("completed_at", date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from("habit_completions").delete().eq("id", (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("habit_completions").insert([{
          habit_id: habitId,
          completed_at: date,
          quantity,
        }] as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["habit-completions"] });
    },
  });

  return {
    habits,
    isLoading,
    error,
    refetch,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
  };
}

export function useHabitCompletions(habitId: string) {
  return useQuery({
    queryKey: ["habit-completions", habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("habit_id", habitId);
      if (error) throw error;
      return (data ?? []) as HabitCompletion[];
    },
    enabled: !!habitId,
  });
}
