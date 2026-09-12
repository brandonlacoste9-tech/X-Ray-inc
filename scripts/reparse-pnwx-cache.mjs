/**
 * Reparse cached www2.pnwx.com HTML → products.generated.json
 * Uses .firecrawl/pages + already-downloaded public/images/catalog
 *
 * Usage: node scripts/reparse-pnwx-cache.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, ".firecrawl/pages");
const IMG_DIR = path.join(ROOT, "public/images/catalog");
const OUT_JSON = path.join(ROOT, "lib/data/products.generated.json");
const ORIGIN = "https://www2.pnwx.com";

const SKIP_IMG =
  /(?:pnwx_ani|Proto3|Bar4Sky|Cards\.jpg|mail\.gif|OldPhone|FaxMach|Grad5|ProductBar|skyimge|VendorLogos|favicon|cgi-bin|pnwx\.jpg$)/i;

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
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrice(text) {
  if (!text || /call/i.test(text)) return null;
  const m = String(text).replace(/,/g, "").match(/\$\s*(\d+(?:\.\d{1,2})?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/** Looks like a real stock / part number */
function looksLikeStock(s) {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 2 || t.length > 48) return false;
  if (/\$/.test(t)) return false;
  if (/^(stock|description|your price|price|size|model|qty|quantity|core|closure|fabric|color|lead|time|ship|protection|type|item|name)$/i.test(t))
    return false;
  if (/apron|vest\/skirt|full wrap|thyroid collar|not sold|includes:|phantom with/i.test(t) && !/[0-9]/.test(t))
    return false;
  // Must have a digit or a code-like pattern
  if (!/[0-9]/.test(t) && !/^[A-Z]{2,}[-_/][A-Z0-9]/i.test(t)) return false;
  // Reject long English phrases
  const words = t.split(/\s+/);
  if (words.length >= 5 && !/^[A-Z0-9].*\d/.test(t)) return false;
  return /[A-Za-z0-9]/.test(t);
}

function cleanStock(raw) {
  let s = String(raw || "").replace(/\u00a0/g, " ").trim();
  // "18442 / $Call" or "403 / $815.00"
  const slash = s.match(/^([A-Za-z0-9][A-Za-z0-9.\-\/]{0,40})\s*\/\s*\$/);
  if (slash) return slash[1].trim();
  s = s.replace(/\s*\/\s*\$.*$/, "").trim();
  return s.slice(0, 64);
}

