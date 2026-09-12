/**
 * Clean products.generated.json — names, categories, prices, stock labels.
 * Usage: node scripts/clean-catalog.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "lib/data/products.generated.json");

function cleanName(name) {
  return String(name || "")
    .replace(/\s*[-|].*Pacific Northwest.*/i, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/, "")
    .trim();
}

function mapCategoryFromSource(pathname, category, subcategory) {
  const p = String(pathname || "").toLowerCase();
  if (/\/grids\/|parts\/grids/.test(p)) return { category: "parts", subcategory: "grids" };
  if (/collimator.?lamp/.test(p)) return { category: "parts", subcategory: "collimator-lamps" };
  if (/collimator/.test(p)) return { category: "parts", subcategory: "collimators" };
  if (/hv|ht.?cable|high.?voltage|high.?tension/.test(p))
    return { category: "parts", subcategory: "hv-cables" };
  if (/leadproducts|\/aprons\/|gloves|thyroid|eyewear|barrier|curtain|window|blocker/.test(p)) {
    let sub = subcategory;
    if (p.includes("glove")) sub = "gloves";
    else if (p.includes("thyroid")) sub = "thyroid";
    else if (/eyewear|glass/.test(p) && !/window/.test(p)) sub = "eyewear";
    else if (/barrier|curtain|blocker/.test(p)) sub = "barriers";
    else if (/window/.test(p)) sub = "lead-glass";
    else if (/rack|hanger/.test(p)) sub = "racks";
    else if (/apron/.test(p)) sub = "aprons";
    return { category: "lead-protection", subcategory: sub || "aprons" };
  }
  if (/phantoms/.test(p)) return { category: "phantoms-qa", subcategory: subcategory || "system-test" };
  if (/\/mri\//.test(p)) return { category: "mri-safe", subcategory: subcategory || "mri-accessories" };
  if (/vet|equine|pet-sitioner|animal/.test(p))
    return { category: "veterinary", subcategory: "veterinary" };
  if (/\/equipment\/|medxray|viewequip|darkequip|portables|testequip/.test(p))
    return { category: "equipment", subcategory: subcategory || "exam-room-equipment" };
  if (/\/supplies\//.test(p)) return { category: "supplies", subcategory: "supplies" };
  return { category, subcategory };
}

function extractLeadEq(product) {
  const hay = [
    product.name,
    product.description,
    ...(product.variants?.map((v) => v.label) || []),
    ...(product.specs?.map((s) => s.value) || []),
  ]
    .join(" ")
    .toLowerCase();
  const vals = new Set();
  for (const m of hay.matchAll(/0\.(25|35|50|5)\s*mm/g)) {
    const n = m[1] === "5" ? "0.50" : `0.${m[1]}`;
    vals.add(`${n} mm Pb`);
  }
  return [...vals];
}

const products = JSON.parse(await fs.readFile(FILE, "utf8"));
let renamed = 0;
let remapped = 0;

for (const p of products) {
  const nextName = cleanName(p.name);
  if (nextName !== p.name) {
    p.name = nextName || p.stockNumber;
    renamed++;
  }

  const src = p.specs?.find((s) => s.label === "Source page")?.value || p.sourceUrl || "";
  const mapped = mapCategoryFromSource(src, p.category, p.subcategory);
  if (mapped.category !== p.category || mapped.subcategory !== p.subcategory) {
    p.category = mapped.category;
    p.subcategory = mapped.subcategory;
    remapped++;
  }

  // Normalize variant labels
  if (p.variants?.length) {
    p.variants = p.variants.map((v) => ({
      ...v,
      stockNumber: String(v.stockNumber || "").trim(),
      label: cleanName(v.label) || v.stockNumber,
      price: v.price == null ? null : Number(v.price),
    }));
    // If product price null, use first variant with price
    if (p.price == null) {
      const priced = p.variants.find((v) => v.price != null);
      if (priced) p.price = priced.price;
    }
  }

  const leadEq = extractLeadEq(p);
  if (leadEq.length && !p.options?.some((o) => /lead/i.test(o.name))) {
    p.options = [...(p.options || []), { name: "Lead equivalence", values: leadEq }];
  }

  // Ensure tags include stock fragments for search
  const stockTags = [p.stockNumber, ...(p.variants?.map((v) => v.stockNumber) || [])]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());
  p.tags = [...new Set([...(p.tags || []), ...stockTags, p.brand.toLowerCase(), p.category])];
}

products.sort((a, b) => a.name.localeCompare(b.name));
await fs.writeFile(FILE, JSON.stringify(products, null, 2), "utf8");

const parts = products.filter((p) => p.category === "parts").length;
const lead = products.filter((p) => p.category === "lead-protection").length;
console.log(
  JSON.stringify(
    {
      products: products.length,
      renamed,
      remapped,
      parts,
      lead,
      withPrice: products.filter((p) => p.price != null).length,
    },
    null,
    2,
  ),
);
