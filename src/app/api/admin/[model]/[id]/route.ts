import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pickAdminData } from "@/lib/admin-coerce";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ model: string; id: string }> }) {
  const { model, id } = await params;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const data = pickAdminData(body);
    switch (model) {
      case "categories":
        return NextResponse.json(await db.fishCategory.update({ where: { id }, data }));
      case "fish":
        return NextResponse.json(await db.fish.update({ where: { id }, data }));
      case "extras":
        return NextResponse.json(await db.extra.update({ where: { id }, data }));
      case "timeslots":
        return NextResponse.json(await db.timeSlot.update({ where: { id }, data }));
      case "delivery-methods":
        return NextResponse.json(await db.deliveryMethod.update({ where: { id }, data }));
      case "settings":
        return NextResponse.json(await db.siteSettings.update({ where: { id: 1 }, data }));
      case "orders":
        return NextResponse.json(await db.order.update({ where: { id }, data: pickAdminData({ status: body.status, note: body.note }) }));
      case "addresses":
        if (data.isDefault === true) await db.address.updateMany({ data: { isDefault: false } });
        return NextResponse.json(await db.address.update({ where: { id }, data }));
      default:
        return NextResponse.json({ error: "unknown model" }, { status: 404 });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ model: string; id: string }> }) {
  const { model, id } = await params;
  try {
    switch (model) {
      case "categories":
        await db.fishCategory.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "fish":
        await db.fish.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "extras":
        await db.extra.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "timeslots":
        await db.timeSlot.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "delivery-methods":
        await db.deliveryMethod.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "orders":
        await db.order.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      case "addresses":
        await db.address.delete({ where: { id } });
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "unknown model" }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ error: "delete failed" }, { status: 500 });
  }
}
