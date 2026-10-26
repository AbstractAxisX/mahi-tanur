import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* اعتبارسنجی مختصات جغرافیایی */
function parseCoord(v: unknown, min: number, max: number): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const b = await req.json();
    const data: Record<string, unknown> = {};
    if ("title" in b) data.title = String(b.title).trim();
    if ("full" in b) data.full = String(b.full).trim();
    if ("receiver" in b) data.receiver = b.receiver ? String(b.receiver).trim() : null;
    if ("phone" in b) data.phone = b.phone ? String(b.phone).trim() : null;
    if ("lat" in b || "lng" in b) {
      const lat = parseCoord(b.lat, -90, 90);
      const lng = parseCoord(b.lng, -180, 180);
      data.lat = lat != null && lng != null ? lat : null;
      data.lng = lng != null && lat != null ? lng : null;
    }
    if ("isDefault" in b) {
      if (b.isDefault) await db.address.updateMany({ data: { isDefault: false } });
      data.isDefault = Boolean(b.isDefault);
    }
    const addr = await db.address.update({ where: { id }, data });
    return NextResponse.json(addr);
  } catch {
    return NextResponse.json({ error: "address update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.address.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "address delete failed" }, { status: 500 });
  }
}
