import { products } from "@/lib/data/products";
import type { Product } from "@/lib/types";

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(
    (p) => p.category === category || p.subcategory === category,
  );
}

export function getProductsByBrand(brand: string): Product[] {
  const q = brand.toLowerCase();
  return products.filter((p) => p.brand.toLowerCase() === q);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter(
      (p) =>
        p.slug !== product.slug &&
        (p.category === product.category ||
          p.brand === product.brand ||
          p.subcategory === product.subcategory),
    )
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) => {
    const hay = [
      p.name,
      p.brand,
      p.stockNumber,
      p.category,
      p.subcategory,
      p.description,
      ...p.tags,
      ...(p.variants?.map((v) => v.stockNumber) ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q) || q.split(/\s+/).every((token) => hay.includes(token));
  });
}

export function getAllBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))].sort();
}

export function getSubcategories(category?: string): string[] {
  const list = category
    ? products.filter((p) => p.category === category)
    : products;
  return [...new Set(list.map((p) => p.subcategory))].sort();
}

/** Map URL category slugs to product category / filter */
export const categoryFilters: Record<
  string,
  { category?: string; subcategory?: string; tags?: string[] }
> = {
  accessories: { category: "accessories" },
  equipment: { category: "equipment" },
  parts: { category: "parts" },
  supplies: { category: "supplies" },
  "lead-protection": { category: "lead-protection" },
  "phantoms-qa": { category: "phantoms-qa" },
  "mri-safe": { category: "mri-safe" },
  veterinary: { category: "veterinary" },
  darkroom: { subcategory: "darkroom" },
  "exam-room": { subcategory: "exam-room" },
  "film-id-markers": { subcategory: "film-id-markers" },
  "cassettes-storage-viewing": { subcategory: "cassettes-storage-viewing" },
  "mri-accessories": { tags: ["mri"] },
  "patient-positioning": { subcategory: "patient-positioning" },
  seating: { subcategory: "seating" },
  "tech-aides": { subcategory: "tech-aides" },
  ultrasound: { subcategory: "ultrasound" },
  "darkroom-equipment": { subcategory: "darkroom-equipment" },
  "digital-portable": { subcategory: "digital-portable" },
  "exam-room-equipment": { subcategory: "exam-room-equipment" },
  "film-viewing": { subcategory: "film-viewing" },
  "patient-care": { subcategory: "patient-care" },
  "portable-xray": { subcategory: "portable-xray" },
  "test-equipment": { subcategory: "test-equipment" },
  grids: { subcategory: "grids" },
  collimators: { subcategory: "collimators" },
  "collimator-lamps": { subcategory: "collimator-lamps" },
  "hv-cables": { subcategory: "hv-cables" },
  cleaners: { subcategory: "cleaners" },
  "covers-gowns": { subcategory: "covers-gowns" },
  "labels-jackets": { subcategory: "labels-jackets" },
  "mri-consumables": { subcategory: "consumables" },
  "decon-wipes": { subcategory: "decon-wipes" },
};

export function filterProductsForRoute(
  slug: string,
  opts?: { brand?: string; subcategory?: string; lead?: string },
): Product[] {
  const rule = categoryFilters[slug];
  let list = products;

  if (rule) {
    list = list.filter((p) => {
      if (rule.category && p.category !== rule.category) {
        if (slug === "accessories") {
          return ["accessories", "lead-protection", "phantoms-qa", "mri-safe", "veterinary"].includes(
            p.category,
          );
        }
        return false;
      }
      if (rule.subcategory && p.subcategory !== rule.subcategory) return false;
      if (rule.tags?.length && !rule.tags.some((t) => p.tags.includes(t) || p.category.includes(t))) {
        return false;
      }
      return true;
    });
  }

  if (opts?.brand) {
    list = list.filter((p) => p.brand.toLowerCase() === opts.brand!.toLowerCase());
  }
  if (opts?.subcategory) {
    list = list.filter((p) => p.subcategory === opts.subcategory);
  }
  if (opts?.lead) {
    const needle = opts.lead.toLowerCase();
    list = list.filter((p) => {
      const hay = [
        p.name,
        p.description,
        ...(p.options?.flatMap((o) => o.values) ?? []),
        ...(p.variants?.map((v) => v.label) ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(needle.replace(" pb", "")) || hay.includes(needle);
    });
  }

  return list;
}

export function collectLeadEqOptions(list: Product[]): string[] {
  const set = new Set<string>();
  for (const p of list) {
    for (const o of p.options || []) {
      if (/lead/i.test(o.name)) o.values.forEach((v) => set.add(v));
    }
    const hay = `${p.name} ${p.description}`;
    for (const m of hay.matchAll(/0\.(25|35|50)\s*mm/gi)) {
      set.add(`0.${m[1]} mm Pb`);
    }
  }
  return [...set].sort();
}
