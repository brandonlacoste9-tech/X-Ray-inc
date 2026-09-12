import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Phone, Ship, Shield } from "lucide-react";
import { SearchBox } from "@/components/SearchBox";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts, getAllProducts } from "@/lib/catalog";
import { brandHubs } from "@/lib/data/categories";
import { getSearchIndex } from "@/lib/search-index";
import { site } from "@/lib/site";

const categoryCards = [
  { href: "/catalog/lead-protection", title: "Lead Apparel", blurb: "Aprons, thyroid, gloves, barriers" },
  { href: "/catalog/parts", title: "Grids & Parts", blurb: "Grids, collimators, HV cables" },
  { href: "/catalog/phantoms-qa", title: "Phantoms & Test Tools", blurb: "QA, ACR, line-pair, system test" },
  { href: "/catalog/lead-protection?sub=gloves", title: "Gloves", blurb: "Proguard RR surgical gloves" },
  { href: "/catalog/accessories", title: "Accessories", blurb: "Positioning, seating, markers, more" },
  { href: "/catalog/equipment", title: "Equipment", blurb: "Portables, warmers, survey meters" },
  { href: "/catalog/mri-safe", title: "MRI Safe", blurb: "Earplugs, coil covers, phantoms" },
  { href: "/catalog/veterinary", title: "Veterinary", blurb: "Immobilizers & portable vet X-ray" },
];

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 8);
  const catalog = getSearchIndex();
  const totalSkus = getAllProducts().reduce(
    (n, p) => n + (p.variants?.length || 1),
    0,
  );

  const spotlight = [
    ...featured.slice(0, 6).map((p) => ({
      href: `/products/${p.slug}`,
      label: p.name,
    })),
    { href: "/catalog/lead-protection", label: "Lead glass / mobile barriers / lead curtains" },
    { href: "/catalog/parts", label: "X-ray grids & parts" },
  ].slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-lead-apparel.jpg"
            alt=""
            fill
            priority
            className="object-cover object-[68%_35%]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/92 to-navy/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/30" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="animate-rise font-display text-sm font-semibold tracking-[0.2em] text-teal-soft uppercase">
              {site.shortName} · {site.address.region}
            </p>
            <div className="brand-rule mt-3" />
            <h1 className="animate-rise-delay mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Pacific Northwest X-Ray Inc.
            </h1>
            <p className="animate-rise-delay mt-3 max-w-xl text-lg text-white/90 sm:text-xl">
              {site.tagline}
            </p>
            <p className="animate-rise-delay-2 mt-3 max-w-lg text-sm leading-relaxed text-white/70">
              Hospitals, imaging centers, and veterinary clinics — name-brand inventory with
              quote / phone / fax ordering.
            </p>
            <div className="animate-rise-delay-2 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full max-w-md [&_input]:border-0 [&_input]:bg-white/95">
                <SearchBox
                  size="lg"
                  placeholder="Search products, brands, stock #"
                  catalog={catalog}
                />
              </div>
              <Button asChild size="lg" className="shrink-0 bg-teal-600 hover:bg-teal-700">
                <Link href="/quote">Request Quote</Link>
              </Button>
            </div>
          </div>

          <div className="animate-rise-delay relative hidden min-h-[280px] lg:block">
            <div className="absolute inset-0 rounded-lg border border-white/15 bg-navy/50 p-6 backdrop-blur-sm">
              <p className="font-display text-xs font-bold tracking-wider text-teal-soft uppercase">
                High-traffic from the catalog
              </p>
              <ul className="mt-4 space-y-2.5">
                {spotlight.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className="group flex items-start gap-2 text-sm text-white/85 hover:text-white"
                    >
                      <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-teal-soft opacity-70 group-hover:opacity-100" />
                      <span className="line-clamp-2">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-navy/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Shield, label: `${site.yearsInBusiness}+ years`, sub: `Serving since ${site.founded}` },
            {
              icon: Package,
              label: `${totalSkus.toLocaleString()}+ SKUs`,
              sub: `${getAllProducts().length} product pages loaded`,
            },
            { icon: Phone, label: "Phone support", sub: site.hours },
            { icon: Ship, label: "Fast shipping", sub: "LightningFast apparel & stocked parts" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                <item.icon className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-lg font-bold text-navy">{item.label}</p>
                <p className="text-sm text-slate-muted">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
              Featured products
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Stock numbers searchable — prices often call-for-quote. Build a multi-SKU quote list.
            </p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/catalog">Full catalog</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="border-y border-navy/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
            Shop by category
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Deep category tree from the dealer catalog — use the mega-menu for every subcategory.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {categoryCards.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group rounded-lg border border-navy/10 bg-clinical/40 px-4 py-5 transition hover:border-teal-600/40 hover:bg-white"
              >
                <p className="font-display text-lg font-semibold text-navy group-hover:text-teal-700">
                  {c.title}
                </p>
                <p className="mt-1 text-sm text-slate-muted">{c.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold text-navy">Brand hubs</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {brandHubs.map((b) => (
            <Link
              key={b.slug}
              href={`/brands/${b.slug}`}
              className="rounded-md border border-navy/15 bg-white px-4 py-2 text-sm font-semibold text-navy hover:border-teal-600/50 hover:text-teal-700"
            >
              {b.name}
            </Link>
          ))}
        </div>
        <div className="mt-10 rounded-lg border border-navy/10 bg-navy px-6 py-8 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <h2 className="font-display text-xl font-bold">Need a quote on multiple SKUs?</h2>
            <p className="mt-2 text-sm text-white/70">
              Use the quote list, email {site.email}, call {site.tollFree}, or fax {site.fax}.
            </p>
          </div>
          <Button asChild size="lg" className="mt-4 shrink-0 bg-teal-600 sm:mt-0">
            <Link href="/quote">Request Quote</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
