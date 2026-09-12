/**
 * Crawl www2.pnwx.com product pages, extract SKUs from Stock # tables,
 * download product photos, write lib/data/products.generated.json
 *
 * Usage: node scripts/crawl-pnwx.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const ORIGIN = "https://www2.pnwx.com";
const ROOT = process.cwd();
const OUT_JSON = path.join(ROOT, "lib/data/products.generated.json");
const OUT_META = path.join(ROOT, ".firecrawl/crawl-meta.json");
const IMG_DIR = path.join(ROOT, "public/images/catalog");
const CACHE_DIR = path.join(ROOT, ".firecrawl/pages");

const SKIP_IMG = /(?:pnwx_ani|Proto3|Bar4Sky|Cards\.jpg|mail\.gif|OldPhone|FaxMach|Grad5|ProductBar|skyimge|VendorLogos|favicon|cgi-bin)/i;
const SKIP_PATH =
  /(?:cgi-bin|Search|mailto:|tel:|javascript:|\.pdf$|\.css$|\.js$|Buy\/?$|favicon)/i;

const SEEDS = [
  "/",
  "/Accessories/",
  "/Equipment/",
  "/Parts/",
  "/Supplies/",
  "/Accessories/LeadProducts/",
  "/Accessories/Phantoms/",
  "/Accessories/PatAsst/",
  "/Accessories/PosAides/",
  "/Accessories/Cassettes/",
  "/Accessories/MRI/",
  "/Accessories/Seating/",
  "/Parts/Grids/",
  "/Equipment/DarkEquip/",
  "/Equipment/Portables/",
  "/Equipment/TestEquip/",
];

const CONCURRENCY = 8;
const MAX_PAGES = 2500;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function absolutize(baseUrl, href) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return null;
  }
  try {
    const u = new URL(href, baseUrl);
    if (u.origin !== ORIGIN) return null;
    u.hash = "";
    // drop query for crawl queue uniqueness except Spec= pages which are indexes
    return u.toString();
  } catch {
    return null;
  }
}

function pathOf(url) {
  return new URL(url).pathname;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function mapCategory(pathname) {
  const p = pathname.toLowerCase();
  if (p.includes("/leadproducts/") || p.includes("/aprons/") || p.includes("/gloves/") || p.includes("/thyroid") || p.includes("/eyewear/") || p.includes("/mobilebarriers/") || p.includes("/windows/") || p.includes("/blockers")) {
    return { category: "lead-protection", subcategory: inferLeadSub(p) };
  }
  if (p.includes("/phantoms/") || p.includes("/test/")) {
    return { category: "phantoms-qa", subcategory: inferPhantomSub(p) };
  }
  if (p.includes("/mri/") || p.includes("mri")) {
    return { category: "mri-safe", subcategory: "mri-accessories" };
  }
  if (p.includes("/vet") || p.includes("pet-sitioner") || p.includes("equine") || p.includes("animal")) {
    return { category: "veterinary", subcategory: "veterinary" };
  }
  if (p.includes("/parts/") || p.includes("/grids/") || p.includes("/collimator") || p.includes("/hv")) {
    return { category: "parts", subcategory: p.includes("grid") ? "grids" : "parts" };
  }
  if (p.includes("/equipment/") || p.includes("/portables/") || p.includes("/testequip/") || p.includes("/darkequip/")) {
    return { category: "equipment", subcategory: inferEquipSub(p) };
  }
  if (p.includes("/supplies/")) {
    return { category: "supplies", subcategory: "supplies" };
  }
  if (p.includes("/seating/") || p.includes("/patasst/") || p.includes("/posaides/") || p.includes("/cassettes/") || p.includes("/examroom/") || p.includes("/darkroom/")) {
    return { category: "accessories", subcategory: inferAccSub(p) };
  }
  return { category: "accessories", subcategory: "general" };
}

function inferLeadSub(p) {
  if (p.includes("glove")) return "gloves";
  if (p.includes("thyroid")) return "thyroid";
  if (p.includes("eyewear") || p.includes("glass")) return "eyewear";
  if (p.includes("barrier") || p.includes("curtain") || p.includes("blocker")) return "barriers";
  if (p.includes("window")) return "lead-glass";
  if (p.includes("rack") || p.includes("hanger")) return "racks";
  return "aprons";
}

function inferPhantomSub(p) {
  if (p.includes("mri")) return "mri";
  if (p.includes("linepair") || p.includes("line-pair")) return "resolution";
  if (p.includes("mammo")) return "mammo";
  if (p.includes("ct")) return "ct";
  return "system-test";
}

function inferEquipSub(p) {
  if (p.includes("portable")) return "portable-xray";
  if (p.includes("test")) return "test-equipment";
  if (p.includes("dark")) return "darkroom-equipment";
  if (p.includes("patient") || p.includes("warming") || p.includes("cart")) return "patient-care";
  return "exam-room-equipment";
}

function inferAccSub(p) {
  if (p.includes("seat")) return "seating";
  if (p.includes("merchant") || p.includes("tablepad") || p.includes("posaides") || p.includes("patasst")) return "patient-positioning";
  if (p.includes("cassette")) return "cassettes-storage-viewing";
  if (p.includes("marker")) return "film-id-markers";
  if (p.includes("darkroom")) return "darkroom";
  return "exam-room";
}

function detectBrand(title, pathname, html) {
  const brands = [
    "Infab",
    "Techno-Aide",
    "TechnoAide",
    "Pedigo",
    "Proguard",
    "Pro-Project",
    "Phillips Safety",
    "PhillipsSafety",
    "Wolf",
    "Rotex",
    "Ludlum",
    "MinXray",
    "Source-Ray",
    "Soyee",
    "JPI",
    "Ultra",
    "Flow",
    "PNWX",
    "Apollo",
  ];
  const hay = `${title} ${pathname} ${html.slice(0, 2000)}`;
  for (const b of brands) {
    if (new RegExp(b.replace(/[-\s]/g, "[-\\s]?"), "i").test(hay)) {
      if (b === "TechnoAide") return "Techno-Aide";
      if (b === "PhillipsSafety") return "Phillips Safety";
      return b;
    }
  }
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 2].replace(/([a-z])([A-Z])/g, "$1-$2");
  return "PNWX";
}

function parsePrice(text) {
  if (!text) return null;
  if (/call/i.test(text)) return null;
  const m = text.replace(/,/g, "").match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const abs = absolutize(baseUrl, m[1]);
    if (!abs) continue;
    const p = pathOf(abs);
    if (SKIP_PATH.test(p) || SKIP_PATH.test(abs)) continue;
    // stay on catalog-ish paths
    if (!/^\/(Accessories|Equipment|Parts|Supplies|Buy)(\/|$)/i.test(p) && p !== "/") continue;
    links.add(abs);
  }
  return [...links];
}

function extractImages(html, pageUrl) {
  const imgs = [];
  const re = /(?:src)\s*=\s*["']([^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    const abs = absolutize(pageUrl, m[1]);
    if (!abs) continue;
    if (SKIP_IMG.test(abs)) continue;
    // skip tiny chrome / decorative absolute root gifs often
    if (/\/(?:mail|OldPhone|FaxMach|Cards|pnwx)/i.test(abs)) continue;
    imgs.push(abs);
  }
  return [...new Set(imgs)];
}

function extractTitle(html) {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (t) return stripTags(t[1]).slice(0, 160);
  const bar = html.match(/size=\+1>([\s\S]*?)<\/font>/i);
  if (bar) return stripTags(bar[1]).slice(0, 160);
  return "PNWX Product";
}

function extractDescription(html) {
  // first meaty paragraph after product bar
  const chunks = [...html.matchAll(/<font[^>]*color=["']?#000000["']?[^>]*>([\s\S]*?)<\/font>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((t) => t.length > 40 && !/Phone Lines|Purchase Orders|web site is our catalog/i.test(t));
  return (chunks[0] || "").slice(0, 600);
}

/**
 * Find tables that look like stock tables and pull rows.
 */
