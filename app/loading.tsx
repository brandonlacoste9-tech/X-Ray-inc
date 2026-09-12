import Link from "next/link";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded bg-navy/10" />
      <div className="mt-6 h-4 w-full max-w-xl animate-pulse rounded bg-navy/5" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-white" />
        ))}
      </div>
      <p className="sr-only">
        Loading… <Link href="/">Home</Link>
      </p>
    </div>
  );
}
