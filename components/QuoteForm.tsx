"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRfq } from "@/lib/rfq/RfqProvider";
import { site } from "@/lib/site";

export type QuoteFormProps = {
  defaultStockNumbers?: string;
  defaultNotes?: string;
  compact?: boolean;
};

export function QuoteForm({
  defaultStockNumbers = "",
  defaultNotes = "",
  compact = false,
}: QuoteFormProps) {
  const { lines, clear } = useRfq();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const rfqStockDefault = useMemo(() => {
    if (lines.length) return lines.map((l) => l.stockNumber).join(", ");
    return defaultStockNumbers;
  }, [lines, defaultStockNumbers]);

  const rfqQtyDefault = useMemo(() => {
    if (lines.length) return lines.map((l) => `${l.qty} × ${l.stockNumber}`).join("; ");
    return "";
  }, [lines]);

  const rfqLinesText = useMemo(
    () =>
      lines
        .map((l) => `${l.stockNumber}\t${l.qty}\t${l.name}${l.notes ? `\t${l.notes}` : ""}`)
        .join("\n"),
    [lines],
  );

  const [stockNumbers, setStockNumbers] = useState(rfqStockDefault);
  const [qty, setQty] = useState(rfqQtyDefault);

  useEffect(() => {
    setStockNumbers(rfqStockDefault);
    if (rfqQtyDefault) setQty(rfqQtyDefault);
  }, [rfqStockDefault, rfqQtyDefault]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("form-name", "quote");
    formData.set("rfqLines", rfqLinesText);

    const payload = Object.fromEntries(formData.entries());

    try {
      // Netlify Forms (production) — post to static skeleton
      const netlifyRes = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(payload as Record<string, string>).toString(),
      });

      // Also hit local API stub (logs + mailto fallback helper)
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!netlifyRes.ok && netlifyRes.status !== 404) {
        // 404 locally is expected before Netlify deploy
        throw new Error(`Form error ${netlifyRes.status}`);
      }

      setStatus("ok");
      setMessage(
        netlifyRes.ok
          ? `Quote submitted to ${site.email}. Sales will respond during business hours — or call ${site.tollFree}.`
          : `Quote recorded locally. On Netlify deploy, submissions go to Forms → notify ${site.email}. You can also call ${site.tollFree} or fax ${site.fax}.`,
      );
      clear();
      form.reset();
      setStockNumbers("");
      setQty("");
    } catch {
      const subject = encodeURIComponent(
        `Quote request — ${payload.facility || payload.name || "PNWX"}`,
      );
      const body = encodeURIComponent(
        [
          `Name: ${payload.name}`,
          `Facility: ${payload.facility}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone}`,
          `Stock #s: ${payload.stockNumbers}`,
          `Qty: ${payload.qty}`,
          "",
          "RFQ lines:",
          rfqLinesText || "(none)",
          "",
          String(payload.notes || ""),
        ].join("\n"),
      );
      window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
      setStatus("ok");
      setMessage(`Opening email to ${site.email} as fallback.`);
    }
  }

  return (
    <form
      name="quote"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <input type="hidden" name="form-name" value="quote" />
      <p className="hidden">
        <label>
          Don’t fill this out: <input name="bot-field" />
        </label>
      </p>
      <textarea name="rfqLines" value={rfqLinesText} readOnly className="hidden" aria-hidden />

      {lines.length > 0 && (
        <div className="rounded-md border border-teal-600/30 bg-teal-50 px-3 py-2 text-sm text-teal-900">
          <p className="font-semibold">{lines.length} items from your quote list</p>
          <ul className="mt-1 space-y-0.5 font-mono text-xs">
            {lines.map((l) => (
              <li key={l.stockNumber}>
                {l.qty} × {l.stockNumber} — {l.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required autoComplete="name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="facility">Facility / Organization *</Label>
          <Input id="facility" name="facility" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" name="phone" type="tel" required autoComplete="tel" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="stockNumbers">Stock number(s)</Label>
          <Input
            id="stockNumbers"
            name="stockNumbers"
            value={stockNumbers}
            onChange={(e) => setStockNumbers(e.target.value)}
            placeholder="e.g. UFP-KI-LF, 18442"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qty">Quantity / sizes</Label>
          <Input
            id="qty"
            name="qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="e.g. 2 × M, 1 × L"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">Notes / options / dock hours</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={defaultNotes}
            placeholder="Lead eq, fabric, focal distance, lift-gate, dock hours…"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" disabled={status === "loading"} size="lg">
          {status === "loading" ? "Sending…" : "Submit quote request"}
        </Button>
        <p className="text-xs text-slate-muted">
          Equal paths:{" "}
          <a className="font-medium text-teal-700" href={`tel:${site.tollFreeTel}`}>
            {site.tollFree}
          </a>{" "}
          · Fax {site.fax} ·{" "}
          <a className="font-medium text-teal-700" href={site.orderFormPath}>
            PDF order form
          </a>
        </p>
      </div>

      {message && (
        <p
          className="rounded-md border border-teal-600/30 bg-teal-50 px-3 py-2 text-sm text-teal-800"
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}
