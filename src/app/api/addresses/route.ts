import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const list = await db.address.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const title = String(b.title ?? "").trim();
    const full = String(b.full ?? "").trim();
    if (!title || !full) return NextResponse.json({ error: "عنوان و متن آدرس الزامی است" }, { status: 400 });

    // اگر این آدرس پیش‌فرض است، بقیه پیش‌فرض نیستند
    if (b.isDefault) await db.address.updateMany({ data: { isDefault: false } });

    const addr = await db.address.create({
      data: {
        title,
        full,
        receiver: b.receiver ? String(b.receiver).trim() : null,
        phone: b.phone ? String(b.phone).trim() : null,
        isDefault: Boolean(b.isDefault),
      },
    });
    return NextResponse.json(addr, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "address create failed" }, { status: 500 });
  }
}
