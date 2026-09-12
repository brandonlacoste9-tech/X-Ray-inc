import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-navy/10 bg-white shadow-sm transition hover:border-teal-600/40 hover:shadow-md"
    >
      <div className="border-b border-navy/5 bg-clinical/80 px-3 py-2">
        <p className="font-mono text-xs font-bold tracking-wide text-teal-800">
          Stock # {product.stockNumber}
        </p>
      </div>
      <div className="relative aspect-[4/3] bg-clinical">
        <Image
          src={product.image}
          alt=""
          fill
          className="object-contain p-6 transition duration-300 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 25vw"
          unoptimized={product.image.startsWith("http")}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="teal">{product.brand}</Badge>
          {(product.variants?.length || 0) > 1 && (
            <span className="text-[11px] text-slate-muted">
              {product.variants!.length} SKUs
            </span>
          )}
        </div>
        <h3 className="font-display text-base font-semibold leading-snug text-navy group-hover:text-teal-700">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
          {product.description}
        </p>
        <p className="mt-auto pt-2 text-sm font-semibold text-navy">
          {formatPrice(product.price)}
          {product.price != null && (
            <span className="ml-1 text-xs font-normal text-slate-muted">/ {product.unit}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
