import { useState } from "react";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, FileText, Pin, Search } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotesPage() {
  const { notes, isLoading, createNote, deleteNote, updateNote } = useNotes();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = notes.filter(
    (n) =>
      !n.is_archived &&
      (n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.content?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Save ideas, thoughts, and important information</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Note
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Loading notes...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-medium">No notes yet</h3>
          <p className="text-muted-foreground">Create your first note</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => (
            <Card key={note.id} className="group cursor-pointer hover:border-primary transition-colors">
              <CardContent className="pt-6 pb-4">
                <div className="flex justify-between items-start mb-3">
                  {note.is_pinned && (
                    <span className="text-amber-500" title="Pinned">
                      <Pin className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <h3 className="font-semibold line-clamp-1">{note.title || "Untitled"}</h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {note.content || ""}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDate(note.updated_at)}</span>
                  <button
                    onClick={() => deleteNote.mutateAsync(note.id)}
                    className="text-destructive hover:bg-destructive/10 rounded p-1"
                  >
                    ×
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Note</DialogTitle>
            <DialogDescription>Write something down</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createNote.mutateAsync({
                title: formData.get("title") as string || null,
                content: formData.get("content") as string || null,
                is_pinned: false,
                is_archived: false,
                tags: [],
              });
              setOpen(false);
              (e.target as HTMLFormElement).reset();
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input id="note-title" name="title" placeholder="Note title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea id="note-content" name="content" placeholder="Write your note..." />
            </div>
            <Button type="submit" className="w-full">
              Save Note
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, Label } from "@/components/ui/Dialog";
