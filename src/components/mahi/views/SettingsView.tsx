"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { CircleBtn, MahiLogo } from "../ui";
import { faPrice, toFaDigits } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  PiUser, PiMapPin, PiWallet, PiBell, PiPalette, PiCaretLeft, PiCrownFill, PiCamera,
  PiPencilSimple, PiCheckCircleFill, PiSparkle,
} from "react-icons/pi";
import { ChevronRight, Waves, Heart, X } from "lucide-react";

type SheetKind = null | "wallet" | "messages" | "appearance";

export default function SettingsView() {
  const { data, refresh } = useApp();
  const { go, back } = useMahiStore();
  const { toast } = useToast();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [notif, setNotif] = useState(() => {
    try {
      return localStorage.getItem("mahi-notif") !== "off";
    } catch {
      return true;
    }
  });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const profile = data?.profile;
  const settings = data?.settings;

  const toggleNotif = (v: boolean) => {
    setNotif(v);
    try {
      localStorage.setItem("mahi-notif", v ? "on" : "off");
    } catch {}
    toast({ title: v ? "اعلان‌ها روشن شد 🔔" : "اعلان‌ها خاموش شد", description: v ? "خبر شروع سفارش‌های ویژه می‌رسد!" : "هر وقت خواستی از همین‌جا روشنش کن" });
  };

  /* آپلود آواتار جدید (بج دوربین روی عکس پروفایل) */
  const changeAvatar = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "حجم تصویر زیاد است", description: "حداکثر حجم مجاز ۸ مگابایت است" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { url } = (await res.json()) as { url: string };
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      });
      await refresh();
      window.dispatchEvent(new Event("mahi:refresh"));
      toast({ title: "عکس پروفایل عوض شد ✨" });
    } catch {
      toast({ title: "آپلود انجام نشد", description: "دوباره تلاش کن" });
    } finally {
      setUploading(false);
    }
  };

  const rows: {
    icon: React.ReactNode;
    title: string;
    sub: string;
    onClick: () => void;
  }[] = [
    { icon: <PiUser className="h-[22px] w-[22px]" aria-hidden />, title: "اطلاعات حساب کاربری", sub: "مشاهده و ویرایش اطلاعات حساب", onClick: () => go("profile") },
    { icon: <PiMapPin className="h-[22px] w-[22px]" aria-hidden />, title: "آدرس‌های من", sub: "مدیریت آدرس‌های تحویل سفارشات", onClick: () => go("addresses") },
    { icon: <PiWallet className="h-[22px] w-[22px]" aria-hidden />, title: "اعتبار", sub: "تخفیف‌ها و کش‌بک شما", onClick: () => setSheet("wallet") },
    { icon: <PiBell className="h-[22px] w-[22px]" aria-hidden />, title: "پیام‌ها", sub: "سابقه پیام‌ها و اعلان‌ها", onClick: () => setSheet("messages") },
    { icon: <PiPalette className="h-[22px] w-[22px]" aria-hidden />, title: "زبان و ظاهر برنامه", sub: "انتخاب زبان و تم", onClick: () => setSheet("appearance") },
  ];

  return (
    <div>
      {/* ═══ سربرگ با پس‌زمینه ساحلی + کارت کاربر (مطابق موکاپ) ═══ */}
      <div className="relative -mx-4 -mt-1 overflow-hidden pb-6">
        {/* تصویر ساحلی پشت سربرگ (داینامیک از تنظیمات) */}
        <div className="absolute inset-0" aria-hidden>
          <Image
            src={settings?.heroImage || "/assets/hero-bg.png"}
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 448px"
          />
        </div>

        {/* ردیف سربرگ: بازگشت + عنوان + لوگو */}
        <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-3 pb-4">
          <CircleBtn label="بازگشت" onClick={back}>
            <ChevronRight className="h-6 w-6" strokeWidth={2.8} />
          </CircleBtn>
          <div className="flex-1 text-center">
            <h1 className="text-[23px] font-black text-white leading-8 inline-flex items-center gap-1.5 drop-shadow-[0_2px_6px_rgba(88,24,69,.55)]">
              <PiSparkle className="h-4 w-4 text-white/90" aria-hidden />
              تنظیمات
              <PiSparkle className="h-4 w-4 text-white/90" aria-hidden />
            </h1>
            <Waves className="h-2.5 w-20 mx-auto text-white/95 drop-shadow-[0_1px_3px_rgba(88,24,69,.5)]" strokeWidth={2.5} aria-hidden />
          </div>
          <div className="w-11 shrink-0 flex justify-start">
            <span className="grid place-items-center rounded-full bg-white/85 px-2 py-1 shadow-sm">
              <MahiLogo size="sm" />
            </span>
          </div>
        </div>

        {/* کارت کاربر روی تصویر — آواتار چپ + نام/شماره/ویرایش راست */}
        <div className="relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] bg-white/90 backdrop-blur-md p-4 shadow-[0_8px_28px_rgba(168,20,87,.22)] border border-white/60"
          >
        <div className="flex flex-row-reverse items-center gap-4">
          {/* آواتار با تاج و بج دوربین */}
          <div className="relative shrink-0">
            <PiCrownFill className="absolute -top-2.5 right-3 h-5 w-5 text-[#f4a740] drop-shadow-[0_1px_2px_rgba(0,0,0,.2)] z-10" aria-hidden />
            <span className="block h-[78px] w-[78px] rounded-full overflow-hidden border-[3px] border-white ring-2 ring-brand-mist shadow-[0_4px_12px_rgba(236,64,122,.2)] bg-brand-faint">
              {profile?.avatar ? (
                <Image src={profile.avatar} alt={profile?.name || "کاربر"} width={78} height={78} unoptimized className="h-full w-full object-cover" />
              ) : (
                <Image src="/assets/avatar-fish.png" alt={profile?.name || "کاربر"} width={78} height={78} className="h-full w-full object-cover" />
              )}
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="تغییر عکس پروفایل"
              disabled={uploading}
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-brand text-white grid place-items-center shadow-[0_3px_8px_rgba(236,64,122,.4)] active:scale-90 transition-transform z-10"
            >
              <PiCamera className={`h-[18px] w-[18px] ${uploading ? "animate-pulse" : ""}`} aria-hidden />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) changeAvatar(f);
                e.target.value = "";
              }}
            />
          </div>

          {/* نام، شماره، دکمه ویرایش */}
          <div className="flex-1 min-w-0 text-right">
            <p className="text-[17px] font-black text-ink inline-flex items-center gap-1.5">
              {profile?.name || "کاربر"}
              <PiCrownFill className="h-4 w-4 text-brand" aria-hidden />
            </p>
            <p dir="ltr" className="text-right text-[13px] font-bold text-grey tabular-nums mt-0.5">
              {toFaDigits(profile?.phone || "")}
            </p>
            <button
              type="button"
              onClick={() => go("profile")}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand text-white text-[12px] font-bold px-4 h-9 shadow-[0_4px_12px_rgba(236,64,122,.35)] active:scale-95 transition-transform"
            >
              <PiPencilSimple className="h-4 w-4" aria-hidden />
              ویرایش پروفایل
            </button>
          </div>
        </div>

        {/* شعار پایین کارت */}
        <p className="mt-3.5 text-center text-[12.5px] font-bold text-brand-dark/80 inline-flex items-center gap-1.5 w-full justify-center">
          {profile?.note || "عاشق ماهی، عشق نزدیکه"}
          <Heart className="h-3.5 w-3.5 fill-brand text-brand" aria-hidden />
        </p>
          </motion.div>
        </div>
      </div>

      {/* ═══ پنج ردیف تنظیمات (کارت‌های مجزا) ═══ */}
      <div className="mt-4 space-y-3" role="list">
        {rows.map((r, i) => (
          <motion.button
            key={r.title}
            type="button"
            role="listitem"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            onClick={r.onClick}
            aria-label={r.title}
            className="my-card-sm w-full p-3 flex items-center gap-3 text-right active:scale-[.99] transition-transform"
          >
            <span className="h-11 w-11 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">{r.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[14.5px] font-black text-[#880e4f]">{r.title}</span>
              <span className="block text-[11.5px] text-teal-deep leading-4 mt-0.5">{r.sub}</span>
            </span>
            <PiCaretLeft className="h-5 w-5 text-brand shrink-0" aria-hidden />
          </motion.button>
        ))}
      </div>

      {/* ═══ بنر تبلیغاتی (فقط عکس از بک‌اند) ═══ */}
      {settings?.promoImage ? (
        <div className="relative mt-4 aspect-[16/8] rounded-[22px] overflow-hidden shadow-[0_8px_22px_rgba(236,64,122,.16)]">
          <Image src={settings.promoImage} alt="بنر تبلیغاتی" fill unoptimized className="object-cover" sizes="430px" />
        </div>
      ) : null}
      <Waves className="h-4 w-full text-white/50 mt-5" aria-hidden />

      {/* ═══ شیت کیف پول ═══ */}
      {sheet === "wallet" && (
        <SheetOverlay onClose={() => setSheet(null)} title="کیف پول ماهی تنو" icon={<PiWallet className="h-8 w-8 text-brand" aria-hidden />}>
          <p className="mt-2 text-[13px] text-grey font-bold">
            موجودی فعلی: <span className="text-brand font-black">{faPrice(0)}</span>
          </p>
          <p className="mt-1.5 text-[11px] text-teal-deep leading-4">با اولین سفارش، اعتبار هدیه می‌گیری 🎁</p>
          <SheetCloseBtn onClick={() => setSheet(null)} />
        </SheetOverlay>
      )}

      {/* ═══ شیت پیام‌ها و اعلان‌ها ═══ */}
      {sheet === "messages" && (
        <SheetOverlay onClose={() => setSheet(null)} title="پیام‌ها و اعلان‌ها" icon={<PiBell className="h-8 w-8 text-brand" aria-hidden />}>
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-brand-faint px-3.5 py-3">
            <span className="text-[13px] font-bold text-ink">اعلان‌های ویژه</span>
            <Switch checked={notif} onCheckedChange={toggleNotif} aria-label="اعلان‌ها" />
          </div>
          <div className="mt-3 space-y-2.5 text-right">
            {[
              { t: "سفارش شما در حال آماده‌سازی است 🐟", d: "به‌زودی در بازه انتخابی تحویل داده می‌شود" },
              { t: "ماهی تازه امروز رسید ✨", d: "قزل‌آلای تازه امروزی رو از دست نده" },
            ].map((m) => (
              <div key={m.t} className="rounded-2xl border border-brand-mist p-3">
                <p className="text-[12.5px] font-bold text-ink flex items-center gap-1.5">
                  <PiCheckCircleFill className="h-4 w-4 text-teal-brand shrink-0" aria-hidden />
                  {m.t}
                </p>
                <p className="text-[11px] text-grey mt-1">{m.d}</p>
              </div>
            ))}
          </div>
          <SheetCloseBtn onClick={() => setSheet(null)} />
        </SheetOverlay>
      )}

      {/* ═══ شیت زبان و ظاهر ═══ */}
      {sheet === "appearance" && (
        <SheetOverlay onClose={() => setSheet(null)} title="زبان و ظاهر برنامه" icon={<PiPalette className="h-8 w-8 text-brand" aria-hidden />}>
          <div className="mt-3 text-right">
            <p className="text-[12px] font-bold text-grey mb-2">زبان برنامه</p>
            <div className="flex gap-2">
              <span className="flex-1 h-10 rounded-full bg-brand text-white text-[13px] font-bold grid place-items-center">فارسی</span>
              <span className="flex-1 h-10 rounded-full bg-brand-faint text-grey text-[13px] font-bold grid place-items-center">English</span>
            </div>
            <p className="text-[12px] font-bold text-grey mt-4 mb-2">تم رنگی</p>
            <div className="flex gap-2">
              <span className="flex-1 h-10 rounded-full bg-brand text-white text-[13px] font-bold grid place-items-center">روشن 🌤</span>
              <button
                type="button"
                onClick={() => toast({ title: "تم تاریک به‌زودی 🌙" })}
                className="flex-1 h-10 rounded-full bg-brand-faint text-grey text-[13px] font-bold grid place-items-center active:scale-95 transition-transform"
              >
                تاریک 🌙
              </button>
            </div>
          </div>
          <SheetCloseBtn onClick={() => setSheet(null)} />
        </SheetOverlay>
      )}
    </div>
  );
}

/* ───────── پوسته شیت پایین صفحه ───────── */
function SheetOverlay({ onClose, title, icon, children }: { onClose: () => void; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute bottom-0 inset-x-0 max-w-md mx-auto bg-white rounded-t-[26px] p-6 pb-8 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} aria-label="بستن" className="h-8 w-8 rounded-full bg-brand-faint grid place-items-center text-brand">
            <X className="h-4 w-4" aria-hidden />
          </button>
          <h3 className="text-[16px] font-black text-ink flex-1 text-center">{title}</h3>
          <span className="w-8" aria-hidden />
        </div>
        <span className="mx-auto mt-3 h-16 w-16 rounded-full bg-brand-mist grid place-items-center">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function SheetCloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-5 w-full h-12 rounded-full bg-brand text-white text-[14px] font-black active:scale-[.98] transition-transform"
    >
      باشه، متوجه شدم
    </button>
  );
}
