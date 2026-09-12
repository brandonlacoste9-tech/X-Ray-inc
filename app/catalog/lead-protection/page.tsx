import Link from "next/link";
import { ProductListing } from "@/components/ProductListing";
import { Button } from "@/components/ui/button";
import {
  collectLeadEqOptions,
  filterProductsForRoute,
  getFeaturedProducts,
} from "@/lib/catalog";

type Props = {
  searchParams: Promise<{ brand?: string; sub?: string; lead?: string }>;
};

export const metadata = {
  title: "Lead / Radiation Protection",
  description:
    "Lead aprons, thyroid collars, Proguard gloves, lead glasses, mobile barriers, curtains, and racks from Infab, Techno-Aide, Wolf, and more.",
};

export default async function LeadProtectionPage({ searchParams }: Props) {
  const { brand, sub, lead } = await searchParams;
  const pool = filterProductsForRoute("lead-protection");
  const products = filterProductsForRoute("lead-protection", {
    brand,
    subcategory: sub,
    lead,
  });
  const brands = [...new Set(pool.map((p) => p.brand))].sort();
  const subcategories = [...new Set(pool.map((p) => p.subcategory))].sort();
  const leadEqOptions = collectLeadEqOptions(pool);

  const featured = getFeaturedProducts().filter((p) => p.category === "lead-protection");
  const lightning = featured.find((p) => /lightning/i.test(p.name) || /lightning/i.test(p.slug));
  const revolution = featured.find((p) => /revolution/i.test(p.name) || /revolution/i.test(p.slug));

  return (
    <ProductListing
      title="Lead / Radiation Protection"
      description="Aprons, thyroid collars, gloves/mittens/sleeves, lead glasses, lead glass windows, mobile barriers, curtains, and apron racks — quote-first dealer inventory."
      products={products}
      crumbs={[
        { label: "Catalog", href: "/catalog" },
        { label: "Lead Protection" },
      ]}
      brands={brands}
      subcategories={subcategories}
      leadEqOptions={leadEqOptions}
      basePath="/catalog/lead-protection"
      intro={
        <div className="mb-10 space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/catalog/lead-protection?sub=aprons", label: "Lead aprons" },
              { href: "/catalog/lead-protection?sub=gloves", label: "Gloves & sleeves" },
              { href: "/catalog/lead-protection?sub=barriers", label: "Barriers & curtains" },
              { href: "/catalog/lead-protection?sub=eyewear", label: "Lead eyewear" },
              { href: "/catalog/lead-protection?sub=thyroid", label: "Thyroid collars" },
              { href: "/catalog/lead-protection?sub=lead-glass", label: "Lead glass" },
              { href: "/catalog/lead-protection?sub=racks", label: "Apron racks" },
              { href: "/quote", label: "Request quote" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md border border-navy/10 bg-white px-3 py-3 text-sm font-semibold text-navy hover:border-teal-600/40"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CompareCard
              eyebrow="Quick ship"
              title="Infab LightningFast"
              body="Fastest-shipping lead apparel when you cannot wait on custom production. Frontal, vest/skirt, and full wrap in Ki-Armor lead-free cores."
              href={lightning ? `/products/${lightning.slug}` : "/search?q=LightningFast"}
              cta="View LightningFast"
            />
            <CompareCard
              eyebrow="Comfort / fluoro"
              title="Infab Revolution"
              body="Weight-relieving vest/skirt and wrap systems for long interventional cases — lumbar and full-overlap options."
              href={revolution ? `/products/${revolution.slug}` : "/search?q=Revolution"}
              cta="View Revolution"
            />
          </div>
        </div>
      }
    />
  );
}

function CompareCard({
  eyebrow,
  title,
  body,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-lg border border-navy/10 bg-navy px-5 py-5 text-white">
      <p className="text-xs font-semibold tracking-wider text-teal-soft uppercase">{eyebrow}</p>
      <h2 className="mt-1 font-display text-xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-white/70">{body}</p>
      <Button asChild size="sm" className="mt-4 bg-teal-600 hover:bg-teal-700">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
