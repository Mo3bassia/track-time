import { useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { parseISO } from "date-fns";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  WEEK_STARTS_ON,
  formatWeekRangeLabel,
  getWeekRangeByOffset,
  offsetFromDate,
} from "../lib/weekRange";

/**
 * Week navigator (Sat–Fri) with optional calendar picker.
 *
 * @param {{
 *   offset: number,
 *   onOffsetChange: (offset: number) => void,
 *   from: string,
 *   to: string,
 *   className?: string,
 * }} props
 */
export function WeekRangeNav({
  offset,
  onOffsetChange,
  from,
  to,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const selected = from ? parseISO(from) : undefined;
  const canGoForward = offset < 0;

  return (
    <div
      className={`flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/40 p-1.5 ${className}`}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-xl"
        onClick={() => onOffsetChange(offset - 1)}
        aria-label="الأسبوع السابق"
      >
        <ChevronRight className="size-4" />
      </Button>

      <div className="min-w-0 flex-1 px-1 text-center">
        <p className="text-sm font-semibold tracking-tight">
          {from && to ? formatWeekRangeLabel(from, to) : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {offset === 0
            ? "هذا الأسبوع"
            : offset === -1
              ? "الأسبوع الماضي"
              : `منذ ${Math.abs(offset)} أسابيع`}
        </p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 rounded-xl"
            aria-label="اختيار أسبوع"
          >
            <CalendarIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-auto rounded-2xl p-0">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              if (!date) return;
              onOffsetChange(Math.min(0, offsetFromDate(date)));
              setOpen(false);
            }}
            weekStartsOn={WEEK_STARTS_ON}
            disabled={{ after: new Date() }}
            className="rounded-2xl"
          />
          <p className="border-t border-border px-3 py-2 text-center text-[11px] text-muted-foreground">
            اختر أي يوم من الأسبوع المطلوب (سبت–جمعة)
          </p>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0 rounded-xl"
        disabled={!canGoForward}
        onClick={() => onOffsetChange(Math.min(0, offset + 1))}
        aria-label="الأسبوع التالي"
      >
        <ChevronLeft className="size-4" />
      </Button>
    </div>
  );
}

export { getWeekRangeByOffset };
