"use client";

import Image from "next/image";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { SectionTitle, PillBtn, MahiLogo } from "../ui";
import { faPrice, toFaDigits } from "@/lib/format";
import { Waves, ShieldCheck, Flame, Clock, MapPin, Phone, Navigation, Sparkles, ChevronLeft, Heart, Fish } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: ShieldCheck, tone: "teal", title: "کاملاً بهداشتی", sub: "با عالی‌ترین کیفیت مواد اولیه" },
  { icon: Flame, tone: "pink", title: "پخت تازه و داغ", sub: "همین لحظه آماده" },
  { icon: Clock, tone: "teal", title: "سریع‌ترین ارسال", sub: "در کمترین زمان ممکن" },
  { icon: MapPin, tone: "pink", title: "تحویل در محل", sub: "به تمامی نقاط شهر" },
];

export default function HomeView() {
  const { data } = useApp();
  const { go } = useMahiStore();
  const settings = data?.settings;
  const categories = data?.categories ?? [];

  return (
    <div className="space-y-5">
      {/* ───── بنر قهرمان ───── */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        aria-label="بنر اصلی"
        className="relative rounded-[26px] overflow-hidden shadow-[0_10px_30px_rgba(236,64,122,.25)]"
      >
        {/* پس‌زمینه ساحلی (تصویر داینامیک قابل تعویض) */}
        <div className="absolute inset-0">
          <Image src="/assets/hero-bg.png" alt="" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 430px" />
        </div>

        <div className="relative z-10 px-4 pt-5 pb-6 flex flex-col items-center">
          {/* بج «ماهی و غذای دریایی» */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-brand/90 text-white text-[11px] font-extrabold px-3.5 py-1.5 shadow">
            <Fish className="h-3.5 w-3.5" aria-hidden />
            {settings?.heroBadgeText || "ماهی و غذای دریایی"}
            <Heart className="h-3 w-3 fill-white/80" aria-hidden />
            <Heart className="h-2.5 w-2.5 fill-white/60" aria-hidden />
          </span>

          {/* عکس ماهی قهرمان (داینامیک از تنظیمات) */}
          <div className="relative mt-3 w-[86%] aspect-[16/10]">
            {settings?.heroImage && (
              <Image
                src={settings.heroImage}
                alt="ماهی کبابی تازه"
                fill
                priority
                unoptimized
                className="rounded-[22px] object-cover border-[3px] border-white/80 shadow-[0_10px_26px_rgba(88,24,69,.45)]"
                sizes="(max-width: 768px) 100vw, 430px"
              />
            )}
          </div>

          {/* متن روی بنر */}
          <div className="mt-3 text-center leading-8 drop-shadow-[0_2px_6px_rgba(88,24,69,.6)]">
            <span className="text-white text-[30px] font-black">{settings?.heroTitle}</span>{" "}
            <span className="text-white text-[22px] font-extrabold">{settings?.heroSubtitle}</span>
            <Waves className="h-3.5 w-32 mx-auto mt-0.5 text-white/90" aria-hidden />
          </div>

          {/* دکمه شروع سفارش */}
          <button
            type="button"
            onClick={() => go("menu")}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-7 h-12 text-white text-[16px] font-black border-[3px] border-white shadow-[0_10px_24px_rgba(168,20,87,.45)] active:scale-95 transition-transform"
          >
            {settings?.heroCtaText || "شروع سفارش"}
            <span className="h-8 w-8 rounded-full bg-white grid place-items-center">
              <ChevronLeft className="h-5 w-5 text-brand" strokeWidth={3} aria-hidden />
            </span>
          </button>
        </div>
      </motion.section>

      {/* ───── ویژگی‌ها (کارت سفید روی بنر) ───── */}
      <section aria-label="ویژگی‌های ما" className="my-card -mt-9 z-20 relative pt-5 pb-4 px-3 shadow-[0_-8px_24px_rgba(236,64,122,.18)]">
        <div className="grid grid-cols-4 gap-1 text-center">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="px-1">
                <span className={`mx-auto mb-2 h-12 w-12 grid place-items-center rounded-full ${f.tone === "teal" ? "bg-teal-mist text-teal-deep" : "bg-brand-mist text-brand"}`}>
                  <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
                </span>
                <p className="text-[12px] font-extrabold text-ink leading-4">{f.title}</p>
                <p className="text-[10px] text-grey leading-[14px] mt-0.5">{f.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ───── انواع ماهی ها ───── */}
      <section aria-label="انواع ماهی‌ها" className="pt-1">
        <div className="flex items-center justify-center gap-2">
          <Fish className="h-5 w-5 text-brand" strokeWidth={2.6} aria-hidden />
          <h2 className="text-[18px] font-black text-teal-deep">انواع ماهی ها</h2>
          <Waves className="h-4 w-12 text-brand-soft" strokeWidth={2.6} aria-hidden />
        </div>

        <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1" role="list">
          {categories.map((c, i) => (
            <motion.button
              key={c.id}
              type="button"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => go("menu", { category: c.id })}
              role="listitem"
              aria-label={`دسته‌بندی ${c.name}`}
              className="shrink-0 w-36 my-card-sm p-2 text-center active:scale-95 transition-transform"
            >
              <span className="relative block w-full aspect-square rounded-[12px] overflow-hidden mb-2">
                {c.image && <Image src={c.image} alt={c.name} fill unoptimized className="object-cover" sizes="144px" />}
                {c.fishes.length > 0 && (
                  <span className="absolute bottom-1.5 left-1.5 h-7 w-7 rounded-full bg-brand grid place-items-center shadow-md">
                    <ChevronLeft className="h-4 w-4 text-white" strokeWidth={3} aria-hidden />
                  </span>
                )}
              </span>
              <span className="block text-[13px] font-extrabold text-ink leading-5">{c.name}</span>
              <span className="block text-[10px] text-grey">{toFaDigits(c.fishes.length)} نوع پخت</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ───── بنر تبلیغاتی ───── */}
      <motion.section
        aria-label="بنر تبلیغاتی"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative h-28 rounded-[22px] overflow-hidden shadow-[0_8px_22px_rgba(0,172,193,.28)] bg-gradient-to-l from-brand via-brand-mid to-teal-brand"
      >
        <div className="absolute inset-y-0 left-0 w-1/2">
          <Image src="/assets/promo-boat.png" alt="" fill className="object-cover opacity-90 rounded-l-[22px]" sizes="220px" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-end justify-center text-left pr-4 pl-40 text-white">
          <p className="text-[19px] font-black leading-7 drop-shadow-[0_2px_4px_rgba(88,24,69,.5)]">
            {settings?.promoTitle || "سفارش آنلاین"}
          </p>
          <p className="text-[13px] font-bold text-white/90 flex items-center gap-1">
            {settings?.promoSubtitle || "همیشه کنارت"}
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
          </p>
        </div>
      </motion.section>

      {/* ───── اطلاعات تماس ───── */}
      <section aria-label="راه‌های ارتباطی" className="my-card p-4 grid grid-cols-3 gap-3 text-center">
        <div className="space-y-1.5">
          <MapPin className="mx-auto h-6 w-6 text-brand" strokeWidth={2.2} aria-hidden />
          <p className="text-[12px] font-extrabold text-ink">آدرس محل تحویل</p>
          <p className="text-[10px] leading-[15px] text-grey">{settings?.addressText}</p>
          <PillBtn tone="ghost" className="h-8 text-[11px] px-4 mx-auto" >
            <Navigation className="h-3.5 w-3.5" aria-hidden />
            مسیریابی
          </PillBtn>
        </div>
        <div className="space-y-1.5 border-x border-dashed border-brand-soft px-2">
          <Clock className="mx-auto h-6 w-6 text-teal-deep" strokeWidth={2.2} aria-hidden />
          <p className="text-[12px] font-extrabold text-ink">ساعت کاری</p>
          <p className="text-[11px] leading-5 text-grey font-bold tabular-nums">{settings?.workHours}</p>
          <p className="text-[10px] text-grey">۸:۰۰ الی ۱۵:۰۰</p>
        </div>
        <div className="space-y-1.5">
          <Phone className="mx-auto h-6 w-6 text-brand" strokeWidth={2.2} aria-hidden />
          <p className="text-[12px] font-extrabold text-ink">تماس با ما</p>
          <a dir="ltr" href={`tel:${(settings?.phone || "").replace(/\s/g, "")}`} className="text-[13px] font-extrabold text-ink-2 tabular-nums hover:text-brand transition-colors">
            {settings?.phone}
          </a>
          <div>
            <PillBtn tone="ghost" className="h-8 text-[11px] px-5 mx-auto">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              تماس
            </PillBtn>
          </div>
        </div>
      </section>

      {/* ───── پاورقی ───── */}
      <footer className="text-center pb-2 pt-1">
        <div className="flex items-center justify-center gap-2 opacity-90">
          <MahiLogo size="sm" />
        </div>
        <p className="text-[12px] font-bold text-ink-2/85 mt-2">
          {settings?.footerNote || "عشق ماهی، عشق تازگی"} <span aria-hidden>❤️</span>
        </p>
      </footer>
    </div>
  );
}
