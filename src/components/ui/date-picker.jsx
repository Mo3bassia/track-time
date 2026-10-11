import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * value: "YYYY-MM-DD" string or ""
 * onChange: (value: "YYYY-MM-DD") => void
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "اختر تاريخ",
  id,
  className,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  const selected =
    value && isValid(parseISO(value)) ? parseISO(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal border-input bg-muted text-foreground hover:bg-muted hover:text-foreground",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          {selected
            ? format(selected, "d MMMM yyyy", { locale: ar })
            : placeholder}
          <CalendarIcon className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto overflow-hidden p-0 bg-card border-input"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) {
              onChange?.("");
              return;
            }
            onChange?.(format(date, "yyyy-MM-dd"));
            setOpen(false);
          }}
          defaultMonth={selected}
        />
      </PopoverContent>
    </Popover>
  );
}
