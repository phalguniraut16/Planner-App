"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Plus, Search, Calendar, Trash2, Edit3 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-green-500" },
  { value: "medium", label: "Medium", color: "text-amber-500" },
  { value: "high", label: "High", color: "text-orange-500" },
  { value: "urgent", label: "Urgent", color: "text-red-500" },
];

export default function TasksPage() {
  const { tasks, isLoading, createTask, toggleTask, deleteTask, updateTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "active") return matchesSearch && t.status !== "completed";
    if (filter === "completed") return matchesSearch && t.status === "completed";
    return matchesSearch;
  });

  const handleCreate = async (title: string) => {
    if (!title.trim()) return;
    await createTask.mutateAsync({
      title: title.trim(),
      category: "general",
      priority: "medium",
      status: "not_started",
    });
    setOpen(false);
  };

  const handleToggle = async (task: any) => {
    await toggleTask.mutateAsync(task);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your daily tasks and to-dos</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New Task
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { value: "all", label: "All" },
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
              filter === item.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input hover:bg-accent"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No tasks found</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredTasks.map((task) => (
                <div key={task.id} className="group p-4 flex items-center justify-between gap-3 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={task.status === "completed"}
                      onChange={() => handleToggle(task)}
                      aria-label={`Mark ${task.title} as complete`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className={task.status === "completed" ? "line-through text-muted-foreground" : "font-medium truncate"}>
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(task.due_date || new Date())}</span>
                        <span className="h-px w-px bg-border mx-1" />
                        <span className={`text-xs font-medium ${PRIORITIES.find((p) => p.value === task.priority)?.color}`}>
                          {PRIORITIES.find((p) => p.value === task.priority)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(task.id);
                        setEditTitle(task.title);
                      }}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>Add a task to your list</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const title = (e.target as HTMLFormElement("title") as HTMLInputElement).value;
              handleCreate(title);
            }}
            className="space-y-4 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" placeholder="What needs to be done?" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select id="priority" name="priority" defaultValue="medium">
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create Task
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {editingId && (
        <Card className="fixed bottom-8 right-8 w-80 z-50 shadow-xl animate-in fade-in zoom-in">
          <CardHeader>
            <CardTitle>Edit Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={() => setEditingId(null)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const task = tasks.find((t) => t.id === editingId);
                  if (task) {
                    await updateTask.mutateAsync({ id: task.id, updates: { title: editTitle } });
                    setEditingId(null);
                  }
                }}
                size="sm"
              >
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
