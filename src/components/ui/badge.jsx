import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600 text-white",
        secondary: "border-transparent bg-gray-700 text-gray-200",
        destructive: "border-transparent bg-rose-600 text-white",
        outline: "border-gray-600 text-gray-300",
        success: "border-transparent bg-emerald-900/40 text-emerald-300",
        warning: "border-transparent bg-orange-900/40 text-orange-300",
        purple: "border-transparent bg-purple-900/40 text-purple-300",
        blue: "border-transparent bg-blue-900/40 text-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
