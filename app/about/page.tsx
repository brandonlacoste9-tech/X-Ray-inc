import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata = {
  title: "About",
  description: `About ${site.name} — radiology supply dealer since ${site.founded}.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "About" }]} />
      <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
        About {site.shortName}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        {site.name} is a Pacific Northwest radiology supply dealer based in Gresham,
        Oregon ({site.address.region}). Since {site.founded}, we have supplied
        hospitals, imaging centers, and veterinary clinics with name-brand equipment,
        accessories, parts, MRI-safe products, and radiation protection.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-display text-xl font-bold text-navy">Name-brand inventory</h2>
          <p className="mt-2">
            Our catalog mirrors the depth of the classic www2.pnwx.com dealer site —
            Infab, Techno-Aide, Pedigo, Proguard, Pro-Project, Phillips Safety, Wolf,
            Rotex, Ludlum, and more. Lead apparel, phantoms, grids, portables, and
            consumables ship from stocked and special-order lines.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-navy">Quantity discounts</h2>
          <p className="mt-2">
            Facility and group pricing is quote-based. Provide stock numbers,
            quantities, and delivery requirements — sales will return freight and
            discount options.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-navy">Expert support</h2>
          <p className="mt-2">
            Phone lines are open {site.hours}. Specs, fabric/lead options, grid
            ratios, and phantom accreditation questions are handled by experienced
            sales — not a self-serve consumer cart.
          </p>
        </section>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/contact">Contact</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/catalog">Browse catalog</Link>
        </Button>
      </div>
    </div>
  );
}
