import { useState } from "react";
import { useHabits } from "@/hooks/useHabits";
import { useAuth } from "@/contexts/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Plus, Activity, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { formatDate } from "@/lib/utils";

export default function HabitsPage() {
  const { user } = useAuth();
  const { habits, isLoading, createHabit, toggleHabitCompletion } = useHabits();
  const [open, setOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
          <p className="text-muted-foreground">Build consistency, one day at a time</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New Habit
        </Button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">Loading habits...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-20">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-medium">No habits yet</h3>
          <p className="text-muted-foreground">Create your first habit to start tracking</p>
          <Button onClick={() => setOpen(true)} className="mt-4">Add Habit</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {habits.map((habit) => {
            const completedToday = habit.completed_at === today;
            return (
              <Card key={habit.id} className="group relative">
                <CardContent className="pt-8 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{habit.icon}</span>
                      <span className="font-semibold">{habit.name}</span>
                    </div>
                    <button
                      onClick={() => toggleHabitCompletion({ habitId: habit.id, date: today, quantity: 1 })}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        completedToday ? "bg-green-500 text-white shadow-lg" : "border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      }`}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{habit.description || "No description"}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{habit.frequency}</span>
                    <span>{habit.target_quantity} {habit.target_unit}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Habit</DialogTitle>
            <DialogDescription>Build a habit that sticks</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const name = formData.get("name") as string;
              if (!name.trim()) return;
              createHabit.mutateAsync({
                name: name.trim(),
                description: formData.get("description") as string || null,
                icon: "🎯",
                category: "personal",
                frequency: "daily",
                target_quantity: 1,
                target_unit: "times",
              });
              setOpen(false);
              e.target.reset();
            }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="habit-name">Habit name</Label>
              <Input id="habit-name" name="name" placeholder="e.g. Drink 3L water" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-desc">Description</Label>
              <Input id="habit-desc" name="description" placeholder="Why this habit matters" />
            </div>
            <Button type="submit" className="w-full">
              Create Habit
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
