import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, opts: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    ...opts,
  }).format(new Date(date));
}

export function formatRelative(date: string | Date) {
  return new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
    Math.floor((new Date(date).getTime() - Date.now()) / 86400000),
    "day"
  );
}
