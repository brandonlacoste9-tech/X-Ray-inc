import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { QuoteForm } from "@/components/QuoteForm";
import { site } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: `Contact ${site.name} — phone, fax, email, and quote form.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="font-display text-3xl font-bold text-navy sm:text-4xl">
            Contact sales
          </h1>
          <p className="mt-3 text-slate-600">
            Quote-first ordering — phone, fax, email, or the form. Equal paths; no
            consumer checkout.
          </p>
          <dl className="mt-8 space-y-4 text-sm">
            <div>
              <dt className="font-semibold text-navy">Phone</dt>
              <dd className="mt-1 text-slate-600">
                <a className="text-teal-700 hover:underline" href={`tel:${site.phoneTel}`}>
                  {site.phone}
                </a>
                <br />
                Toll-free{" "}
                <a className="text-teal-700 hover:underline" href={`tel:${site.tollFreeTel}`}>
                  {site.tollFreeDisplay} ({site.tollFree})
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Fax (24/7)</dt>
              <dd className="mt-1 text-slate-600">{site.fax}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Email</dt>
              <dd className="mt-1">
                <a className="text-teal-700 hover:underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Hours</dt>
              <dd className="mt-1 text-slate-600">{site.hours}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">Mail</dt>
              <dd className="mt-1 text-slate-600">
                {site.address.line1}
                <br />
                {site.address.city}, {site.address.state} {site.address.zip}
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm">
            <Link href="/order" className="font-medium text-teal-700 hover:underline">
              Ordering & freight policies
            </Link>
            {" · "}
            <a href={site.orderFormPath} className="font-medium text-teal-700 hover:underline">
              PDF order form
            </a>
          </p>
        </div>

        <div className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-navy">Quote / contact form</h2>
          <p className="mt-1 text-sm text-slate-muted">
            Submits to a stub API and opens mailto:{site.email}.
          </p>
          <div className="mt-6">
            <QuoteForm />
          </div>
        </div>
      </div>
    </div>
  );
}
