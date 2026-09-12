import { notFound } from "next/navigation";
import { ProductListing } from "@/components/ProductListing";
import {
  categoryFilters,
  filterProductsForRoute,
} from "@/lib/catalog";
import { getCategoryBySlug, primaryCategories } from "@/lib/data/categories";

type Props = {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{ brand?: string; sub?: string }>;
};

export async function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = [];
  for (const cat of primaryCategories) {
    for (const child of cat.children ?? []) {
      // child href may be /catalog/lead-protection — skip non-nested
      if (child.href.startsWith(`/catalog/${cat.slug}/`)) {
        params.push({ category: cat.slug, subcategory: child.slug });
      }
    }
  }
  // Explicit nested routes from filter map
  const nested = [
    "grids",
    "collimators",
    "collimator-lamps",
    "hv-cables",
    "darkroom-equipment",
    "digital-portable",
    "exam-room-equipment",
    "film-viewing",
    "patient-care",
    "portable-xray",
    "test-equipment",
    "darkroom",
    "exam-room",
    "film-id-markers",
    "cassettes-storage-viewing",
    "mri-accessories",
    "patient-positioning",
    "seating",
    "tech-aides",
    "ultrasound",
    "cleaners",
    "covers-gowns",
    "labels-jackets",
    "mri-consumables",
    "decon-wipes",
  ];
  for (const sub of nested) {
    const parent =
      primaryCategories.find((c) => c.children?.some((ch) => ch.slug === sub))
        ?.slug ?? "parts";
    if (!params.some((p) => p.category === parent && p.subcategory === sub)) {
      // determine parent from known structure
    }
  }
  // Hard-code known nested pairs
  const pairs: [string, string][] = [
    ["parts", "grids"],
    ["parts", "collimators"],
    ["parts", "collimator-lamps"],
    ["parts", "hv-cables"],
    ["equipment", "darkroom-equipment"],
    ["equipment", "digital-portable"],
    ["equipment", "exam-room-equipment"],
    ["equipment", "film-viewing"],
    ["equipment", "patient-care"],
    ["equipment", "portable-xray"],
    ["equipment", "test-equipment"],
    ["accessories", "darkroom"],
    ["accessories", "exam-room"],
    ["accessories", "film-id-markers"],
    ["accessories", "cassettes-storage-viewing"],
    ["accessories", "mri-accessories"],
    ["accessories", "patient-positioning"],
    ["accessories", "seating"],
    ["accessories", "tech-aides"],
    ["accessories", "ultrasound"],
    ["supplies", "cleaners"],
    ["supplies", "covers-gowns"],
    ["supplies", "labels-jackets"],
    ["supplies", "mri-consumables"],
    ["supplies", "decon-wipes"],
  ];
  return pairs.map(([category, subcategory]) => ({ category, subcategory }));
}

export async function generateMetadata({ params }: Props) {
  const { subcategory } = await params;
  const meta = getCategoryBySlug(subcategory);
  return {
    title: meta?.name ?? subcategory,
    description: meta?.description,
  };
}

export default async function SubcategoryPage({ params, searchParams }: Props) {
  const { category, subcategory } = await params;
  const { brand, sub } = await searchParams;

  if (!categoryFilters[subcategory] && !getCategoryBySlug(subcategory)) {
    notFound();
  }

  const parent = getCategoryBySlug(category);
  const meta = getCategoryBySlug(subcategory) ?? {
    name: subcategory.replace(/-/g, " "),
    description: "",
    slug: subcategory,
    href: `/catalog/${category}/${subcategory}`,
  };

  const products = filterProductsForRoute(subcategory, {
    brand,
    subcategory: sub,
  });

  const brands = [...new Set(products.map((p) => p.brand))].sort();
  const subcategories = [...new Set(products.map((p) => p.subcategory))].sort();

  return (
    <ProductListing
      title={meta.name}
      description={meta.description}
      products={products}
      crumbs={[
        { label: "Catalog", href: "/catalog" },
        { label: parent?.name ?? category, href: `/catalog/${category}` },
        { label: meta.name },
      ]}
      brands={brands}
      subcategories={subcategories}
      basePath={`/catalog/${category}/${subcategory}`}
    />
  );
}
