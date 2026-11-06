import {
  differenceInCalendarWeeks,
  endOfWeek,
  format,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { ar } from "date-fns/locale";

/** Egyptian week: Saturday → Friday */
export const WEEK_STARTS_ON = 6;

/**
 * @param {number} offset 0 = current week, -1 = last week, …
 * @returns {{ from: string, to: string }} YYYY-MM-DD
 */
export function getWeekRangeByOffset(offset = 0) {
  const weekOpts = { weekStartsOn: WEEK_STARTS_ON };
  const weeksBack = offset >= 0 ? 0 : -offset;
  const pivot = subWeeks(new Date(), weeksBack);
  return {
    from: format(startOfWeek(pivot, weekOpts), "yyyy-MM-dd"),
    to: format(endOfWeek(pivot, weekOpts), "yyyy-MM-dd"),
  };
}

/**
 * @param {Date} date
 * @returns {number}
 */
export function offsetFromDate(date) {
  const weekOpts = { weekStartsOn: WEEK_STARTS_ON };
  const selectedStart = startOfWeek(date, weekOpts);
  const currentStart = startOfWeek(new Date(), weekOpts);
  return differenceInCalendarWeeks(selectedStart, currentStart, weekOpts);
}

/**
 * @param {string} from YYYY-MM-DD
 * @param {string} to YYYY-MM-DD
 */
export function formatWeekRangeLabel(from, to) {
  const a = new Date(`${from}T12:00:00`);
  const b = new Date(`${to}T12:00:00`);
  const sameMonth =
    a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  if (sameMonth) {
    return `${format(a, "d", { locale: ar })}–${format(b, "d MMMM yyyy", { locale: ar })}`;
  }
  return `${format(a, "d MMM", { locale: ar })} – ${format(b, "d MMM yyyy", { locale: ar })}`;
}
