import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="font-display text-sm font-bold tracking-wider text-teal-700 uppercase">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Page not found</h1>
      <p className="mt-3 text-sm text-slate-600">
        That catalog path is not in this rebuild. Try search or the catalog index.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/catalog">Catalog</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
