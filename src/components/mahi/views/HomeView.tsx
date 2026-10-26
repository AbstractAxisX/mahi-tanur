"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { CircleBtn } from "../ui";
import { toFaDigits } from "@/lib/format";
import { PiFish, PiFishSimple } from "react-icons/pi";
import { Waves, MapPin, Phone, Clock, Navigation, Menu as MenuIcon, ShoppingBasket } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: Waves, title: "بسته‌بندی تضمینی", sub: "بدون بو، با کیفیت" },
  { icon: MapPin, title: "پخت درجه یک", sub: "طعم لذیذ و ناب" },
  { icon: Clock, title: "آماده‌سازی سریع", sub: "در کمترین زمان" },
  { icon: Navigation, title: "تحویل در محل", sub: "هر نقطه شهر" },
];

export default function HomeView() {
  const { data } = useApp();
  const { go } = useMahiStore();
  const cartCount = useMahiStore((s) => s.cart.length);
  const settings = data?.settings;

  const fishes = useMemo(
    () => (data?.categories ?? []).flatMap((c) => c.fishes),
    [data]
  );

  const promoImage = settings?.promoImage || "/assets/promo-boat.png";
  const promoLink = settings?.promoLink?.trim() || "";
  const avatar = settings?.logoImage;

  return (
    <div className="pb-2">
      {/* ═══════════ کاور تمام‌عرض (تا نیمه صفحه) ═══════════ */}
      <section
        aria-label="کاور اصلی"
        className="relative -mx-4 -mt-1 h-[46vh] min-h-[350px] max-h-[540px] overflow-hidden"
      >
        {/* عکس پس‌زمینه صورتی (داینامیک از پنل ادمین) */}
        <Image
          src={settings?.heroImage || "/assets/hero-bg.png"}
          alt=""
          fill
          priority
          unoptimized
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 448px"
        />

        {/* نوار بالای شناور روی کاور */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-4">
          <CircleBtn label="سبد خرید" badge={cartCount} onClick={() => go("cart")}>
            <ShoppingBasket className="h-6 w-6" strokeWidth={2.4} />
          </CircleBtn>
          <div className="flex-1 flex justify-center px-2">
            {avatar ? (
              <span className="relative block h-14 w-28">
                <Image src={avatar} alt={settings?.appName || "ماهی تنور"} fill unoptimized className="object-contain" sizes="112px" />
              </span>
            ) : (
              <span className="text-center leading-6 drop-shadow-[0_2px_6px_rgba(88,24,69,.55)]">
                <span className="block text-white text-[24px] font-black">{settings?.appName || "ماهی تنور"}</span>
                <span className="block text-white/90 text-[10.5px] font-bold">{settings?.appSlogan}</span>
              </span>
            )}
          </div>
          <CircleBtn label="منو" onClick={() => window.dispatchEvent(new Event("mahi:open-drawer"))}>
            <MenuIcon className="h-6 w-6" strokeWidth={2.6} />
          </CircleBtn>
        </div>

        {/* متن میانی کاور */}
        <div className="absolute inset-x-0 bottom-12 z-10 flex flex-col items-center px-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-brand/90 text-white text-[11px] font-extrabold px-3.5 py-1.5 shadow-md">
            <PiFish className="h-4 w-4" aria-hidden />
            {settings?.heroBadgeText || "ماهی و غذای دریایی"}
          </span>
          <div className="mt-3 drop-shadow-[0_3px_8px_rgba(88,24,69,.6)]">
            <span className="text-white text-[34px] font-black leading-tight">{settings?.heroTitle}</span>{" "}
            <span className="text-white text-[26px] font-extrabold leading-tight">{settings?.heroSubtitle}</span>
            <Waves className="h-3.5 w-36 mx-auto mt-1 text-white/95" aria-hidden />
          </div>
        </div>

        {/* دکمه ثبت سفارش (لبه کاور، آیکون ظریف + حاشیه سفید کم) */}
        <button
          type="button"
          onClick={() => go("menu")}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 rounded-full bg-brand px-7 h-[52px] text-white text-[16.5px] font-black border-2 border-white/95 shadow-[0_10px_26px_rgba(168,20,87,.5)] active:scale-95 transition-transform"
        >
          {settings?.heroCtaText || "ثبت سفارش"}
          <PiFishSimple className="h-[21px] w-[21px] opacity-95" aria-hidden />
        </button>
      </section>

      {/* ═══════════ چهار ویژگی (گردی بالا، محوی پایین، سفید مایل به صورتی) ═══════════ */}
      <section
        aria-label="ویژگی‌های ما"
        className="relative mt-10 rounded-t-[28px] bg-[#fff3f7] pt-5 px-2.5 pb-12"
        style={{
          maskImage: "linear-gradient(to bottom, black calc(100% - 34px), transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 34px), transparent 100%)",
        }}
      >
        <div className="grid grid-cols-4 gap-1 text-center">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="px-0.5">
                <span className="mx-auto mb-2 h-11 w-11 grid place-items-center rounded-full bg-teal-mist/60 text-teal-deep">
                  <Icon className="h-[22px] w-[22px]" strokeWidth={2.2} aria-hidden />
                </span>
                <p className="text-[11px] font-extrabold text-ink leading-4">{f.title}</p>
                <p className="text-[9.5px] text-grey leading-[13px] mt-0.5">{f.sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ انواع ماهی ها (تب برآمده + ۴ کارت در ردیف) ═══════════ */}
      <section
        aria-label="انواع ماهی‌ها"
        className="relative -mt-7 z-10 mx-2 rounded-[26px] bg-[#ffe7f0] shadow-[0_10px_26px_rgba(236,64,122,.10)] pt-9 pb-4 px-2.5"
      >
        {/* عنوان داخل باکس رنگی برآمده از بالای سکشن */}
        <div className="absolute -top-[17px] inset-x-0 flex justify-center" aria-hidden={false}>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#f6b6cf] px-6 py-[7px] shadow-[0_6px_16px_rgba(236,64,122,.22)]">
            <PiFish className="h-5 w-5 text-brand-deep -scale-x-100" aria-hidden />
            <h2 className="text-[16px] font-black text-brand-dark leading-6">انواع ماهی ها</h2>
            <PiFish className="h-5 w-5 text-brand-deep" aria-hidden />
          </span>
        </div>

        {/* کارت‌های کوچک ماهی — ۴ عدد در ردیف */}
        <div className="grid grid-cols-4 gap-2" role="list">
          {fishes.map((f, i) => (
            <motion.button
              key={f.id}
              type="button"
              role="listitem"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              onClick={() => go("fish", { fishId: f.id })}
              aria-label={`سفارش ${f.name}`}
              className="bg-white rounded-[14px] p-1.5 text-center shadow-[0_3px_10px_rgba(236,64,122,.08)] active:scale-95 transition-transform"
            >
              {/* عکس ۱۶:۹ کوچک */}
              <span className="relative block w-full aspect-video rounded-[10px] overflow-hidden bg-brand-faint">
                <Image src={f.image} alt={f.name} fill unoptimized className="object-cover" sizes="96px" />
              </span>
              {/* نام ماهی (حداکثر دو خط) */}
              <span className="block mt-1.5 h-8 overflow-hidden text-[10px] font-extrabold text-ink leading-4">{f.name}</span>
              {/* دکمه تمام عرض */}
              <span className="mt-1 flex h-7 w-full items-center justify-center rounded-[9px] bg-brand text-white text-[10px] font-bold">
                سفارش
              </span>
            </motion.button>
          ))}
        </div>

        {/* محوی بسیار ملایم پایین سکشن + سایه کم */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 inset-x-0 h-9 rounded-b-[26px] bg-gradient-to-b from-transparent to-white/45"
        />
      </section>

      {/* ═══════════ بنر تبلیغاتی — فقط یک عکس از بک‌اند ═══════════ */}
      {promoImage ? (
        promoLink ? (
          <a
            href={promoLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="بنر تبلیغاتی"
            className="relative mt-5 block aspect-[16/8] rounded-[22px] overflow-hidden shadow-[0_8px_22px_rgba(236,64,122,.16)]"
          >
            <Image src={promoImage} alt="بنر تبلیغاتی" fill unoptimized className="object-cover" sizes="448px" />
          </a>
        ) : (
          <div className="relative mt-5 block aspect-[16/8] rounded-[22px] overflow-hidden shadow-[0_8px_22px_rgba(236,64,122,.16)]">
            <Image src={promoImage} alt="بنر تبلیغاتی" fill unoptimized className="object-cover" sizes="448px" />
          </div>
        )
      ) : null}

      {/* ═══════════ سه کارت مجزا: آدرس / ساعت کاری / تماس ═══════════ */}
      <section aria-label="راه‌های ارتباطی" className="mt-5 grid grid-cols-3 gap-2.5">
        {/* آدرس */}
        <div className="my-card-sm p-3 flex flex-col">
          <div className="flex justify-end">
            <span className="h-10 w-10 rounded-full bg-brand-mist grid place-items-center text-brand">
              <MapPin className="h-5 w-5" fill="currentColor" strokeWidth={1.6} aria-hidden />
            </span>
          </div>
          <p className="mt-2 text-[11.5px] font-extrabold text-ink text-right leading-4">آدرس مرکز فروش</p>
          <p className="mt-1 text-[9.5px] leading-[14px] text-grey text-right flex-1">{settings?.addressText}</p>
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(settings?.addressText || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex h-7 items-center justify-center gap-1 rounded-full bg-brand text-white text-[10px] font-bold active:scale-95 transition-transform"
          >
            <Navigation className="h-3 w-3" aria-hidden />
            مسیریابی
          </a>
        </div>

        {/* ساعت کاری */}
        <div className="my-card-sm p-3 flex flex-col">
          <div className="flex justify-end">
            <span className="h-10 w-10 rounded-full bg-brand-mist grid place-items-center text-brand">
              <Clock className="h-5 w-5" fill="currentColor" strokeWidth={1.6} aria-hidden />
            </span>
          </div>
          <p className="mt-2 text-[11.5px] font-extrabold text-ink text-right leading-4">ساعت کاری</p>
          <p className="mt-1 text-[10.5px] leading-5 text-grey text-right font-bold tabular-nums flex-1">
            {settings?.workHours}
          </p>
          <p className="text-[9.5px] text-grey text-right leading-4">همه‌روزه در خدمت شما</p>
        </div>

        {/* تماس */}
        <div className="my-card-sm p-3 flex flex-col">
          <div className="flex justify-end">
            <span className="h-10 w-10 rounded-full bg-brand-mist grid place-items-center text-brand">
              <Phone className="h-5 w-5" fill="currentColor" strokeWidth={1.6} aria-hidden />
            </span>
          </div>
          <p className="mt-2 text-[11.5px] font-extrabold text-ink text-right leading-4">تماس با ما</p>
          <p dir="ltr" className="mt-1 text-right text-[11px] font-extrabold text-ink-2 tabular-nums flex-1">
            {settings?.phone}
          </p>
          <a
            dir="ltr"
            href={`tel:${(settings?.phone || "").replace(/\s/g, "")}`}
            className="mt-2 inline-flex h-7 items-center justify-center gap-1 rounded-full bg-brand text-white text-[10px] font-bold active:scale-95 transition-transform"
          >
            <Phone className="h-3 w-3" fill="currentColor" aria-hidden />
            تماس
          </a>
        </div>
      </section>

      {/* ═══════════ پاورقی ═══════════ */}
      <footer className="text-center pb-1 pt-4">
        <p className="text-[12px] font-bold text-ink-2/85">
          {settings?.footerNote || "عشق ماهی، عشق تازگی"} <span aria-hidden>❤️</span>
        </p>
        <p className="text-[10px] text-grey mt-1">
          {settings?.appName || "ماهی تنور"} · {toFaDigits(1404)}
        </p>
      </footer>
    </div>
  );
}