function extractStockRows(html) {
  const rows = [];
  const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  for (const table of tables) {
    const headerText = stripTags(table.slice(0, 800)).toLowerCase();
    if (!headerText.includes("stock")) continue;

    const trs = [...table.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
    if (trs.length < 2) continue;

    // header cells
    const headerCells = [...trs[0].matchAll(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi)].map((c) =>
      stripTags(c[0]).toLowerCase(),
    );
    const stockIdx = headerCells.findIndex((h) => h.includes("stock"));
    const descIdx = headerCells.findIndex((h) => h.includes("desc") || h.includes("size") || h.includes("model"));
    const priceIdx = headerCells.findIndex((h) => h.includes("price") || h.includes("your"));
    if (stockIdx < 0) continue;

    for (let i = 1; i < trs.length; i++) {
      const cells = [...trs[i].matchAll(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi)].map((c) => stripTags(c[0]));
      if (!cells.length) continue;
      const stock = (cells[stockIdx] || "").replace(/\u00a0/g, " ").trim();
      if (!stock || stock === "&nbsp;" || stock.length < 2) continue;
      if (/^stock/i.test(stock)) continue;
      // skip empty spacer rows
      if (!/[A-Za-z0-9]/.test(stock)) continue;

      const label =
        (descIdx >= 0 ? cells[descIdx] : cells.slice(1, 3).filter(Boolean).join(" · ")) || stock;
      const priceText = priceIdx >= 0 ? cells[priceIdx] : cells[cells.length - 1];
      rows.push({
        stockNumber: stock.slice(0, 64),
        label: label.slice(0, 160),
        price: parsePrice(priceText),
        rawPrice: priceText || "",
      });
    }
  }
  return rows;
}

async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "PNWX-CatalogRebuild/1.0 (+local import)",
          Accept: "text/html,*/*",
        },
        signal: AbortSignal.timeout(45000),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(500 * (i + 1));
    }
  }
  return null;
}

