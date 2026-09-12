import type { BrandHub, CategoryNode } from "@/lib/types";

export const primaryCategories: CategoryNode[] = [
  {
    slug: "accessories",
    name: "Accessories",
    description:
      "Darkroom, exam room, film ID, cassettes/CR/DR, MRI accessories, positioning, phantoms, seating, tech aides, lead protection, ultrasound, and veterinary.",
    href: "/catalog/accessories",
    children: [
      { slug: "darkroom", name: "Darkroom", description: "Film bins, safelights, silver recovery, timers.", href: "/catalog/accessories/darkroom" },
      { slug: "exam-room", name: "Exam Room", description: "Warming cabinets, carts, lighting, tables.", href: "/catalog/accessories/exam-room" },
      { slug: "film-id-markers", name: "Film ID Markers", description: "All-Craft Wellman and Phillips Safety markers.", href: "/catalog/accessories/film-id-markers" },
      { slug: "cassettes-storage-viewing", name: "Cassettes / CR / DR Storage & Viewing", description: "Cassettes, racks, viewboxes, grids.", href: "/catalog/accessories/cassettes-storage-viewing" },
      { slug: "mri-accessories", name: "MRI Accessories", description: "Coil drapes, metal detectors, MRI-safe transport.", href: "/catalog/accessories/mri-accessories" },
      { slug: "patient-positioning", name: "Patient Positioning & Comfort", description: "Merchant boards, table pads, sponges, sandbags.", href: "/catalog/accessories/patient-positioning" },
      { slug: "phantoms", name: "Phantoms", description: "Training, resolution, CT, mammo, MRI, NM phantoms.", href: "/catalog/phantoms-qa" },
      { slug: "seating", name: "Seating", description: "Stools, chairs, step stools, blood-drawing chairs.", href: "/catalog/accessories/seating" },
      { slug: "tech-aides", name: "Tech Aides", description: "Markers, step wedges, badge storage, caddies.", href: "/catalog/accessories/tech-aides" },
      { slug: "lead-protection", name: "Lead / Radiation Protection", description: "Aprons, thyroid, gloves, glasses, barriers, glass.", href: "/catalog/lead-protection" },
      { slug: "ultrasound", name: "Ultrasound", description: "Gel, warmers, probe covers, US phantoms.", href: "/catalog/accessories/ultrasound" },
      { slug: "veterinary", name: "Veterinary", description: "Immobilizers, equine holders, portable vet X-ray.", href: "/catalog/veterinary" },
    ],
  },
  {
    slug: "equipment",
    name: "Equipment",
    description:
      "Darkroom equipment, digital portable X-ray, exam-room systems, film viewing, patient-care equipment, and radiation test meters.",
    href: "/catalog/equipment",
    children: [
      { slug: "darkroom-equipment", name: "Darkroom Equipment", description: "Processors, mixers, silver recovery systems.", href: "/catalog/equipment/darkroom-equipment" },
      { slug: "digital-portable", name: "Digital Portable X-Ray", description: "Portable digital radiography systems.", href: "/catalog/equipment/digital-portable" },
      { slug: "exam-room-equipment", name: "Exam-Room Equipment", description: "Tables, lighting, instrument stands.", href: "/catalog/equipment/exam-room-equipment" },
      { slug: "film-viewing", name: "Film Viewing", description: "Viewboxes and analog viewing systems.", href: "/catalog/equipment/film-viewing" },
      { slug: "patient-care", name: "Patient-Care Equipment", description: "Stretchers, warming cabinets, case carts.", href: "/catalog/equipment/patient-care" },
      { slug: "portable-xray", name: "Portable Medical / Podiatric / Vet X-Ray", description: "JPI, MinXray, Source-Ray, Soyee, Ultra.", href: "/catalog/equipment/portable-xray" },
      { slug: "test-equipment", name: "Test Equipment", description: "Survey meters, wipe counters, Ludlum.", href: "/catalog/equipment/test-equipment" },
    ],
  },
  {
    slug: "parts",
    name: "Parts",
    description: "X-ray grids, collimators, collimator lamps, and HV/HT cables.",
    href: "/catalog/parts",
    children: [
      { slug: "grids", name: "X-Ray Grids", description: "Aluminum-interspaced grids and encasements.", href: "/catalog/parts/grids" },
      { slug: "collimators", name: "Collimators", description: "Beam-limiting collimators.", href: "/catalog/parts/collimators" },
      { slug: "collimator-lamps", name: "Collimator Lamps", description: "Replacement projection lamps.", href: "/catalog/parts/collimator-lamps" },
      { slug: "hv-cables", name: "HV / HT Cables", description: "Federal Standard ends, regular or high-flex.", href: "/catalog/parts/hv-cables" },
    ],
  },
  {
    slug: "supplies",
    name: "Supplies",
    description: "Cleaners, covers, gowns, labels, jackets, MRI covers/earplugs, decon, and wipes.",
    href: "/catalog/supplies",
    children: [
      { slug: "cleaners", name: "Cleaners", description: "Screen cleaners and department surface cleaners.", href: "/catalog/supplies/cleaners" },
      { slug: "covers-gowns", name: "Covers & Gowns", description: "CT covers, exam gowns, probe covers.", href: "/catalog/supplies/covers-gowns" },
      { slug: "labels-jackets", name: "Labels & Jackets", description: "Labels, envelopes, film jackets.", href: "/catalog/supplies/labels-jackets" },
      { slug: "mri-consumables", name: "MRI Consumables", description: "Coil covers and MRI-safe earplugs.", href: "/catalog/supplies/mri-consumables" },
      { slug: "decon-wipes", name: "Decon & Wipes", description: "Radioactive decon and sanitizing wipes.", href: "/catalog/supplies/decon-wipes" },
    ],
  },
];

