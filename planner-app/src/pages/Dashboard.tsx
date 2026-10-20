import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useTasks } from "@/hooks/useTasks";
import { useHabits } from "@/hooks/useHabits";
import { useFinance } from "@/hooks/useFinance";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { habits } = useHabits();
  const { transactions, getTotals } = useFinance();

  const today = new Date().toISOString().split("T")[0];
  const completedToday = tasks.filter((t) => t.status === "completed").length;
  const pendingToday = tasks.filter((t) => t.status !== "completed").length;
  const overdue = tasks.filter(
    (t) => t.status !== "completed" && t.due_date && t.due_date < today
  ).length;
  const { income, expense, net } = getTotals();

  if (tasksLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-64 space-y-4 animate-pulse">
        <div className="h-4 w-24 rounded bg-muted"></div>
        <div className="h-4 w-48 rounded bg-muted"></div>
        <div className="h-32 w-full rounded bg-muted"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},
            {user?.user_metadata?.full_name?.split(" ")[0] || "there"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <a href="/tasks">New Task</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/habits">New Habit</a>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Tasks Completed" value={completedToday} icon={<CheckCircle className="h-5 w-5 text-green-500" />} trend="+12%" />
        <StatCard title="Pending" value={pendingToday} icon={<Clock className="h-5 w-5 text-orange-500" />} trend={overdue > 0 ? `-${overdue} overdue` : "On track"}/>
        <StatCard title="Overdue" value={overdue} icon={<Calendar className="h-5 w-5 text-red-500" />} trend={overdue > 0 ? "Needs attention" : "All clear"}/>
        <StatCard title="Net Balance" value={formatCurrency(net / 100, "INR")} icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} trend="This month" />
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Tasks</CardTitle>
              <CardDescription>{pendingToday} pending, {completedToday} completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.slice(0, 6).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => {}}
                        className="rounded border-gray-600 text-green-500 focus:ring-green-500"
                      />
                      <span className={task.status === "completed" ? "line-through text-muted-foreground" : "text-foreground"}>
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{task.due_date || "No date"}</span>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No tasks yet. Add your first task!</div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm">
                <a href="/tasks">View all tasks</a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Habits</CardTitle>
              <CardDescription>Track your daily habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habits.slice(0, 4).map((habit) => (
                  <div key={habit.id} className="flex items-center justify-between p-2 rounded-lg border bg-background/50">
                    <span className="text-sm">{habit.icon} {habit.name}</span>
                    <button className="w-6 h-6 rounded-full border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                      ✓
                    </button>
                  </div>
                ))}
                {habits.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">No habits yet</div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href="/habits">Manage habits</a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Finance Overview</CardTitle>
              <CardDescription>Income vs Expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="text-green-500 font-medium">{formatCurrency(income / 100, "INR")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Expenses</span>
                <span className="text-red-500 font-medium">{formatCurrency(expense / 100, "INR")}</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: income > 0 ? Math.min(100, (net / income) * 100) : 0 }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Notes</CardTitle>
          <CardDescription>Recent ideas and thoughts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">No recent notes</span>
            <Button asChild variant="ghost" size="sm">
              <a href="/notes">View notes</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: React.ReactNode; icon: React.ReactNode; trend: string }) {
  return (
    <Card className="p-4">
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{title}</p>
            <div className="text-2xl font-bold">{value}</div>
          </div>
          <div className="p-2 rounded-lg bg-accent/10 text-accent-foreground">{icon}</div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{trend}</p>
      </CardContent>
    </Card>
  );
}
