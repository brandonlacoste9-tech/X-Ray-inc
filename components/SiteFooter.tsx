import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { primaryCategories, brandHubs } from "@/lib/data/categories";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-navy/10 bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <BrandLogo inverted />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Name-brand radiology equipment, accessories, parts, MRI-safe products, and
            veterinary X-ray since {site.founded}. Quote-first B2B ordering.
          </p>
          <p className="mt-3 text-xs text-white/50">
            Certifications / ISO documentation — available on request.
          </p>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold tracking-wider uppercase">Contact</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <a className="hover:text-teal-soft" href={`tel:${site.phoneTel}`}>
                {site.phone}
              </a>
            </li>
            <li>
              <a className="hover:text-teal-soft" href={`tel:${site.tollFreeTel}`}>
                Toll-free {site.tollFreeDisplay} ({site.tollFree})
              </a>
            </li>
            <li>Fax {site.fax}</li>
            <li>
              <a className="hover:text-teal-soft" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
            <li className="pt-1">
              {site.address.line1}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </li>
            <li>{site.hours}</li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold tracking-wider uppercase">
            Order methods
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/quote" className="hover:text-teal-soft">
                Request a quote
              </Link>
            </li>
            <li>Phone during business hours</li>
            <li>Fax 24/7 — {site.fax}</li>
            <li>
              <a href={site.orderFormPath} className="hover:text-teal-soft">
                Download PDF order form
              </a>
            </li>
            <li>
              <Link href="/order" className="hover:text-teal-soft">
                Ordering & freight policies
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm font-bold tracking-wider uppercase">Catalog</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {primaryCategories.map((c) => (
              <li key={c.slug}>
                <Link href={c.href} className="hover:text-teal-soft">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/catalog/lead-protection" className="hover:text-teal-soft">
                Lead Protection
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/50">
            Brands:{" "}
            {brandHubs.map((b) => b.name).join(" · ")}
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}. Catalog content modernized from
            www2.pnwx.com.
          </p>
          <p>Not a consumer cart — B2B quote / phone / fax / PDF order form.</p>
        </div>
      </div>
    </footer>
  );
}
