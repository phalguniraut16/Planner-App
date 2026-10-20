import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";

type Note = Database["public"]["Tables"]["notes"]["Row"];
type NoteInsert = Database["public"]["Tables"]["notes"]["Insert"];
type NoteUpdate = Database["public"]["Tables"]["notes"]["Update"];

export function useNotes() {
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading, error, refetch } = useQuery({
    queryKey: ["notes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
  });

  const createNote = useMutation({
    mutationFn: async (note: Omit<NoteInsert, "user_id">) => {
      const { data, error } = await supabase.from("notes").insert([note] as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const updateNote = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: NoteUpdate }) => {
      const { data, error } = await supabase.from("notes").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return {
    notes,
    isLoading,
    error,
    refetch,
    createNote,
    updateNote,
    deleteNote,
  };
}
