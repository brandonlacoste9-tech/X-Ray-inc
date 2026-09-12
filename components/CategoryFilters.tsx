"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoryFilters({
  brands,
  subcategories,
  leadEqOptions = [],
  basePath,
}: {
  brands: string[];
  subcategories: string[];
  leadEqOptions?: string[];
  basePath: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const brand = params.get("brand") || "";
  const sub = params.get("sub") || "";
  const lead = params.get("lead") || "";

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <aside className="space-y-6 rounded-lg border border-navy/10 bg-white p-4 shadow-sm">
      <div>
        <h2 className="font-display text-sm font-bold tracking-wide text-navy">Brand</h2>
        <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto">
          <li>
            <FilterBtn active={!brand} onClick={() => setFilter("brand", "")}>
              All brands
            </FilterBtn>
          </li>
          {brands.map((b) => (
            <li key={b}>
              <FilterBtn active={brand === b} onClick={() => setFilter("brand", b)}>
                {b}
              </FilterBtn>
            </li>
          ))}
        </ul>
      </div>

      {subcategories.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-bold tracking-wide text-navy">
            Subcategory
          </h2>
          <ul className="mt-3 space-y-1">
            <li>
              <FilterBtn active={!sub} onClick={() => setFilter("sub", "")}>
                All
              </FilterBtn>
            </li>
            {subcategories.map((s) => (
              <li key={s}>
                <FilterBtn
                  active={sub === s}
                  onClick={() => setFilter("sub", s)}
                  className="capitalize"
                >
                  {s.replace(/-/g, " ")}
                </FilterBtn>
              </li>
            ))}
          </ul>
        </div>
      )}

      {leadEqOptions.length > 0 && (
        <div>
          <h2 className="font-display text-sm font-bold tracking-wide text-navy">
            Lead equivalence
          </h2>
          <ul className="mt-3 space-y-1">
            <li>
              <FilterBtn active={!lead} onClick={() => setFilter("lead", "")}>
                Any
              </FilterBtn>
            </li>
            {leadEqOptions.map((l) => (
              <li key={l}>
                <FilterBtn active={lead === l} onClick={() => setFilter("lead", l)}>
                  {l}
                </FilterBtn>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href={basePath} className="text-xs font-medium text-teal-700 hover:underline">
        Clear filters
      </Link>
    </aside>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded px-2 py-1.5 text-left text-sm",
        active ? "bg-teal-50 font-semibold text-teal-800" : "text-slate-600 hover:bg-clinical",
        className,
      )}
    >
      {children}
    </button>
  );
}
