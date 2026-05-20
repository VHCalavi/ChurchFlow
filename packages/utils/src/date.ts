import { format, parseISO } from "date-fns";

export function formatDate(date: Date | string, formatStr: string = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}
