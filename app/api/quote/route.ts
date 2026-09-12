import { NextResponse } from "next/server";
import { site } from "@/lib/site";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const required = ["name", "facility", "email", "phone"];
    for (const key of required) {
      if (!String(body[key] || "").trim()) {
        return NextResponse.json(
          { ok: false, error: `Missing field: ${key}` },
          { status: 400 },
        );
      }
    }

    console.info("[quote]", {
      at: new Date().toISOString(),
      name: body.name,
      facility: body.facility,
      email: body.email,
      phone: body.phone,
      stockNumbers: body.stockNumbers,
      qty: body.qty,
      rfqLines: body.rfqLines,
    });

    const subject = encodeURIComponent(
      `Quote request — ${body.facility} (${body.stockNumbers || "see RFQ list"})`,
    );
    const mailBody = encodeURIComponent(
      [
        `Name: ${body.name}`,
        `Facility: ${body.facility}`,
        `Email: ${body.email}`,
        `Phone: ${body.phone}`,
        `Stock #s: ${body.stockNumbers || "—"}`,
        `Qty: ${body.qty || "—"}`,
        "",
        "RFQ lines:",
        body.rfqLines || "(none)",
        "",
        body.notes || "",
      ].join("\n"),
    );

    return NextResponse.json({
      ok: true,
      received: true,
      mailto: `mailto:${site.email}?subject=${subject}&body=${mailBody}`,
      note: "On Netlify, configure Forms notifications to SalesD@pnwx.com",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
}
