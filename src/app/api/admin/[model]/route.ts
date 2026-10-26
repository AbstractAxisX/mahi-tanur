import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const KNOWN = ["categories", "fish", "extras", "timeslots", "delivery-methods", "settings", "orders", "addresses"] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  switch (model) {
    case "categories":
      return NextResponse.json(await db.fishCategory.findMany({ orderBy: { order: "asc" } }));
    case "fish":
      return NextResponse.json(
        await db.fish.findMany({ orderBy: { order: "asc" }, include: { category: true } })
      );
    case "extras":
      return NextResponse.json(await db.extra.findMany({ orderBy: { order: "asc" } }));
    case "timeslots":
      return NextResponse.json(await db.timeSlot.findMany({ orderBy: { order: "asc" } }));
    case "delivery-methods":
      return NextResponse.json(await db.deliveryMethod.findMany({ orderBy: { order: "asc" } }));
    case "settings":
      return NextResponse.json(await db.siteSettings.findUnique({ where: { id: 1 } }));
    case "orders":
      return NextResponse.json(await db.order.findMany({ orderBy: { createdAt: "desc" } }));
    case "addresses":
      return NextResponse.json(await db.address.findMany({ orderBy: { createdAt: "desc" } }));
    default:
      return NextResponse.json({ error: "unknown model" }, { status: 404 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ model: string }> }) {
  const { model } = await params;
  if (!KNOWN.includes(model as (typeof KNOWN)[number])) {
    return NextResponse.json({ error: "unknown model" }, { status: 404 });
  }
  try {
    const body = await req.json();
    switch (model) {
      case "categories":
        return NextResponse.json(await db.fishCategory.create({ data: body }), { status: 201 });
      case "fish":
        return NextResponse.json(await db.fish.create({ data: body }), { status: 201 });
      case "extras":
        return NextResponse.json(await db.extra.create({ data: body }), { status: 201 });
      case "timeslots":
        return NextResponse.json(await db.timeSlot.create({ data: body }), { status: 201 });
      case "delivery-methods":
        return NextResponse.json(await db.deliveryMethod.create({ data: body }), { status: 201 });
      case "addresses":
        return NextResponse.json(await db.address.create({ data: body }), { status: 201 });
      default:
        return NextResponse.json({ error: "not allowed" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
