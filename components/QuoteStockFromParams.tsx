"use client";

import { useSearchParams } from "next/navigation";
import { QuoteForm } from "@/components/QuoteForm";

export function QuoteStockFromParams() {
  const params = useSearchParams();
  const stock = params.get("stock") || "";
  return <QuoteForm defaultStockNumbers={stock} />;
}
