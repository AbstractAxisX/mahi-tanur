import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toEnDigits } from "@/lib/format";

/** نرمال‌سازی شماره موبایل: ارقام فارسی/عربی → انگلیسی + حذف فاصله و خط تیره */
export function normalizePhone(raw: string): string {
  return toEnDigits(String(raw)).replace(/[\s\-()]/g, "");
}

export function isValidPhone(p: string): boolean {
  return /^09\d{9}$/.test(p);
}

/**
 * ورود / ثبت‌نام کاربر — فقط اسم و شماره موبایل (بدون رمز و کد تأیید)
 * اگر شماره قبلاً ثبت شده باشد وارد همان حساب می‌شود؛ در غیر این صورت حساب جدید ساخته می‌شود.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { name?: string; phone?: string };
    const name = String(body.name ?? "").trim();
    const phone = normalizePhone(String(body.phone ?? ""));

    if (name.length < 2) {
      return NextResponse.json({ error: "نام را کامل وارد کنید (حداقل ۲ حرف)" }, { status: 400 });
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "شماره موبایل معتبر نیست — مثلاً ۰۹۱۲۳۴۵۶۷۸۹" }, { status: 400 });
    }

    const user = await db.user.upsert({
      where: { phone },
      update: { name },
      create: { name, phone, role: "user" },
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, phone: user.phone, avatar: user.avatar, role: user.role },
    });
  } catch (e) {
    console.error("login error", e);
    return NextResponse.json({ error: "ورود انجام نشد — دوباره تلاش کنید" }, { status: 500 });
  }
}
