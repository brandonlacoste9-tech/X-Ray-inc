import type { Product } from "@/lib/types";
import generated from "@/lib/data/products.generated.json";
import { seedProducts } from "@/lib/data/products.seed";

/**
 * Scraped catalog from www2.pnwx.com when present; otherwise seed SKUs.
 * Refresh: `npm run crawl:pnwx` then `npm run import:pnwx`
 */
const scraped = generated as Product[];

function mergeCatalog(scrapedList: Product[], seed: Product[]): Product[] {
  if (!scrapedList.length) return seed;
  const stocks = new Set(
    scrapedList.flatMap((p) => [
      p.stockNumber.toUpperCase(),
      ...(p.variants?.map((v) => v.stockNumber.toUpperCase()) ?? []),
    ]),
  );
  const extras = seed.filter(
    (s) => s.featured && !stocks.has(s.stockNumber.toUpperCase()),
  );
  return [...scrapedList, ...extras];
}

export const products: Product[] = mergeCatalog(scraped, seedProducts);
