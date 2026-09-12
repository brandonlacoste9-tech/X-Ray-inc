"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AddToQuoteButton } from "@/components/RfqDrawer";
import { site } from "@/lib/site";

export function StickyQuoteBar({
  stockNumber,
  productName,
  slug,
}: {
  stockNumber: string;
  productName: string;
  slug?: string;
}) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 mt-10 border-t border-navy/10 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(11,31,51,0.08)] backdrop-blur md:mx-0 md:rounded-lg md:border md:shadow-sm lg:bottom-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-muted uppercase">
            Quote this SKU
          </p>
          <p className="text-sm text-navy">
            <span className="font-mono text-xs font-bold text-teal-800">#{stockNumber}</span>
            <span className="mx-2 text-slate-muted">·</span>
            {productName}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AddToQuoteButton stockNumber={stockNumber} name={productName} slug={slug} />
          <Button asChild variant="outline" size="sm">
            <a href={`tel:${site.tollFreeTel}`}>Call {site.tollFree}</a>
          </Button>
          <Button asChild size="sm">
            <Link href={`/quote?stock=${encodeURIComponent(stockNumber)}`}>
              Request Quote
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
