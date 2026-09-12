import { getAllProducts } from "@/lib/catalog";
import type { SearchHit } from "@/components/SearchBox";

/** Compact catalog index for client autocomplete */
export function getSearchIndex(): SearchHit[] {
  return getAllProducts().map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    stockNumber: p.stockNumber,
    variantStocks: p.variants?.map((v) => v.stockNumber),
  }));
}
