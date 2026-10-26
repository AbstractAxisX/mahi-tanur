import { NextRequest, NextResponse } from "next/server";

/** مشخصات پیش‌فرض مدیر — قابل تغییر با متغیر محیطی ADMIN_USER / ADMIN_PASS */
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

/** مقایسه ثابت‌زمانی برای جلوگیری از حملات زمانی */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** ورود مدیر پنل — فقط مدیر به پنل مدیریت دسترسی دارد */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");

    if (!safeEqual(username, ADMIN_USER) || !safeEqual(password, ADMIN_PASS)) {
      return NextResponse.json({ error: "نام کاربری یا رمز مدیر اشتباه است" }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: "admin", name: "مدیر سیستم", phone: "", role: "admin" },
    });
  } catch (e) {
    console.error("admin login error", e);
    return NextResponse.json({ error: "ورود انجام نشد — دوباره تلاش کنید" }, { status: 500 });
  }
}
