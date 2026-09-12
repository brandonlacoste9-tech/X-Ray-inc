/**
 * Import Firecrawl crawl JSON → products.generated.json + download images.
 * Usage: node scripts/import-firecrawl-pnwx.mjs [.firecrawl/pnwx-crawl.json]
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const ROOT = process.cwd();
const INPUT = path.resolve(process.argv[2] || ".firecrawl/pnwx-crawl.json");
const OUT_JSON = path.join(ROOT, "lib/data/products.generated.json");
const IMG_DIR = path.join(ROOT, "public/images/catalog");
const ORIGIN = "https://www2.pnwx.com";

const SKIP_IMG =
  /(?:pnwx_ani|Proto3|Bar4Sky|Cards\.jpg|mail\.gif|OldPhone|FaxMach|Grad5|ProductBar|skyimge|VendorLogos|favicon|cgi-bin|google-analytics)/i;

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function stripTags(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(text) {
  if (!text || /call/i.test(text)) return null;
  const m = String(text).replace(/,/g, "").match(/\$?\s*(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function mapCategory(pathname) {
  const p = pathname.toLowerCase();
  if (
    /leadproducts|\/aprons\/|\/gloves\/|thyroid|eyewear|mobilebarrier|\/windows\/|blockers|curtains/.test(
      p,
    )
  ) {
    let subcategory = "aprons";
    if (p.includes("glove")) subcategory = "gloves";
    else if (p.includes("thyroid")) subcategory = "thyroid";
    else if (p.includes("eyewear") || p.includes("glass")) subcategory = "eyewear";
    else if (/barrier|curtain|blocker/.test(p)) subcategory = "barriers";
    else if (p.includes("window")) subcategory = "lead-glass";
    else if (/rack|hanger/.test(p)) subcategory = "racks";
    return { category: "lead-protection", subcategory };
  }
  if (/phantoms|\/test\//.test(p)) {
    return {
      category: "phantoms-qa",
      subcategory: p.includes("mri")
        ? "mri"
        : p.includes("mammo")
          ? "mammo"
          : p.includes("linepair")
            ? "resolution"
            : "system-test",
    };
  }
  if (/\/mri\/|mri-?safe/.test(p)) return { category: "mri-safe", subcategory: "mri-accessories" };
  if (/vet|equine|animal|pet-sitioner/.test(p))
    return { category: "veterinary", subcategory: "veterinary" };
  if (/\/parts\/|\/grids\/|collimator|\/hv/.test(p))
    return { category: "parts", subcategory: p.includes("grid") ? "grids" : "parts" };
  if (/\/equipment\/|portables|testequip|darkequip/.test(p)) {
    return {
      category: "equipment",
      subcategory: p.includes("portable")
        ? "portable-xray"
        : p.includes("test")
          ? "test-equipment"
          : p.includes("dark")
            ? "darkroom-equipment"
            : "exam-room-equipment",
    };
  }
  if (/\/supplies\//.test(p)) return { category: "supplies", subcategory: "supplies" };
  if (/seating|patasst|posaides|cassettes|examroom|darkroom/.test(p)) {
    return {
      category: "accessories",
      subcategory: p.includes("seat")
        ? "seating"
        : /merchant|tablepad|posaides|patasst/.test(p)
          ? "patient-positioning"
          : p.includes("cassette")
            ? "cassettes-storage-viewing"
            : "exam-room",
    };
  }
  return { category: "accessories", subcategory: "general" };
}

function detectBrand(title, pathname, text) {
  const brands = [
    ["Infab", /infab/i],
    ["Techno-Aide", /techno[- ]?aide/i],
    ["Pedigo", /pedigo/i],
    ["Proguard", /proguard/i],
    ["Pro-Project", /pro[- ]?project/i],
    ["Phillips Safety", /phillips\s*safety/i],
    ["Wolf", /\bwolf\b/i],
    ["Rotex", /rotex/i],
    ["Ludlum", /ludlum/i],
    ["MinXray", /minxray/i],
    ["Source-Ray", /source[- ]?ray/i],
    ["Soyee", /soyee/i],
    ["JPI", /\bjpi\b/i],
    ["Ultra", /\bultra\b/i],
    ["Flow", /\bflow\b/i],
    ["Fluke", /fluke/i],
    ["Brewer", /brewer/i],
    ["Maxant", /maxant/i],
    ["PNWX", /pnwx|prolite|apollo/i],
  ];
  const hay = `${title} ${pathname} ${text.slice(0, 1500)}`;
  for (const [name, re] of brands) {
    if (re.test(hay)) return name;
  }
  return "PNWX";
}

function extractStockRowsFromHtml(html) {
  const rows = [];
  if (!html) return rows;
  const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((m) => m[0]);
  for (const table of tables) {
    const headerText = stripTags(table.slice(0, 900)).toLowerCase();
    if (!headerText.includes("stock")) continue;
    const trs = [...table.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
    if (trs.length < 2) continue;
    const headerCells = [...trs[0].matchAll(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi)].map((c) =>
      stripTags(c[0]).toLowerCase(),
    );
    const stockIdx = headerCells.findIndex((h) => h.includes("stock"));
    const descIdx = headerCells.findIndex(
      (h) => h.includes("desc") || h.includes("size") || h.includes("model"),
    );
    const priceIdx = headerCells.findIndex((h) => h.includes("price") || h.includes("your"));
    if (stockIdx < 0) continue;
    for (let i = 1; i < trs.length; i++) {
      const cells = [...trs[i].matchAll(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi)].map((c) =>
        stripTags(c[0]),
      );
      const stock = (cells[stockIdx] || "").trim();
      if (!stock || stock.length < 2 || /^stock/i.test(stock) || !/[A-Za-z0-9]/.test(stock))
        continue;
      const label =
        (descIdx >= 0 ? cells[descIdx] : cells.slice(1, 3).filter(Boolean).join(" · ")) ||
        stock;
      const priceText = priceIdx >= 0 ? cells[priceIdx] : cells[cells.length - 1];
      rows.push({
        stockNumber: stock.slice(0, 64),
        label: label.slice(0, 160),
        price: parsePrice(priceText),
      });
    }
  }
  return rows;
}

function extractStockRowsFromMarkdown(md) {
  const rows = [];
  if (!md) return rows;
  // lines like: | UFP-KI-LF | Frontal Apron | ... | $625.00 |
  for (const line of md.split("\n")) {
    if (!line.includes("|")) continue;
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cells.length < 2) continue;
    if (/^-{2,}/.test(cells[0]) || /stock/i.test(cells[0])) continue;
    const stock = cells[0];
    if (!/^[A-Z0-9][A-Z0-9][A-Z0-9.\-\/ ]{1,40}$/i.test(stock)) continue;
    if (/^(size|description|model|item)$/i.test(stock)) continue;
    const priceCell = cells.find((c) => /\$|call/i.test(c)) || cells[cells.length - 1];
    rows.push({
      stockNumber: stock.slice(0, 64),
      label: (cells[1] || stock).slice(0, 160),
      price: parsePrice(priceCell),
    });
  }
  return rows;
}

function collectImages(doc, pageUrl) {
  const urls = new Set();
  const html = doc.html || doc.rawHtml || "";
  const md = doc.markdown || "";
  const meta = doc.metadata || {};

  for (const m of html.matchAll(/(?:src)\s*=\s*["']([^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/gi)) {
    try {
      const abs = new URL(m[1], pageUrl).toString();
      if (!SKIP_IMG.test(abs)) urls.add(abs);
    } catch {
      /* ignore */
    }
  }
  for (const m of md.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    try {
      const abs = new URL(m[1], pageUrl).toString();
      if (!SKIP_IMG.test(abs) && /\.(jpg|jpeg|png|gif|webp)/i.test(abs)) urls.add(abs);
    } catch {
      /* ignore */
    }
  }
  if (meta.ogImage) {
    try {
      const abs = new URL(meta.ogImage, pageUrl).toString();
      if (!SKIP_IMG.test(abs)) urls.add(abs);
    } catch {
      /* ignore */
    }
  }
  return [...urls];
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
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, () => worker()));
  return ret;
}

