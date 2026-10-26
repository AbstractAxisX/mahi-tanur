import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toEnDigits } from "@/lib/format";

function normalizePhone(raw: string): string {
  return toEnDigits(String(raw)).replace(/[\s\-()]/g, "");
}

/** به‌روزرسانی حساب کاربر واردشده (نام / شماره / آواتار) */
export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      name?: string;
      phone?: string;
      avatar?: string | null;
    };
    const userId = String(body.userId ?? "");
    if (!userId) return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });

    const data: { name?: string; phone?: string; avatar?: string | null } = {};
    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (name.length < 2) return NextResponse.json({ error: "نام را کامل وارد کنید" }, { status: 400 });
      data.name = name;
    }
    if (typeof body.phone === "string" && body.phone.trim()) {
      const phone = normalizePhone(body.phone);
      if (!/^09\d{9}$/.test(phone)) {
        return NextResponse.json({ error: "شماره موبایل معتبر نیست" }, { status: 400 });
      }
      const dup = await db.user.findFirst({ where: { phone, NOT: { id: userId } } });
      if (dup) return NextResponse.json({ error: "این شماره متعلق به حساب دیگری است" }, { status: 400 });
      data.phone = phone;
    }
    if (body.avatar !== undefined) {
      data.avatar = body.avatar === null || body.avatar === "" ? null : String(body.avatar);
    }

    const user = await db.user.update({ where: { id: userId }, data });
    return NextResponse.json({
      user: { id: user.id, name: user.name, phone: user.phone, avatar: user.avatar, role: user.role },
    });
  } catch (e) {
    console.error("user update error", e);
    return NextResponse.json({ error: "ذخیره انجام نشد — دوباره تلاش کنید" }, { status: 500 });
  }
}
