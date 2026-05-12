import { format } from "date-fns";

export function toApiDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function toApiDateTime(date: Date) {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}

export function formatDisplayDate(date: string) {
  return new Date(date).toLocaleDateString("fr-FR");
}
