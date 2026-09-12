import Link from "next/link";
import { FileText, Phone } from "lucide-react";
import { site } from "@/lib/site";

export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 p-2 backdrop-blur-md lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
        <a
          href={`tel:${site.tollFreeTel}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy text-sm font-semibold text-white"
        >
          <Phone className="size-4" aria-hidden />
          Call
        </a>
        <Link
          href="/quote"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 text-sm font-semibold text-white"
        >
          <FileText className="size-4" aria-hidden />
          Quote
        </Link>
      </div>
    </div>
  );
}
