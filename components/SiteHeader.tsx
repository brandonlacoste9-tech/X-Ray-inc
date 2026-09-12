"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { SearchBox } from "@/components/SearchBox";
import { RfqDrawer } from "@/components/RfqDrawer";
import { Button } from "@/components/ui/button";
import { megaMenu, primaryCategories, hubCategories, brandHubs } from "@/lib/data/categories";
import { getSearchIndex } from "@/lib/search-index";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const topLinks = [
  { label: "Catalog", href: "/catalog", mega: "catalog" as const },
  { label: "Lead Protection", href: "/catalog/lead-protection", mega: "lead" as const },
  { label: "Phantoms & QA", href: "/catalog/phantoms-qa" },
  { label: "Equipment", href: "/catalog/equipment", mega: "equipment" as const },
  { label: "Parts", href: "/catalog/parts", mega: "parts" as const },
  { label: "MRI Safe", href: "/catalog/mri-safe" },
  { label: "Veterinary", href: "/catalog/veterinary" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

type MegaKey = "catalog" | "lead" | "equipment" | "parts" | null;

export function SiteHeader() {
  const [open, setOpen] = useState<MegaKey>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const catalog = getSearchIndex();

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/95 backdrop-blur-md">
      <div className="border-b border-navy/5 bg-navy text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6">
          <p className="truncate text-white/80">
            {site.address.city}, {site.address.state} · {site.hours}
          </p>
          <a
            href={`tel:${site.tollFreeTel}`}
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-teal-soft hover:text-white"
          >
            <Phone className="size-3.5" aria-hidden />
            {site.tollFreeDisplay}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <BrandLogo className="shrink-0" />

        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBox catalog={catalog} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <RfqDrawer />
          <Button asChild variant="outline" size="sm" className="hidden lg:inline-flex">
            <a href={`tel:${site.tollFreeTel}`}>Call {site.tollFree}</a>
          </Button>
          <Button asChild size="sm">
            <Link href="/quote">Request Quote</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      <nav
        className="relative hidden border-t border-navy/5 lg:block"
        onMouseLeave={() => setOpen(null)}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6">
          {topLinks.map((link) => (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={() => setOpen(link.mega ?? null)}
            >
              <Link
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1 px-3 py-2.5 text-sm font-medium text-navy/80 transition hover:text-teal-700",
                  open === link.mega && "text-teal-700",
                )}
              >
                {link.label}
                {link.mega && <ChevronDown className="size-3.5 opacity-60" aria-hidden />}
              </Link>
            </div>
          ))}
        </div>

        {open === "catalog" && (
          <MegaPanel>
            <div className="grid gap-8 md:grid-cols-4">
              {primaryCategories.map((cat) => (
                <div key={cat.slug}>
                  <Link
                    href={cat.href}
                    className="font-display text-sm font-bold tracking-wide text-navy hover:text-teal-700"
                  >
                    {cat.name}
                  </Link>
                  <ul className="mt-3 space-y-1.5">
                    {cat.children?.slice(0, 8).map((child) => (
                      <li key={child.slug}>
                        <Link
                          href={child.href}
                          className="text-sm text-slate-600 hover:text-teal-700"
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-navy/10 pt-4">
              <p className="mb-2 text-xs font-semibold tracking-wider text-slate-muted uppercase">
                Brand hubs
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {brandHubs.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/brands/${b.slug}`}
                    className="text-sm font-medium text-navy hover:text-teal-700"
                  >
                    {b.name}
                  </Link>
                ))}
              </div>
            </div>
          </MegaPanel>
        )}

        {open === "lead" && (
          <MegaPanel>
            <p className="mb-3 max-w-2xl text-sm text-slate-600">
              {megaMenu.lead.description}
            </p>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {megaMenu.lead.children?.map((child) => (
                <Link
                  key={child.slug}
                  href={child.href}
                  className="rounded-md border border-navy/10 bg-clinical/60 px-3 py-2 text-sm font-medium text-navy hover:border-teal-600/40 hover:bg-white"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </MegaPanel>
        )}

        {open === "equipment" && (
          <MegaPanel>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {megaMenu.equipment.children?.map((child) => (
                <Link
                  key={child.slug}
                  href={child.href}
                  className="rounded-md px-2 py-1.5 text-sm text-navy hover:bg-clinical hover:text-teal-700"
                >
                  <span className="font-medium">{child.name}</span>
                  <span className="mt-0.5 block text-xs text-slate-muted">
                    {child.description}
                  </span>
                </Link>
              ))}
            </div>
          </MegaPanel>
        )}

        {open === "parts" && (
          <MegaPanel>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {megaMenu.parts.children?.map((child) => (
                <Link
                  key={child.slug}
                  href={child.href}
                  className="rounded-md border border-navy/10 px-3 py-3 text-sm font-medium text-navy hover:border-teal-600/40"
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </MegaPanel>
        )}
      </nav>

      {mobileOpen && (
        <div className="border-t border-navy/10 bg-white lg:hidden">
          <div className="space-y-4 px-4 py-4">
            <SearchBox catalog={catalog} />
            <ul className="space-y-1">
              {topLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-md px-2 py-2 text-sm font-medium text-navy hover:bg-clinical"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wider text-slate-muted uppercase">
                Categories
              </p>
              <ul className="grid grid-cols-2 gap-1">
                {[...primaryCategories, ...hubCategories.slice(0, 2)].map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={c.href}
                      className="block rounded-md px-2 py-1.5 text-xs text-slate-600 hover:bg-clinical"
                      onClick={() => setMobileOpen(false)}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MegaPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-x-0 top-full z-50 border-b border-navy/10 bg-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}
