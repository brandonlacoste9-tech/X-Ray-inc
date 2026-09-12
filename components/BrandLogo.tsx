import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

export function BrandLogo({
  className,
  compact = false,
  inverted = false,
}: {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-3", className)}
      aria-label={`${site.shortName} home`}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold tracking-tight shadow-sm ring-1 transition",
          inverted
            ? "bg-white/10 text-white ring-teal-400/50 group-hover:ring-teal-300"
            : "bg-navy text-white ring-teal-500/40 group-hover:ring-teal-400",
        )}
      >
        {site.shortName.slice(0, 2)}
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-display text-xl font-bold tracking-wide",
            inverted ? "text-white" : "text-navy",
          )}
        >
          {site.shortName}
        </span>
        {!compact && (
          <span
            className={cn(
              "hidden text-[11px] font-medium sm:block",
              inverted ? "text-white/60" : "text-slate-muted",
            )}
          >
            {site.name}
          </span>
        )}
      </span>
    </Link>
  );
}
