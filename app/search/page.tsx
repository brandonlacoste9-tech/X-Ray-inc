import Link from "next/link";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryFilters } from "@/components/CategoryFilters";
import { ProductCard } from "@/components/ProductCard";
import { SearchBox } from "@/components/SearchBox";
import {
  collectLeadEqOptions,
  getAllBrands,
  getSubcategories,
  searchProducts,
} from "@/lib/catalog";
import { getSearchIndex } from "@/lib/search-index";

type Props = {
  searchParams: Promise<{ q?: string; brand?: string; sub?: string; lead?: string }>;
};

export const metadata = {
  title: "Search",
  description: "Search PNWX products by name, brand, or stock number.",
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", brand, sub, lead } = await searchParams;
  let results = q ? searchProducts(q) : [];
  if (brand) results = results.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  if (sub) results = results.filter((p) => p.subcategory === sub);
  if (lead) {
    const needle = lead.toLowerCase();
    results = results.filter((p) =>
      `${p.name} ${p.description} ${p.options?.flatMap((o) => o.values).join(" ")}`
        .toLowerCase()
        .includes(needle.replace(" pb", "")),
    );
  }

  const brands = [...new Set((q ? searchProducts(q) : []).map((p) => p.brand))].sort();
  const subcategories = [...new Set((q ? searchProducts(q) : []).map((p) => p.subcategory))].sort();
  const leadEqOptions = collectLeadEqOptions(q ? searchProducts(q) : []);
  const catalog = getSearchIndex();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <h1 className="font-display text-3xl font-bold text-navy">Search</h1>
      <p className="mt-2 text-sm text-slate-600">
        Match product name, brand, or stock number. Autocomplete highlights stock # hits.
      </p>
      <div className="mt-6 max-w-xl">
        <SearchBox defaultValue={q} size="lg" catalog={catalog} />
      </div>

      {q && (
        <p className="mt-6 text-sm text-slate-muted">
          {results.length} result{results.length === 1 ? "" : "s"} for “{q}”
        </p>
      )}

      {q ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <Suspense fallback={null}>
            <CategoryFilters
              brands={brands.length ? brands : getAllBrands()}
              subcategories={subcategories.length ? subcategories : getSubcategories()}
              leadEqOptions={leadEqOptions}
              basePath={`/search?q=${encodeURIComponent(q)}`}
            />
          </Suspense>
          <div>
            {results.length === 0 ? (
              <div className="rounded-lg border border-dashed border-navy/20 bg-white p-8 text-center">
                <p className="text-navy">No matches for these filters.</p>
                <p className="mt-2 text-sm text-slate-muted">
                  <Link href="/contact" className="text-teal-700 hover:underline">
                    Contact sales
                  </Link>{" "}
                  with the stock # if you have it.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
