import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const profile = await db.profile.findFirst();
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const allowed = ["name", "phone", "avatar", "role", "note"] as const;
    const data: Record<string, unknown> = {};
    for (const k of allowed) if (k in body) data[k] = String(body[k]).trim();
    const current = await db.profile.findFirst();
    const profile = current
      ? await db.profile.update({ where: { id: current.id }, data })
      : await db.profile.create({ data: { name: "کاربر", phone: "", ...data } });
    return NextResponse.json(profile);
  } catch (e) {
    return NextResponse.json({ error: "profile update failed" }, { status: 500 });
  }
}
