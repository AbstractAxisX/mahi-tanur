// Seed: ماهی‌یار — dynamic data (admin-editable later via admin panel)
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const IMG = {
  hero: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/59030ca6228c.jpg",
  heroAlt: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/59030ca6228c.jpg",
  trout: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/0ba7871c79fe.jpg",
  trout2: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/b85ac5aaac21.jpg",
  carp: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/c7e22b7e6bb6.jpg",
  carp2: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d7db21082b25.jpg",
  salmon: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/aad9d3a52085.jpg",
  salmon2: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/eb60638060d4.jpg",
  sole: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/467b6edc2934.jpg",
  seabass: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/41b65773d9ac.jpg",
  shir: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d01989f40e22.jpg",
  shir2: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/e339a9eeca04.jpg",
  fish2: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/42cb1ce0c3a0.jpg",
  veg: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/3290854866de.jpg",
  lemon: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/65712c768c51.jpeg",
  tomato: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d69075b1000a.jpg",
  onion: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/fce72d2ef398.jpg",
  garlic: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a650ffb25dae.jpg",
};

async function main() {
  // ── SiteSettings ──
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

  // ── دسته‌بندی‌ها (گونه‌های ماهی) ──
  const catDefs = [
    { name: "قزل آلا", image: IMG.trout, order: 1 },
    { name: "کپور", image: IMG.carp, order: 2 },
    { name: "شیر ماهی", image: IMG.shir, order: 3 },
    { name: "سالمون", image: IMG.salmon, order: 4 },
    { name: "سوف", image: IMG.sole, order: 5 },
    { name: "فیل ماهی", image: IMG.seabass, order: 6 },
  ];
  const cats: Record<string, string> = {};
  for (const c of catDefs) {
    const found = await db.fishCategory.findFirst({ where: { name: c.name } });
    const row = found
      ? await db.fishCategory.update({ where: { id: found.id }, data: c })
      : await db.fishCategory.create({ data: c });
    cats[c.name] = row.id;
  }

  // ── انواع ماهی (آماده‌سازی‌ها) ──
  const fishDefs = [
    {
      name: "قزل آلا کبابی",
      image: IMG.trout,
      description: "قزل آلای تازه کبابی روی زغال، همراه با سبزیجات تازه و لیمو ترش؛ با عطر دل‌انگیز زغال و طعم بی‌نظیر.",
      price: 195000,
      badgeText: "پیشنهاد سرآشپز",
      category: "قزل آلا",
      order: 1,
    },
    {
      name: "قزل آلا با سس مایونز",
      image: IMG.trout2,
      description: "قزل آلا با سالاد سس مایونز، لیمو ترش تازه و پنیر؛ ترکیبی رویایی برای یک شام خاص.",
      price: 210000,
      category: "قزل آلا",
      order: 2,
    },
    {
      name: "کپور شکم‌پر",
      image: IMG.carp,
      description: "کپور شکم‌پر با سبزیجات معطر، سس مخصوص و لیمو عمانی؛ درست مثل مهمانی‌های شمال.",
      price: 220000,
      badgeText: "محبوب",
      category: "کپور",
      order: 3,
    },
    {
      name: "کپور کبابی",
      image: IMG.carp2,
      description: "کپور کبابی مزه‌دار شده با ادویه مخصوص، کبابی روی زغال و سرو با حلقه‌های پیاز.",
      price: 200000,
      category: "کپور",
      order: 4,
    },
    {
      name: "شیر ماهی گریل",
      image: IMG.shir,
      description: "شیر ماهی گریل با لیمو عمانی تازه؛ گوشت نرم و لطیف، پخته‌شده با حوصله.",
      price: 280000,
      category: "شیر ماهی",
      order: 5,
    },
    {
      name: "سالمون با لیمو عمانی",
      image: IMG.salmon,
      description: "سالمون تازه با لیمو عمانی و کره گیاهی؛ برای کسانی که طعم‌های خاص را می‌شناسند.",
      price: 320000,
      badgeText: "ویژه",
      category: "سالمون",
      order: 6,
    },
    {
      name: "سوف گریل با سبزیجات",
      image: IMG.sole,
      description: "سوف گریل با سبزیجات سوزاری و سس لیمو؛ سبک، تازه و خوش‌طعم.",
      price: 240000,
      category: "سوف",
      order: 7,
    },
    {
      name: "فیل ماهی کبابی",
      image: IMG.seabass,
      description: "فیل ماهی کبابی با سس مخصوص ماهی‌یار؛ خوشمزه، تازه و با کیفیت تضمینی.",
      price: 185000,
      category: "فیل ماهی",
      order: 8,
    },
  ];
  for (const f of fishDefs) {
    const found = await db.fish.findFirst({ where: { name: f.name } });
    const { category, ...rest } = f;
    const data = { ...rest, categoryId: cats[category] };
    if (found) await db.fish.update({ where: { id: found.id }, data });
    else await db.fish.create({ data });
  }

  // ── حشو (گزینه‌های اختیاری) ──
  const extraDefs = [
    { name: "سبزیجات", image: IMG.veg, price: 10000, order: 1 },
    { name: "لیمو و سس", image: IMG.lemon, price: 15000, order: 2 },
    { name: "گوجه و قارچ", image: IMG.tomato, price: 20000, order: 3 },
    { name: "پیاز", image: IMG.onion, price: 5000, order: 4 },
    { name: "سیر", image: IMG.garlic, price: 8000, order: 5 },
  ];
  for (const e of extraDefs) {
    const found = await db.extra.findFirst({ where: { name: e.name } });
    if (found) await db.extra.update({ where: { id: found.id }, data: e });
    else await db.extra.create({ data: e });
  }

  // ── بازه‌های زمانی (طبق درخواست کارفرما) ──
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

  // ── پروفایل ──
  const profileCount = await db.profile.count();
  if (profileCount === 0) {
    await db.profile.create({
      data: { name: "احسان", phone: "۰۹۱۲۱۴۴۹۰۵۴", role: "کاربر عالی", note: "عشق ماهی، عشق تازگی" },
    });
  }

  // ── آدرس‌های ذخیره‌شده ──
  const addrDefs = [
    { title: "خانه", full: "اصفهان، خیابان سعیدی، نبش کوچه توفیق، زنگ ۴", receiver: "احسان", phone: "۰۹۱۲۱۴۴۹۰۵۴", isDefault: true, lat: 32.64237, lng: 51.66742 },
    { title: "محل کار", full: "اصفهان، خیابان نصر، پلاک ۱۲، طبقه دوم", receiver: "احسان", phone: "۰۹۱۲۱۴۴۹۰۵۴", isDefault: false, lat: 32.6539, lng: 51.66602 },
    { title: "خانه مادر", full: "اصفهان، جنوب بلوار شهید فهمیده، کوچه ۱۲، پلاک ۸", receiver: "مادر", phone: "۰۹۱۹۱۴۹۴۵۵۷", isDefault: false, lat: 32.62981, lng: 51.66072 },
  ];
  if ((await db.address.count()) === 0) {
    for (const a of addrDefs) await db.address.create({ data: a });
  }

  // ── علاقه‌مندی‌ها ──
  if ((await db.favorite.count()) === 0) {
    const favNames = ["قزل آلا کبابی", "سالمون با لیمو عمانی", "کپور شکم‌پر", "شیر ماهی گریل"];
    for (const n of favNames) {
      const f = await db.fish.findFirst({ where: { name: n } });
      if (f) await db.favorite.create({ data: { fishId: f.id } });
    }
  }

  // ── سفارش‌های نمونه ──
  if ((await db.order.count()) === 0) {
    const soleFish = await db.fish.findFirst({ where: { name: "سوف گریل با سبزیجات" } });
    const carpFish = await db.fish.findFirst({ where: { name: "کپور شکم‌پر" } });
    const troutFish = await db.fish.findFirst({ where: { name: "قزل آلا کبابی" } });
    const orderDefs = [
      {
        fishId: soleFish?.id,
        fishName: "ماهی سوف",
        fishImage: IMG.sole,
        fishPrice: 190000,
        quantity: 1,
        extrasJson: JSON.stringify([{ name: "سبزیجات", price: 10000 }]),
        extrasTotal: 10000,
        deliveryMethodTitle: "پیک رفت و برگشت",
        deliveryPrice: 50000,
        timeSlotLabel: "۱۱:۰۰ تا ۱۳:۰۰",
        timeSlotShift: "ظهر",
        addressFull: "اصفهان، خیابان سعیدی، نبش کوچه توفیق، زنگ ۴",
        addressLat: 32.64237,
        addressLng: 51.66742,
        receiver: "احسان",
        receiverPhone: "۰۹۱۲۱۴۴۹۰۵۴",
        note: "زنگ تفریح",
        total: 250000,
        status: "preparing",
      },
      {
        fishId: carpFish?.id,
        fishName: "ماهی کپور",
        fishImage: IMG.carp,
        fishPrice: 220000,
        quantity: 2,
        extrasJson: JSON.stringify([{ name: "لیمو و سس", price: 15000 }]),
        extrasTotal: 15000,
        deliveryMethodTitle: "تحویل در محل",
        deliveryPrice: 0,
        timeSlotLabel: "۱۸:۰۰ تا ۲۰:۰۰",
        timeSlotShift: "عصر",
        addressFull: "اصفهان، خیابان نصر، پلاک ۱۲، طبقه دوم",
        addressLat: 32.6539,
        addressLng: 51.66602,
        receiver: "احسان",
        receiverPhone: "۰۹۱۲۱۴۴۹۰۵۴",
        note: null,
        total: 455000,
        status: "delivered",
      },
      {
        fishId: troutFish?.id,
        fishName: "قزل آلا کبابی",
        fishImage: IMG.trout,
        fishPrice: 195000,
        quantity: 1,
        extrasJson: JSON.stringify([{ name: "پیاز", price: 5000 }]),
        extrasTotal: 5000,
        deliveryMethodTitle: "پیک فقط رفت",
        deliveryPrice: 30000,
        timeSlotLabel: "۱۱:۰۰ تا ۱۳:۰۰",
        timeSlotShift: "ظهر",
        addressFull: "اصفهان، جنوب بلوار شهید فهمیده، کوچه ۱۲، پلاک ۸",
        receiver: "مادر",
        receiverPhone: "۰۹۱۹۱۴۹۴۵۵۷",
        note: null,
        total: 230000,
        status: "preparing",
      },
    ];
    for (const o of orderDefs) await db.order.create({ data: o });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
