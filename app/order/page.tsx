import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";

export const metadata = {
  title: "Ordering & Policies",
  description: "PNWX order methods, accounts, freight, RMA, and PDF order form.",
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Ordering & Policies" }]} />
      <h1 className="font-display text-3xl font-bold text-navy">Ordering & policies</h1>
      <p className="mt-3 text-slate-600">
        PNWX is a B2B dealer. There is no consumer cart — orders proceed by quote, phone,
        fax, or PDF form.
      </p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="font-display text-lg font-bold text-navy">Phone</h2>
          <p className="mt-2">
            {site.phone} · Toll-free {site.tollFreeDisplay} ({site.tollFree})
            <br />
            Hours: {site.hours}
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-navy">Fax — 24/7</h2>
          <p className="mt-2">
            Fax completed order forms to <strong>{site.fax}</strong> any time. Orders are
            processed on the next business day.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-navy">PDF order form</h2>
          <p className="mt-2">
            <a href={site.orderFormPath} className="font-medium text-teal-700 hover:underline">
              Download the PNWX order form (PDF)
            </a>
            . Include stock #, qty, facility, PO, and receiving notes, then fax or email{" "}
            {site.email}.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-navy">Web quote / RFQ list</h2>
          <p className="mt-2">
            Add multiple SKUs to the on-site quote list, then submit via the{" "}
            <Link href="/quote" className="text-teal-700 hover:underline">
              request quote
            </Link>{" "}
            form (Netlify Forms on deploy). Or email stock lists to{" "}
            <a href={`mailto:${site.email}`} className="text-teal-700 hover:underline">
              {site.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-navy">Accounts & minimums</h2>
          <p className="mt-2">
            Purchase orders accepted upon credit approval. New open charge accounts typically
            require a <strong>$500 minimum opening order</strong>. Cash / credit-card orders are
            subject to a <strong>$30 product minimum</strong> (per classic catalog terms). Quantity
            discounts available — ask sales when requesting a quote.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-navy">Freight & dock</h2>
          <p className="mt-2">
            Heavy equipment, mobile barriers, case carts, and large phantoms may ship freight.
            On your quote request, include:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Dock hours and receiving contact</li>
            <li>Lift-gate or inside-delivery needs</li>
            <li>Residential vs commercial delivery address</li>
            <li>Any limited-access or appointment requirements</li>
          </ul>
          <p className="mt-2">
            Residential and lift-gate surcharges may apply — confirmed at order time.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-navy">Returns / RMA</h2>
          <p className="mt-2">
            Custom-fabricated lead apparel, monogrammed garments, and special-order items may be
            non-returnable. Stocked merchandise requires prior RMA authorization from sales —
            unauthorized returns may be refused or assessed a restocking fee. Contact{" "}
            <a href={`mailto:${site.email}`} className="text-teal-700 hover:underline">
              {site.email}
            </a>{" "}
            or call {site.tollFree} before shipping anything back.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-navy">Pricing notice</h2>
          <p className="mt-2">
            Every effort is made to keep posted prices current; manufacturer changes can lag.
            Quotes confirm final pricing, lead times, and freight.
          </p>
        </section>
      </div>
    </div>
  );
}
