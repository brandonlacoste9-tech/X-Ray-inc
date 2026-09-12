"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SearchHit = {
  slug: string;
  name: string;
  brand: string;
  stockNumber: string;
  variantStocks?: string[];
};

export function SearchBox({
  className,
  defaultValue = "",
  placeholder = "Search name, brand, or stock #",
  size = "default",
  catalog = [],
}: {
  className?: string;
  defaultValue?: string;
  placeholder?: string;
  size?: "default" | "lg";
  catalog?: SearchHit[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const deferred = useDeferredValue(q);

  const suggestions = useMemo(() => {
    const query = deferred.trim().toLowerCase();
    if (query.length < 2 || !catalog.length) return [];
    const scored: { hit: SearchHit; score: number; match: string }[] = [];
    for (const item of catalog) {
      const stocks = [item.stockNumber, ...(item.variantStocks || [])];
      const stockHit = stocks.find((s) => s.toLowerCase().includes(query));
      if (stockHit) {
        scored.push({
          hit: item,
          score: stockHit.toLowerCase().startsWith(query) ? 0 : 1,
          match: stockHit,
        });
        continue;
      }
      if (item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query)) {
        scored.push({ hit: item, score: 2, match: item.stockNumber });
      }
    }
    return scored.sort((a, b) => a.score - b.score).slice(0, 8);
  }, [deferred, catalog]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("relative w-full", className)}
      role="search"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-muted"
        aria-hidden
      />
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-label="Search products"
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
        className={cn("pl-9", size === "lg" && "h-12 text-base")}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border border-navy/15 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {suggestions.map(({ hit, match }) => (
            <li key={`${hit.slug}-${match}`} role="option">
              <Link
                href={`/products/${hit.slug}`}
                className="flex flex-col gap-0.5 px-3 py-2 hover:bg-clinical"
                onClick={() => setOpen(false)}
              >
                <span className="font-mono text-[11px] font-semibold text-teal-800">
                  #{match}
                </span>
                <span className="text-sm font-medium text-navy line-clamp-1">{hit.name}</span>
                <span className="text-xs text-slate-muted">{hit.brand}</span>
              </Link>
            </li>
          ))}
          <li>
            <button
              type="submit"
              className="w-full border-t border-navy/10 px-3 py-2 text-left text-xs font-semibold text-teal-700 hover:bg-clinical"
            >
              See all results for “{q.trim()}”
            </button>
          </li>
        </ul>
      )}
    </form>
  );
}
