import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function CalendarPage() {
  const [view, setView] = useState<"month" | "week" | "day">("month" as const);

  const monthDays = Array.from({ length: 30 }, (_, i) => i + 1);
  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View and manage your schedule</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Today">
            <CalendarIcon className="h-5 w-5" />
          </Button>
          <Button asChild>
            <a href="/events">New Event</a>
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["month", "week", "day"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              view === v ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-accent"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {monthDays.map((day) => (
          <div
            key={day}
            className={`aspect-square flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-sm transition-colors hover:bg-accent cursor-pointer ${
              day === today ? "bg-primary text-primary-foreground" : "text-foreground"
            }`}
          >
            <div>{day}</div>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background/50">
                <Clock className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Team standup</div>
                  <div className="text-xs text-muted-foreground">9:00 AM - 9:30 AM</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-background/50">
                <Clock className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Gym session</div>
                  <div className="text-xs text-muted-foreground">6:00 PM - 7:00 PM</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border bg-background/50">
                <div className="font-medium">Project deadline</div>
                <div className="text-xs text-muted-foreground">Tomorrow · 5:00 PM</div>
              </div>
              <div className="p-3 rounded-lg border bg-background/50">
                <div className="font-medium">Dentist appointment</div>
                <div className="text-xs text-muted-foreground">Friday · 2:00 PM</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Add</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full" variant="outline">
              <a href="/events">
                <Plus className="h-4 w-4 mr-2" /> New Event
              </a>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <a href="/tasks">
                <Plus className="h-4 w-4 mr-2" /> New Task
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
