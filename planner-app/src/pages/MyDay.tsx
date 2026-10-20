import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useTasks } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Sun, Moon, Clock, CheckCircle, Flag, Brain } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function MyDay() {
  const { user } = useAuth();
  const { tasks, toggleTask } = useTasks();
  const [priorities, setPriorities] = useState<string[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter(
    (t) => (!t.due_date || t.due_date === today) && t.status !== "completed"
  );
  const completedToday = tasks.filter((t) => t.status === "completed").length;

  const handlePriorityToggle = (id: string) => {
    setPriorities((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Day</h1>
          <p className="text-muted-foreground">{formatDate(new Date())}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Light mode">
            <Sun className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Dark mode">
            <Moon className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Priorities</CardTitle>
                <CardDescription>Pick your 3 most important tasks</CardDescription>
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {priorities.length}/3
              </span>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors group">
                    <Checkbox
                      checked={priorities.includes(task.id)}
                      onChange={() => handlePriorityToggle(task.id)}
                      aria-label={`Mark ${task.title} as priority`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-xs text-muted-foreground">{task.category || "General"}</div>
                    </div>
                  </div>
                ))}
                {todayTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No tasks for today</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tasks Due Today</CardTitle>
              <CardDescription>{completedToday} completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.status === "completed"}
                        onChange={() => toggleTask(task)}
                        aria-label={`Complete ${task.title}`}
                      />
                      <span className={task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{task.priority || "medium"}</span>
                  </div>
                ))}
                {todayTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">All caught up!</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Intentions</CardTitle>
              <CardDescription>What do you want to achieve today?</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex flex-col">
              <textarea
                className="flex-1 w-full bg-transparent border-none resize-none focus:ring-0 text-sm text-foreground leading-relaxed"
                placeholder="Write your intentions for today..."
              />
              <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline">Save intentions</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Capture</CardTitle>
              <CardDescription>Jot down a quick thought</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" size="icon" className="h-10">
                  <Brain className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-10">
                  <Flag className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-10">
                  <Clock className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-10">
                  <CheckCircle className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => {}}>End of Day Review</Button>
      </div>
    </div>
  );
}
