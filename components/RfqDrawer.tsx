"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, Plus, X } from "lucide-react";
import { useRfq } from "@/lib/rfq/RfqProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function RfqDrawer() {
  const { lines, removeLine, updateQty, count, clear } = useRfq();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative inline-flex h-9 items-center gap-1.5 rounded-md border border-navy/15 bg-white px-3 text-sm font-semibold text-navy hover:border-teal-600/40"
        aria-label={`Quote list, ${count} items`}
      >
        <ClipboardList className="size-4" aria-hidden />
        <span className="hidden sm:inline">Quote list</span>
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">
            {count}
          </span>
        )}
      </button>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <button
          type="button"
          className={cn(
            "absolute inset-0 bg-navy/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
          aria-label="Close quote list"
        />
        <aside
          className={cn(
            "absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform",
            open ? "translate-x-0" : "translate-x-full",
          )}
          role="dialog"
          aria-label="Quote request list"
        >
          <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3">
            <div>
              <p className="font-display text-lg font-bold text-navy">Quote list</p>
              <p className="text-xs text-slate-muted">{count} SKU{count === 1 ? "" : "s"}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {lines.length === 0 ? (
              <p className="text-sm text-slate-600">
                Add stock numbers from product pages. Submit as one quote when ready.
              </p>
            ) : (
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li
                    key={line.stockNumber}
                    className="rounded-md border border-navy/10 bg-clinical/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-teal-800">
                          #{line.stockNumber}
                        </p>
                        <p className="truncate text-sm font-medium text-navy">{line.name}</p>
                      </div>
                      <button
                        type="button"
                        className="text-slate-muted hover:text-navy"
                        onClick={() => removeLine(line.stockNumber)}
                        aria-label={`Remove ${line.stockNumber}`}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-slate-muted" htmlFor={`qty-${line.stockNumber}`}>
                        Qty
                      </label>
                      <Input
                        id={`qty-${line.stockNumber}`}
                        value={line.qty}
                        onChange={(e) => updateQty(line.stockNumber, e.target.value)}
                        className="h-8 w-24"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2 border-t border-navy/10 p-4">
            {lines.length > 0 && (
              <Button variant="ghost" size="sm" className="w-full" onClick={clear}>
                Clear list
              </Button>
            )}
            <Button asChild size="lg" className="w-full" disabled={count === 0}>
              <Link href="/quote" onClick={() => setOpen(false)}>
                Request quote for list
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}

export function AddToQuoteButton({
  stockNumber,
  name,
  slug,
  className,
}: {
  stockNumber: string;
  name: string;
  slug?: string;
  className?: string;
}) {
  const { addLine } = useRfq();
  const [added, setAdded] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={() => {
        addLine({ stockNumber, name, slug, qty: "1" });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      <Plus className="size-4" aria-hidden />
      {added ? "Added to quote list" : "Add to quote list"}
    </Button>
  );
}
