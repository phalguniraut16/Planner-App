import { startOfDay, endOfDay, startOfWeek, endOfWeek, isSameDay, format } from "date-fns";

export function dayRange(date: Date = new Date()) {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function weekRange(date: Date = new Date(), weekStartsOn: 0 | 1 = 1) {
  return { start: startOfWeek(date, { weekStartsOn }), end: endOfWeek(date, { weekStartsOn }) };
}

export function isToday(date: Date | string) {
  return isSameDay(new Date(date), new Date());
}

export function formatShort(date: Date | string) {
  return format(new Date(date), "dd MMM");
}

export function formatTime(date: Date | string) {
  return format(new Date(date), "HH:mm");
}
