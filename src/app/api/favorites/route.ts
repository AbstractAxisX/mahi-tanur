import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const favs = await db.favorite.findMany();
  return NextResponse.json(favs.map((f) => f.fishId));
}

/** POST {fishId} → toggle */
export async function POST(req: NextRequest) {
  try {
    const { fishId } = await req.json();
    if (!fishId) return NextResponse.json({ error: "fishId required" }, { status: 400 });
    const existing = await db.favorite.findFirst({ where: { fishId } });
    if (existing) {
      await db.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ fishId, favorite: false });
    }
    await db.favorite.create({ data: { fishId } });
    return NextResponse.json({ fishId, favorite: true });
  } catch (e) {
    return NextResponse.json({ error: "favorite toggle failed" }, { status: 500 });
  }
}
