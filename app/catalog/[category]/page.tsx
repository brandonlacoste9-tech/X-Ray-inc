import { notFound } from "next/navigation";
import { ProductListing } from "@/components/ProductListing";
import {
  categoryFilters,
  collectLeadEqOptions,
  filterProductsForRoute,
} from "@/lib/catalog";
import {
  getCategoryBySlug,
  primaryCategories,
  hubCategories,
} from "@/lib/data/categories";

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ brand?: string; sub?: string; lead?: string }>;
};

const knownSlugs = new Set([
  ...Object.keys(categoryFilters),
  ...primaryCategories.map((c) => c.slug),
  ...hubCategories.map((c) => c.slug),
]);

export async function generateStaticParams() {
  return [...knownSlugs].map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const meta = getCategoryBySlug(category);
  return {
    title: meta?.name ?? category.replace(/-/g, " "),
    description: meta?.description,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { brand, sub, lead } = await searchParams;

  if (!knownSlugs.has(category)) notFound();

  const meta = getCategoryBySlug(category) ?? {
    name: category.replace(/-/g, " "),
    description: undefined as string | undefined,
    href: `/catalog/${category}`,
    slug: category,
  };

  const products = filterProductsForRoute(category, {
    brand,
    subcategory: sub,
    lead,
  });

  const pool = filterProductsForRoute(category);
  const brands = [...new Set(pool.map((p) => p.brand))].sort();
  const subcategories = [...new Set(pool.map((p) => p.subcategory))].sort();
  const leadEqOptions = collectLeadEqOptions(pool);

  return (
    <ProductListing
      title={meta.name}
      description={meta.description}
      products={products}
      crumbs={[
        { label: "Catalog", href: "/catalog" },
        { label: meta.name },
      ]}
      brands={brands}
      subcategories={subcategories}
      leadEqOptions={leadEqOptions}
      basePath={`/catalog/${category}`}
    />
  );
}
