import { cn } from "../../lib/utils";
import { Input } from "./input";

/**
 * value: "HH:mm" 
 * onChange: (value: string) => void
 */
export function TimePicker({
  id,
  value,
  onChange,
  className,
  disabled,
  required,
  step = 60,
}) {
  return (
    <Input
      type="time"
      id={id}
      step={step}
      value={value || ""}
      disabled={disabled}
      required={required}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "bg-gray-700 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
        className,
      )}
    />
  );
}
