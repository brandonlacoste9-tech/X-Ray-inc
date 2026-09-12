import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ProductCard } from "@/components/ProductCard";
import { StickyQuoteBar } from "@/components/StickyQuoteBar";
import { AddToQuoteButton } from "@/components/RfqDrawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog";
import { getBrandBySlug } from "@/lib/data/categories";
import { formatPrice, slugify } from "@/lib/utils";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Catalog", href: "/catalog" },
          {
            label: product.category.replace(/-/g, " "),
            href: `/catalog/${product.category}`,
          },
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-navy/10 bg-white">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-10"
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
              unoptimized={product.image.startsWith("http")}
            />
          </div>
          {product.gallery && product.gallery.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.gallery.slice(0, 4).map((src) => (
                <div
                  key={src}
                  className="relative aspect-square overflow-hidden rounded-md border border-navy/10 bg-white"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-contain p-2"
                    sizes="120px"
                    unoptimized={src.startsWith("http")}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="teal">{product.brand}</Badge>
            {getBrandBySlug(slugify(product.brand)) && (
              <Link
                href={`/brands/${slugify(product.brand)}`}
                className="text-xs text-teal-700 hover:underline"
              >
                Brand hub
              </Link>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-sm text-slate-muted">
            Stock # <span className="font-semibold text-navy">{product.stockNumber}</span>
          </p>
          <p className="mt-4 text-2xl font-semibold text-navy">
            {formatPrice(product.price)}
            {product.price != null && (
              <span className="ml-2 text-sm font-normal text-slate-muted">
                / {product.unit}
              </span>
            )}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {product.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <AddToQuoteButton
              stockNumber={product.stockNumber}
              name={product.name}
              slug={product.slug}
              className="h-12"
            />
            <Button asChild size="lg">
              <Link href={`/quote?stock=${encodeURIComponent(product.stockNumber)}`}>
                Request Quote
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href={`tel:${site.tollFreeTel}`}>Call {site.tollFree}</a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href={site.orderFormPath}>PDF order form</a>
            </Button>
          </div>

          {product.options.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-sm font-bold tracking-wider text-navy uppercase">
                Options
              </h2>
              <dl className="mt-3 space-y-3">
                {product.options.map((opt) => (
                  <div key={opt.name}>
                    <dt className="text-xs font-semibold text-slate-muted">{opt.name}</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {opt.values.map((v) => (
                        <span
                          key={v}
                          className="rounded border border-navy/15 bg-clinical px-2 py-0.5 text-xs text-navy"
                        >
                          {v}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-navy/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-navy">Specifications</h2>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {product.specs.map((s) => (
                <tr key={s.label} className="border-t border-navy/10">
                  <th className="py-2 pr-4 text-left font-medium text-slate-muted">
                    {s.label}
                  </th>
                  <td className="py-2 text-navy">{s.value}</td>
                </tr>
              ))}
              <tr className="border-t border-navy/10">
                <th className="py-2 pr-4 text-left font-medium text-slate-muted">
                  Category
                </th>
                <td className="py-2 capitalize text-navy">
                  {product.category.replace(/-/g, " ")} / {product.subcategory.replace(/-/g, " ")}
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-navy/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold text-navy">Stock # / price table</h2>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-navy/10 text-left text-xs tracking-wide text-slate-muted uppercase">
                <th className="pb-2">Stock #</th>
                <th className="pb-2">Configuration</th>
                <th className="pb-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {(product.variants?.length
                ? product.variants
                : [
                    {
                      stockNumber: product.stockNumber,
                      label: "Base",
                      price: product.price,
                    },
                  ]
              ).map((v) => (
                <tr key={v.stockNumber} className="border-t border-navy/10">
                  <td className="py-2 font-mono text-xs font-semibold text-navy">
                    {v.stockNumber}
                  </td>
                  <td className="py-2 text-slate-600">{v.label}</td>
                  <td className="py-2 text-right font-medium text-navy">
                    {formatPrice(v.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-muted">
            Quantity discounts and freight quoted by sales. Fax orders accepted 24/7 at {site.fax}.
          </p>
        </section>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-bold text-navy">Related products</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <StickyQuoteBar
        stockNumber={product.stockNumber}
        productName={product.name}
        slug={product.slug}
      />
    </div>
  );
}