/** High-traffic landing hubs used in top nav */
export const hubCategories: CategoryNode[] = [
  {
    slug: "lead-protection",
    name: "Lead / Radiation Protection",
    description:
      "Aprons, thyroid collars, gloves/mittens/sleeves, lead glasses, lead glass windows, mobile barriers, curtains, and apron racks.",
    href: "/catalog/lead-protection",
    children: [
      { slug: "aprons", name: "Lead Aprons", description: "Infab LightningFast, Revolution, Techno-Aide, Wolf, ProLite.", href: "/catalog/lead-protection?sub=aprons" },
      { slug: "thyroid", name: "Thyroid Collars", description: "Matching collars by brand and fabric.", href: "/catalog/lead-protection?sub=thyroid" },
      { slug: "gloves", name: "Gloves, Mittens & Sleeves", description: "Proguard surgical radiation-reducing gloves.", href: "/catalog/lead-protection?sub=gloves" },
      { slug: "eyewear", name: "Lead Glasses", description: "Leaded eyewear, goggles, face shields.", href: "/catalog/lead-protection?sub=eyewear" },
      { slug: "barriers", name: "Mobile Barriers & Curtains", description: "Wheeled barriers, curtains, blockers.", href: "/catalog/lead-protection?sub=barriers" },
      { slug: "lead-glass", name: "Lead Glass Windows", description: "Lead glass, windows, and frames.", href: "/catalog/lead-protection?sub=lead-glass" },
      { slug: "racks", name: "Apron & Glove Racks", description: "Storage racks, hangers, carry bags.", href: "/catalog/lead-protection?sub=racks" },
    ],
  },
  {
    slug: "phantoms-qa",
    name: "Phantoms & QA",
    description: "Resolution, line-pair, system test, ACR MRI, CT, mammo, and training phantoms.",
    href: "/catalog/phantoms-qa",
  },
  {
    slug: "mri-safe",
    name: "MRI Safe",
    description: "MRI-safe chairs, stretchers, wheelchairs, earplugs, coil covers, and phantoms.",
    href: "/catalog/mri-safe",
  },
  {
    slug: "veterinary",
    name: "Veterinary",
    description: "Small-animal immobilizers, equine cassette holders, portable vet X-ray.",
    href: "/catalog/veterinary",
  },
];

export const brandHubs: BrandHub[] = [
  {
    slug: "infab",
    name: "Infab",
    description: "Lead apparel including LightningFast quick-ship and Revolution comfort lines.",
    specialties: ["Lead aprons", "Vest/skirt", "Thyroid collars", "Quick-ship apparel"],
  },
  {
    slug: "techno-aide",
    name: "Techno-Aide",
    description: "Techno-Guard radiation protection in a wide range of styles and fabrics.",
    specialties: ["EZ-Guard", "Flex-Guard", "Max-Guard Plus", "OR Guard"],
  },
  {
    slug: "pedigo",
    name: "Pedigo",
    description: "Hospital seating, stools, and patient-care equipment.",
    specialties: ["Stools", "Chairs", "Case carts", "Stretchers"],
  },
  {
    slug: "proguard",
    name: "Proguard",
    description: "Surgical radiation-reducing gloves, mittens, and sleeves.",
    specialties: ["RR gloves", "Mittens", "Sleeves"],
  },
  {
    slug: "pro-project",
    name: "Pro-Project",
    description: "QA and accreditation phantoms for radiography, fluoro, CT, and mammo.",
    specialties: ["Line-pair", "System test", "Mammo QA"],
  },
  {
    slug: "phillips-safety",
    name: "Phillips Safety",
    description: "Lead glass, barriers, eyewear, and film ID markers.",
    specialties: ["Lead glass", "Eyewear", "Markers"],
  },
  {
    slug: "wolf",
    name: "Wolf",
    description: "Classic radiology brand for lead garments and accessories.",
    specialties: ["Aprons", "Easy-Wrap", "SPA"],
  },
  {
    slug: "rotex",
    name: "Rotex",
    description: "Silver recovery systems for darkroom operations.",
    specialties: ["Silver recovery"],
  },
  {
    slug: "ludlum",
    name: "Ludlum",
    description: "Survey meters and radiation detection instruments.",
    specialties: ["Survey meters", "Wipe counters"],
  },
];

export const megaMenu = {
  accessories: primaryCategories[0],
  equipment: primaryCategories[1],
  parts: primaryCategories[2],
  supplies: primaryCategories[3],
  lead: hubCategories[0],
  brands: brandHubs,
};

export function getCategoryBySlug(slug: string): CategoryNode | undefined {
  const all = [...primaryCategories, ...hubCategories];
  for (const cat of all) {
    if (cat.slug === slug) return cat;
    const child = cat.children?.find((c) => c.slug === slug);
    if (child) return child;
  }
  return undefined;
}

export function getBrandBySlug(slug: string): BrandHub | undefined {
  return brandHubs.find((b) => b.slug === slug);
}
