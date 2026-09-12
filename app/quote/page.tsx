import { Suspense } from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { site } from "@/lib/site";
import { QuoteStockFromParams } from "@/components/QuoteStockFromParams";

export const metadata = {
  title: "Request Quote",
  description: "B2B quote request for PNWX radiology products.",
};

export default function QuotePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Request Quote" }]} />
      <h1 className="font-display text-3xl font-bold text-navy">Request a quote</h1>
      <p className="mt-3 text-sm text-slate-600">
        List stock numbers and quantities. Sales responds by email or phone — or call{" "}
        <a className="font-medium text-teal-700" href={`tel:${site.tollFreeTel}`}>
          {site.tollFree}
        </a>
        , fax {site.fax}, or use the{" "}
        <a className="font-medium text-teal-700" href={site.orderFormPath}>
          PDF order form
        </a>
        .
      </p>
      <div className="mt-8 rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
        <Suspense fallback={<p className="text-sm text-slate-muted">Loading form…</p>}>
          <QuoteStockFromParams />
        </Suspense>
      </div>
    </div>
  );
}
