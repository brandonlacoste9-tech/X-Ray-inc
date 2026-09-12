import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { primaryCategories, hubCategories, brandHubs } from "@/lib/data/categories";
import { getAllProducts } from "@/lib/catalog";

export const metadata = {
  title: "Catalog",
  description: "PNWX radiology supply catalog — accessories, equipment, parts, supplies, and brand hubs.",
};

export default function CatalogPage() {
  const count = getAllProducts().length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Catalog" }]} />
      <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">Product catalog</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Dealer catalog structure from www2.pnwx.com — {count} seeded representative SKUs in this
        rebuild (full historical catalog ~6,800 SKUs). Use search for stock numbers.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {primaryCategories.map((cat) => (
          <section
            key={cat.slug}
            className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm"
          >
            <Link
              href={cat.href}
              className="font-display text-xl font-bold text-navy hover:text-teal-700"
            >
              {cat.name}
            </Link>
            <p className="mt-2 text-sm text-slate-600">{cat.description}</p>
            <ul className="mt-4 columns-1 gap-x-6 space-y-1.5 sm:columns-2">
              {cat.children?.map((child) => (
                <li key={child.slug} className="break-inside-avoid">
                  <Link
                    href={child.href}
                    className="text-sm text-slate-700 hover:text-teal-700"
                  >
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy">High-traffic hubs</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hubCategories.map((h) => (
            <Link
              key={h.slug}
              href={h.href}
              className="rounded-lg border border-navy/10 bg-white px-4 py-4 hover:border-teal-600/40"
            >
              <p className="font-semibold text-navy">{h.name}</p>
              <p className="mt-1 text-xs text-slate-muted">{h.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy">Brands</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {brandHubs.map((b) => (
            <Link
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="rounded-md bg-navy px-3 py-1.5 text-sm font-medium text-white hover:bg-navy-mid"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