function normalizeDocs(raw) {
  // Firecrawl crawl output shapes vary
  if (Array.isArray(raw)) return raw;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  if (raw?.data?.data && Array.isArray(raw.data.data)) return raw.data.data;
  if (raw?.documents && Array.isArray(raw.documents)) return raw.documents;
  return [];
}

async function main() {
  const rawText = await fs.readFile(INPUT, "utf8");
  const raw = JSON.parse(rawText);
  const docs = normalizeDocs(raw);
  console.log(`Loaded ${docs.length} docs from ${INPUT}`);

  await fs.mkdir(IMG_DIR, { recursive: true });

  const products = [];
  const usedSlugs = new Set();
  const imageJobs = [];

  for (const doc of docs) {
    const pageUrl =
      doc.url ||
      doc.metadata?.sourceURL ||
      doc.metadata?.url ||
      doc.metadata?.ogUrl ||
      "";
    if (!pageUrl || !/pnwx\.com/i.test(pageUrl)) continue;
    if (/\.pdf($|\?)/i.test(pageUrl)) continue;

    let pathname = "/";
    try {
      pathname = new URL(pageUrl).pathname;
    } catch {
      continue;
    }

    const html = doc.html || doc.rawHtml || "";
    const markdown = doc.markdown || "";
    const title =
      stripTags(doc.metadata?.title || "") ||
      stripTags((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "") ||
      pathname.split("/").filter(Boolean).slice(-1)[0] ||
      "PNWX Product";

    let rows = extractStockRowsFromHtml(html);
    if (!rows.length) rows = extractStockRowsFromMarkdown(markdown);

    // Skip pure index pages with no SKUs and very short content
    const text = markdown || stripTags(html);
    if (!rows.length) {
      // Still keep deep leaf pages that look like products (have prices + images)
      const hasPrice = /\$\d+|call for/i.test(text);
      const imgs = collectImages(doc, pageUrl);
      if (!hasPrice || imgs.length === 0) continue;
      rows = [
        {
          stockNumber: slugify(pathname).slice(0, 40).toUpperCase() || "CALL",
          label: title,
          price: parsePrice(text.match(/\$[\d,]+\.?\d*/)?.[0] || ""),
        },
      ];
    }

    const brand = detectBrand(title, pathname, text);
    const { category, subcategory } = mapCategory(pathname);
    const imgs = collectImages(doc, pageUrl);
    const primaryImg = imgs[0] || null;

    let slug = slugify(`${brand}-${title}`) || slugify(pathname);
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${slugify(`${brand}-${title}`)}-${n++}`;
    usedSlugs.add(slug);

    const variants = rows.map((r) => ({
      stockNumber: r.stockNumber,
      label: r.label,
      price: r.price,
    }));
    const base = variants[0];

    const ext = primaryImg
      ? path.extname(new URL(primaryImg).pathname).toLowerCase() || ".jpg"
      : ".jpg";
    const localImgName = primaryImg ? `${slug}${ext}` : null;

    if (primaryImg && localImgName) {
      imageJobs.push({
        url: primaryImg,
        dest: path.join(IMG_DIR, localImgName),
        publicPath: `/images/catalog/${localImgName}`,
        slug,
      });
      imgs.slice(1, 5).forEach((u, i) => {
        const e = path.extname(new URL(u).pathname).toLowerCase() || ".jpg";
        const name = `${slug}-${i + 2}${e}`;
        imageJobs.push({
          url: u,
          dest: path.join(IMG_DIR, name),
          publicPath: `/images/catalog/${name}`,
          slug: null,
        });
      });
    }

    const description =
      (doc.metadata?.description || "").trim() ||
      text
        .split("\n")
        .map((l) => l.trim())
        .find((l) => l.length > 60 && !/phone lines|purchase orders|web site is our catalog/i.test(l))
        ?.slice(0, 600) ||
      title;

    products.push({
      slug,
      name: title.replace(/\s*[-|].*Pacific Northwest.*/i, "").trim() || title,
      brand,
      stockNumber: base.stockNumber,
      category,
      subcategory,
      price: base.price,
      unit: "each",
      options: [],
      specs: [
        { label: "Source page", value: pathname },
        { label: "SKU rows", value: String(variants.length) },
      ],
      variants,
      description,
      image: localImgName
        ? `/images/catalog/${localImgName}`
        : "/images/products/apron-placeholder.svg",
      gallery: [],
      featured: /lightning|revolution|proguard|grid|phantom|acr|merchant|barrier|rotex|ludlum/i.test(
        `${title} ${pathname}`,
      ),
      tags: [brand.toLowerCase(), category, subcategory, ...pathname.toLowerCase().split("/").filter(Boolean).slice(-3)],
      sourceUrl: pageUrl.startsWith("http") ? pageUrl.replace(/^http:/, "https:") : `${ORIGIN}${pathname}`,
    });
  }

  console.log(`Parsed ${products.length} products. Downloading ${imageJobs.length} images…`);
  let imgOk = 0;
  await mapPool(imageJobs, 8, async (job) => {
    const ok = await downloadImage(job.url, job.dest);
    if (ok) imgOk++;
    else if (job.slug) {
      const p = products.find((x) => x.slug === job.slug);
      if (p) p.image = "/images/products/apron-placeholder.svg";
    }
  });
  console.log(`Images: ${imgOk}/${imageJobs.length}`);

  const entries = await fs.readdir(IMG_DIR).catch(() => []);
  for (const p of products) {
    const gallery = entries
      .filter((f) => f === `${p.slug}${path.extname(f)}` || f.startsWith(`${p.slug}-`))
      .map((f) => `/images/catalog/${f}`);
    if (gallery.length) {
      p.image = gallery.find((g) => !g.includes(`${p.slug}-`)) || gallery[0];
      p.gallery = gallery.filter((g) => g !== p.image);
    }
  }

  const byStock = new Map();
  for (const p of products) {
    const key = p.stockNumber.toUpperCase();
    const prev = byStock.get(key);
    if (!prev || (p.variants?.length || 0) > (prev.variants?.length || 0)) byStock.set(key, p);
  }
  const unique = [...byStock.values()].sort((a, b) => a.name.localeCompare(b.name));

  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(unique, null, 2), "utf8");
  await fs.writeFile(
    path.join(ROOT, ".firecrawl/import-meta.json"),
    JSON.stringify(
      {
        importedAt: new Date().toISOString(),
        source: INPUT,
        docs: docs.length,
        products: unique.length,
        skus: unique.reduce((n, p) => n + (p.variants?.length || 1), 0),
        images: imgOk,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(
    `Wrote ${unique.length} products / ${unique.reduce((n, p) => n + (p.variants?.length || 1), 0)} SKUs → ${OUT_JSON}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
