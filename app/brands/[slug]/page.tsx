import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { brandHubs, getBrandBySlug } from "@/lib/data/categories";
import { getProductsByBrand } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return brandHubs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  return {
    title: brand ? `${brand.name} products` : "Brand",
    description: brand?.description,
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);
  if (!brand) notFound();

  const products = getProductsByBrand(brand.name);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          { label: "Brands", href: "/catalog" },
          { label: brand.name },
        ]}
      />
      <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
        {brand.name}
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">{brand.description}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {brand.specialties.map((s) => (
          <li
            key={s}
            className="rounded-md border border-navy/15 bg-white px-2.5 py-1 text-xs font-medium text-navy"
          >
            {s}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy">
          Products in this rebuild
        </h2>
        {products.length === 0 ? (
          <p className="mt-4 text-sm text-slate-muted">
            No seeded SKUs yet for this brand.{" "}
            <Link href="/contact" className="text-teal-700 hover:underline">
              Contact sales
            </Link>{" "}
            for the full line.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