async function downloadImage(url, destPath) {
  try {
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    const res = await fetch(url, {
      headers: { "User-Agent": "PNWX-CatalogRebuild/1.0" },
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok || !res.body) return false;
    await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
    const st = await fs.stat(destPath);
    if (st.size < 200) {
      await fs.unlink(destPath).catch(() => {});
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function mapPool(items, limit, fn) {
  const ret = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      ret[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return ret;
}

function pageCacheKey(url) {
  return slugify(pathOf(url)).slice(0, 100) || "root";
}

async function main() {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.mkdir(IMG_DIR, { recursive: true });
  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });

  const queue = [];
  const seen = new Set();
  for (const s of SEEDS) {
    const u = absolutize(ORIGIN + "/", s);
    if (u && !seen.has(u)) {
      seen.add(u);
      queue.push(u);
    }
  }

  const productPages = [];
  let fetched = 0;

  console.log("Crawling www2.pnwx.com …");

  while (queue.length && fetched < MAX_PAGES) {
    const batch = queue.splice(0, CONCURRENCY);
    await mapPool(batch, CONCURRENCY, async (url) => {
      fetched++;
      const cacheFile = path.join(CACHE_DIR, pageCacheKey(url) + ".html");
      let html = null;
      try {
        html = await fs.readFile(cacheFile, "utf8");
      } catch {
        try {
          html = await fetchText(url);
          if (html) await fs.writeFile(cacheFile, html, "utf8");
          await sleep(80);
        } catch (err) {
          console.warn("fail", url, err.message);
          return;
        }
      }
      if (!html) return;

      for (const link of extractLinks(html, url)) {
        if (!seen.has(link) && seen.size < MAX_PAGES * 2) {
          seen.add(link);
          queue.push(link);
        }
      }

      const rows = extractStockRows(html);
      if (rows.length > 0) {
        productPages.push({ url, html, rows });
      }

      if (fetched % 50 === 0) {
        console.log(`  fetched ${fetched}, queued ${queue.length}, product pages ${productPages.length}`);
      }
    });
  }

  console.log(`Done crawl: ${fetched} pages, ${productPages.length} with stock tables`);

  // Build products: one product per page (variants = stock rows)
  const products = [];
  const usedSlugs = new Set();
  const imageJobs = [];

  for (const page of productPages) {
    const pathname = pathOf(page.url);
    const title = extractTitle(page.html);
    const description = extractDescription(page.html) || title;
    const brand = detectBrand(title, pathname, page.html);
    const { category, subcategory } = mapCategory(pathname);
    const imgs = extractImages(page.html, page.url);
    const primaryImg = imgs[0] || null;

    let slug = slugify(`${brand}-${title}`) || slugify(pathname);
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${slugify(`${brand}-${title}`)}-${n++}`;
    }
    usedSlugs.add(slug);

    const variants = page.rows.map((r) => ({
      stockNumber: r.stockNumber,
      label: r.label,
      price: r.price,
    }));

    const base = variants[0];
    const localImgName = primaryImg
      ? `${slug}${path.extname(new URL(primaryImg).pathname).toLowerCase() || ".jpg"}`
      : null;

    if (primaryImg && localImgName) {
      imageJobs.push({
        url: primaryImg,
        dest: path.join(IMG_DIR, localImgName),
        publicPath: `/images/catalog/${localImgName}`,
        slug,
      });
      // also queue extra gallery images (up to 4)
      imgs.slice(1, 4).forEach((u, i) => {
        const ext = path.extname(new URL(u).pathname).toLowerCase() || ".jpg";
        const name = `${slug}-${i + 2}${ext}`;
        imageJobs.push({
          url: u,
          dest: path.join(IMG_DIR, name),
          publicPath: `/images/catalog/${name}`,
          slug: null,
        });
      });
    }

    products.push({
      slug,
      name: title,
      brand,
      stockNumber: base?.stockNumber || slug.toUpperCase(),
      category,
      subcategory,
      price: base?.price ?? null,
      unit: "each",
      options: [],
      specs: [
        { label: "Source page", value: pathname },
        { label: "SKU count on page", value: String(variants.length) },
      ],
      variants,
      description,
      image: localImgName ? `/images/catalog/${localImgName}` : "/images/products/apron-placeholder.svg",
      gallery: [],
      featured: /lightning|revolution|proguard|grid|phantom|acr|merchant|barrier|rotex/i.test(
        `${title} ${pathname}`,
      ),
      tags: [
        brand.toLowerCase(),
        category,
        subcategory,
        ...pathname
          .toLowerCase()
          .split("/")
          .filter(Boolean)
          .slice(-3),
      ],
      sourceUrl: page.url,
    });
  }

  console.log(`Downloading up to ${imageJobs.length} images …`);
  let imgOk = 0;
  await mapPool(imageJobs, 6, async (job) => {
    const ok = await downloadImage(job.url, job.dest);
    if (ok) imgOk++;
    else if (job.slug) {
      const p = products.find((x) => x.slug === job.slug);
      if (p) p.image = "/images/products/apron-placeholder.svg";
    }
  });
  console.log(`Images saved: ${imgOk}/${imageJobs.length}`);

  // Attach gallery paths that exist
  for (const p of products) {
    const files = imageJobs
      .filter((j) => j.dest.includes(path.join(IMG_DIR, p.slug)))
      .map((j) => j.publicPath);
    // simpler: list dir by prefix
  }

  const entries = await fs.readdir(IMG_DIR).catch(() => []);
  for (const p of products) {
    const gallery = entries
      .filter((f) => f.startsWith(p.slug + "-") || f.startsWith(p.slug + "."))
      .map((f) => `/images/catalog/${f}`);
    p.gallery = gallery.filter((g) => g !== p.image);
    // if primary missing but gallery has first
    if (p.image.includes("placeholder") && gallery[0]) {
      p.image = gallery[0];
      p.gallery = gallery.slice(1);
    }
  }

  // Deduplicate by stockNumber primary (keep longer description)
  const byStock = new Map();
  for (const p of products) {
    const key = p.stockNumber.toUpperCase();
    const prev = byStock.get(key);
    if (!prev || (p.description?.length || 0) > (prev.description?.length || 0)) {
      byStock.set(key, p);
    }
  }
  const unique = [...byStock.values()].sort((a, b) => a.name.localeCompare(b.name));

  await fs.writeFile(OUT_JSON, JSON.stringify(unique, null, 2), "utf8");
  await fs.writeFile(
    OUT_META,
    JSON.stringify(
      {
        crawledAt: new Date().toISOString(),
        pagesFetched: fetched,
        productPages: productPages.length,
        products: unique.length,
        imagesDownloaded: imgOk,
        skus: unique.reduce((n, p) => n + (p.variants?.length || 1), 0),
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `Wrote ${unique.length} products (${unique.reduce((n, p) => n + (p.variants?.length || 1), 0)} SKU rows) → ${OUT_JSON}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