function mapCategory(pathname) {
  const p = pathname.toLowerCase();
  if (/leadproducts|\/aprons\/|\/gloves\/|thyroid|eyewear|mobilebarrier|\/windows\/|blockers|curtains/.test(p)) {
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
          : /linepair|line-pair/.test(p)
            ? "resolution"
            : "system-test",
    };
  }
  if (/\/mri\//.test(p)) return { category: "mri-safe", subcategory: "mri-accessories" };
  if (/vet|equine|animal|pet-sitioner/.test(p))
    return { category: "veterinary", subcategory: "veterinary" };
  if (/\/parts\/|\/grids\/|collimator|\/hv/.test(p))
    return { category: "parts", subcategory: p.includes("grid") ? "grids" : "parts" };
  if (/\/equipment\/|portables|testequip|darkequip|medxray|viewequip/.test(p)) {
    return {
      category: "equipment",
      subcategory: /portable|medxray/.test(p)
        ? "portable-xray"
        : p.includes("test")
          ? "test-equipment"
          : p.includes("dark")
            ? "darkroom-equipment"
            : /view|viewbox/.test(p)
              ? "film-viewing"
              : "exam-room-equipment",
    };
  }
  if (/\/supplies\//.test(p)) return { category: "supplies", subcategory: "supplies" };
  if (/seating|patasst|posaides|cassettes|examroom|darkroom|filmhandling/.test(p)) {
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
  for (const [name, re] of brands) if (re.test(hay)) return name;
  return "PNWX";
}

function extractTitle(html) {
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (t) {
    return stripTags(t[1])
      .replace(/\s*[-|].*Pacific Northwest.*/i, "")
      .replace(/\s*-\s*Pacific Northwest.*/i, "")
      .trim()
      .slice(0, 160);
  }
  return "";
}

function extractDescription(html) {
  const chunks = [...html.matchAll(/<font[^>]*color=["']?#000000["']?[^>]*>([\s\S]*?)<\/font>/gi)]
    .map((m) => stripTags(m[1]))
    .filter((t) => t.length > 40 && !/Phone Lines|Purchase Orders|web site is our catalog/i.test(t));
  return (chunks[0] || "").slice(0, 600);
}

function extractStockRows(html) {
  const rows = [];
  const tables = [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map((m) => m[0]);

  for (const table of tables) {
    const headerText = stripTags(table.slice(0, 1200)).toLowerCase();
    if (!/\bstock\b/.test(headerText)) continue;

    const trs = [...table.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map((m) => m[0]);
    if (trs.length < 2) continue;

    const headerCells = [...trs[0].matchAll(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi)].map((c) =>
      stripTags(c[0]).toLowerCase(),
    );

    let stockIdx = headerCells.findIndex((h) => /\bstock\b/.test(h));
    let descIdx = headerCells.findIndex(
      (h) => /desc|model|size|item|product/.test(h) && !/stock/.test(h),
    );
    let priceIdx = headerCells.findIndex((h) => /price|your/.test(h));

    // Combined "Stock # / Your Price" column
    const combined = headerCells.findIndex((h) => /stock/.test(h) && /price/.test(h));

    for (let i = 1; i < trs.length; i++) {
      const cells = [...trs[i].matchAll(/<t[dh]\b[\s\S]*?<\/t[dh]>/gi)].map((c) =>
        stripTags(c[0]),
      );
      if (!cells.length) continue;

      let stock = "";
      let label = "";
      let price = null;

      if (combined >= 0 && cells[combined]) {
        const cell = cells[combined];
        const m = cell.match(/^([A-Za-z0-9][A-Za-z0-9.\-\/]*)\s*\/\s*(.*)$/);
        if (m) {
          stock = cleanStock(m[1]);
          price = parsePrice(m[2]);
        } else {
          stock = cleanStock(cell);
        }
        label = cells.find((c, idx) => idx !== combined && c && !/\$/.test(c)) || stock;
      } else if (stockIdx >= 0) {
        stock = cleanStock(cells[stockIdx] || "");
        // If first cell isn't stock-like, scan row for a stock-like cell
        if (!looksLikeStock(stock)) {
          const found = cells.find((c) => looksLikeStock(cleanStock(c)));
          if (found) stock = cleanStock(found);
        }
        label =
          (descIdx >= 0 ? cells[descIdx] : "") ||
          cells.find((c, idx) => idx !== stockIdx && c && !looksLikeStock(cleanStock(c)) && !/^\$/.test(c)) ||
          stock;
        const priceText = priceIdx >= 0 ? cells[priceIdx] : cells.find((c) => /\$|call/i.test(c));
        price = parsePrice(priceText || "");
      } else {
        // No clear header — find stock-like cell
        const foundIdx = cells.findIndex((c) => looksLikeStock(cleanStock(c)));
        if (foundIdx < 0) continue;
        stock = cleanStock(cells[foundIdx]);
        label = cells.find((c, idx) => idx !== foundIdx && c.length > 2) || stock;
        price = parsePrice(cells.find((c) => /\$|call/i.test(c)) || "");
      }

      if (!looksLikeStock(stock)) continue;

      rows.push({
        stockNumber: stock,
        label: String(label || stock).slice(0, 160),
        price,
      });
    }
  }

  // Dedupe by stock within page
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.stockNumber.toUpperCase())) map.set(r.stockNumber.toUpperCase(), r);
  }
  return [...map.values()];
}

function extractImages(html, pageUrl) {
  const imgs = [];
  const re = /(?:src)\s*=\s*["']([^"']+\.(?:jpg|jpeg|png|gif|webp)[^"']*)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const abs = new URL(m[1], pageUrl).toString();
      if (SKIP_IMG.test(abs)) continue;
      imgs.push(abs);
    } catch {
      /* ignore */
    }
  }
  return [...new Set(imgs)];
}

function inferPathnameFromCache(html, file) {
  const sourceGuess = html.match(
    /https?:\/\/www2\.pnwx\.com(\/(?:Accessories|Equipment|Parts|Supplies)\/[A-Za-z0-9\-._/~%]*)/i,
  );
  if (sourceGuess) return sourceGuess[1].split(/[#?]/)[0];

  // Cache keys are slugify(pathname) from the crawler
  const base = file.replace(/\.html$/i, "");
  if (!base || base === "root") return "/";
  const parts = base.split("-").filter(Boolean);
  // Heuristic: capitalize path segments
  const pretty = parts
    .map((p) => {
      if (/^(cr|dr|mri|qa|hv|ht|id|or|ii)$/i.test(p)) return p.toUpperCase();
      return p.charAt(0).toUpperCase() + p.slice(1);
    })
    .join("/");
  return `/${pretty}/`;
}

async function main() {
  const files = (await fs.readdir(CACHE_DIR)).filter((f) => f.endsWith(".html"));
  console.log(`Reparsing ${files.length} cached pages…`);

  const existingImgs = new Set(await fs.readdir(IMG_DIR).catch(() => []));
  const products = [];
  const usedSlugs = new Set();

  for (const file of files) {
    const html = await fs.readFile(path.join(CACHE_DIR, file), "utf8");
    const rows = extractStockRows(html);
    if (!rows.length) continue;

    let title = extractTitle(html);
    if (!title || title.length < 3) {
      title = rows[0].label || rows[0].stockNumber;
    }

    // Prefer a real source URL from page links to self-ish paths in title bar
    const pathMatch = html.match(/Href=["'](\/(?:Accessories|Equipment|Parts|Supplies)\/[^"']+)["']/i);
    let pathname = pathMatch?.[1] || inferPathnameFromCache(html, file);
    // Better: use longest unique path from relative imgs / structure
    const bar = html.match(/background="\/Grad5\.gif"><b><font[^>]*>([\s\S]*?)<\/font>/i);
    if (bar && !title) title = stripTags(bar[1]);

    // Recover better pathname from first product-relative image URL context
    // Many pages live under deep paths; try matching cached filename tokens
    const sourceGuess = html.match(
      /https?:\/\/www2\.pnwx\.com(\/(?:Accessories|Equipment|Parts|Supplies)\/[A-Za-z0-9\-._/~%]*)/i,
    );
    if (sourceGuess) pathname = sourceGuess[1].split("#")[0];

    const pageUrl = ORIGIN + (pathname.startsWith("/") ? pathname : `/${pathname}`);
    const brand = detectBrand(title, pathname, html);
    const { category, subcategory } = mapCategory(pathname);
    const description = extractDescription(html) || title;
    const remoteImgs = extractImages(html, pageUrl);

    let slug = slugify(`${brand}-${title}`) || slugify(rows[0].stockNumber);
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${slug}-${n++}`;
    usedSlugs.add(slug);

    // Prefer already-downloaded images matching slug
    const localMatches = [...existingImgs].filter(
      (f) => f === `${slug}.jpg` || f === `${slug}.jpeg` || f === `${slug}.png` || f === `${slug}.gif` || f === `${slug}.webp` || f.startsWith(`${slug}-`),
    );

    let image = "/images/products/apron-placeholder.svg";
    let gallery = [];
    if (localMatches.length) {
      const primary =
        localMatches.find((f) => !/-\\d/.test(f) && !/-\d+\./.test(f)) || localMatches[0];
      image = `/images/catalog/${primary}`;
      gallery = localMatches.filter((f) => f !== primary).map((f) => `/images/catalog/${f}`);
    } else if (remoteImgs[0]) {
      // Keep remote URL as fallback so UI still shows photo
      image = remoteImgs[0];
      gallery = remoteImgs.slice(1, 5);
    }

    const variants = rows.map((r) => ({
      stockNumber: r.stockNumber,
      label: r.label,
      price: r.price,
    }));

    products.push({
      slug,
      name: title,
      brand,
      stockNumber: variants[0].stockNumber,
      category,
      subcategory,
      price: variants[0].price,
      unit: "each",
      options: [],
      specs: [
        { label: "Source page", value: pathname },
        { label: "SKU rows", value: String(variants.length) },
      ],
      variants,
      description,
      image,
      gallery,
      featured: /lightning|revolution|proguard|grid|phantom|acr|merchant|barrier|rotex|ludlum/i.test(
        `${title} ${pathname}`,
      ),
      tags: [
        brand.toLowerCase(),
        category,
        subcategory,
        ...pathname.toLowerCase().split("/").filter(Boolean).slice(-3),
      ],
      sourceUrl: pageUrl,
    });
  }

  // Dedupe by primary stock
  const byStock = new Map();
  for (const p of products) {
    const key = p.stockNumber.toUpperCase();
    const prev = byStock.get(key);
    if (!prev || (p.variants?.length || 0) > (prev.variants?.length || 0)) {
      byStock.set(key, p);
    }
  }
  const unique = [...byStock.values()].sort((a, b) => a.name.localeCompare(b.name));

  await fs.writeFile(OUT_JSON, JSON.stringify(unique, null, 2), "utf8");
  await fs.writeFile(
    path.join(ROOT, ".firecrawl/reparse-meta.json"),
    JSON.stringify(
      {
        reparsedAt: new Date().toISOString(),
        cachePages: files.length,
        products: unique.length,
        skus: unique.reduce((n, p) => n + (p.variants?.length || 1), 0),
        withLocalImages: unique.filter((p) => p.image.includes("/images/catalog/")).length,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(
    `Wrote ${unique.length} products / ${unique.reduce((n, p) => n + (p.variants?.length || 1), 0)} SKUs`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
