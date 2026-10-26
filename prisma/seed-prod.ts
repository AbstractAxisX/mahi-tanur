// Seed پروداکشن — فقط داده‌های عملیاتی ضروری؛ «هیچ دیتای تستی» ایجاد نمی‌کند.
// شامل: تنظیمات سایت + بازه‌های زمانی + روش‌های دریافت
// خالی می‌ماند: ماهی‌ها، دسته‌ها، حشوها، سفارش‌ها، آدرس‌ها، کاربران (همگی از پنل ادمین اضافه می‌شوند)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // ── SiteSettings (پیش‌فرض؛ از پنل ادمین قابل ویرایش است) ──
  await db.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      appName: "ماهی تنور",
      appSlogan: "سفارش آنلاین ماهی تازه",
      logoImage: null,
      heroImage: "/assets/hero-bg.png",
      heroTitle: "طعم و لذیذ",
      heroSubtitle: "بی‌نظیر",
      heroCtaText: "ثبت سفارش",
      heroBadgeText: "ماهی و غذای دریایی",
      promoImage: "/assets/promo-boat.png",
      promoLink: null,
      addressText: "اصفهان، خیابان نصر، جنوب بلوار شهید فهمیده",
      workHours: "۱۱:۰۰ الی ۲۳:۰۰",
      phone: "۰۹۱۹۱۴۹۴۵۵۷",
      footerNote: "عشق ماهی، عشق تازگی",
      instagram: "mahi_tanou",
    },
  });

  // ── بازه‌های زمانی تحویل (طبق درخواست کارفرما) ──
  const timeDefs = [
    { label: "۱۱:۰۰ تا ۱۳:۰۰", shift: "ظهر", icon: "sun", order: 1 },
    { label: "۱۸:۰۰ تا ۲۰:۰۰", shift: "عصر", icon: "moon", order: 2 },
  ];
  for (const t of timeDefs) {
    const found = await db.timeSlot.findFirst({ where: { label: t.label } });
    if (found) await db.timeSlot.update({ where: { id: found.id }, data: t });
    else await db.timeSlot.create({ data: t });
  }

  // ── روش دریافت کالا (طبق درخواست کارفرما) ──
  const dmDefs = [
    { code: "in_place", title: "تحویل در محل", subtitle: "بدون پیک | رایگان", price: 0, icon: "home", order: 1 },
    { code: "round_trip", title: "پیک رفت و برگشت", subtitle: "با پیک اختصاصی", price: 50000, icon: "truck", order: 2 },
    { code: "one_way", title: "پیک فقط رفت", subtitle: "تحویل توسط پیک", price: 30000, icon: "scooter", order: 3 },
  ];
  for (const d of dmDefs) {
    const found = await db.deliveryMethod.findUnique({ where: { code: d.code } });
    const { code, ...rest } = d;
    if (found) await db.deliveryMethod.update({ where: { id: found.id }, data: rest });
    else await db.deliveryMethod.create({ data: d });
  }

  console.log("✅ Production seed complete (فقط تنظیمات پایه — بدون دیتای تستی)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
