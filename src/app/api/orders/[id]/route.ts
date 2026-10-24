import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await _req.json();
    const allowed = ["status", "note"] as const;
    const data: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) data[k] = body[k];
    const order = await db.order.update({ where: { id }, data });
    return NextResponse.json(order);
  } catch (e) {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.order.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}
