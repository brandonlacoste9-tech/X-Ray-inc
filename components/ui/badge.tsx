import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "teal" | "outline" | "navy";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide",
      variant === "default" && "bg-navy/10 text-navy",
      variant === "teal" && "bg-teal-50 text-teal-800",
      variant === "navy" && "bg-navy text-white",
      variant === "outline" && "border border-navy/20 text-navy",
      className,
    )}
    {...props}
  />
));
Badge.displayName = "Badge";

export { Badge };
