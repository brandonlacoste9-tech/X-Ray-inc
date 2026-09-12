import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryFilters } from "@/components/CategoryFilters";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export function ProductListing({
  title,
  description,
  products,
  crumbs,
  brands,
  subcategories,
  leadEqOptions = [],
  basePath,
  intro,
}: {
  title: string;
  description?: string;
  products: Product[];
  crumbs: { label: string; href?: string }[];
  brands: string[];
  subcategories: string[];
  leadEqOptions?: string[];
  basePath: string;
  intro?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={crumbs} />
      <div className="mb-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
        )}
        <p className="mt-2 text-sm text-slate-muted">
          {products.length} product{products.length === 1 ? "" : "s"} · Stock # searchable ·{" "}
          <Link href="/quote" className="font-medium text-teal-700 hover:underline">
            Request quote
          </Link>
        </p>
      </div>

      {intro}

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-white" />}>
          <CategoryFilters
            brands={brands}
            subcategories={subcategories}
            leadEqOptions={leadEqOptions}
            basePath={basePath}
          />
        </Suspense>
        <div>
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-navy/20 bg-white p-10 text-center">
              <p className="text-navy">No products match these filters.</p>
              <p className="mt-2 text-sm text-slate-muted">
                <Link href={basePath} className="text-teal-700 hover:underline">
                  Clear filters
                </Link>{" "}
                or{" "}
                <Link href="/contact" className="text-teal-700 hover:underline">
                  contact sales
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
