import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [settings, categories, extras, timeSlots, deliveryMethods, profile, addresses, favorites, orders] =
      await Promise.all([
        db.siteSettings.findUnique({ where: { id: 1 } }),
        db.fishCategory.findMany({
          where: { active: true },
          orderBy: { order: "asc" },
          include: { fishes: { where: { active: true }, orderBy: { order: "asc" } } },
        }),
        db.extra.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
        db.timeSlot.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
        db.deliveryMethod.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
        db.profile.findFirst(),
        db.address.findMany({ orderBy: { createdAt: "desc" } }),
        db.favorite.findMany(),
        db.order.findMany({ orderBy: { createdAt: "desc" } }),
      ]);

    return NextResponse.json({
      settings,
      categories,
      extras,
      timeSlots,
      deliveryMethods,
      profile,
      addresses,
      favorites: favorites.map((f) => f.fishId),
      orders,
    });
  } catch (e) {
    console.error("app boot error", e);
    return NextResponse.json({ error: "boot failed" }, { status: 500 });
  }
}
