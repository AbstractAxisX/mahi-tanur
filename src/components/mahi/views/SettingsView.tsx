"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader } from "../ui";
import { faPrice } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  User, MapPin, Wallet, Bell, Info, Phone, Instagram, ChevronLeft, Waves, Fish as FishIcon,
} from "lucide-react";

export default function SettingsView() {
  const { data } = useApp();
  const { go } = useMahiStore();
  const { toast } = useToast();
  const [notif, setNotif] = useState(() => {
    try {
      return localStorage.getItem("mahi-notif") !== "off";
    } catch {
      return true;
    }
  });
  const [walletOpen, setWalletOpen] = useState(false);

  const toggleNotif = (v: boolean) => {
    setNotif(v);
    try {
      localStorage.setItem("mahi-notif", v ? "on" : "off");
    } catch {}
    toast({ title: v ? "اعلان‌ها روشن شد 🔔" : "اعلان‌ها خاموش شد", description: v ? "خبر شروع سفارش‌های ویژه می‌رسد!" : "هر وقت خواستی از همین‌جا روشنش کن" });
  };

  const rows = [
    { icon: <User />, title: "اطلاعات حساب کاربری", sub: "مشاهده و ویرایش اطلاعات فردی", onClick: () => go("profile") },
    { icon: <MapPin />, title: "آدرس‌های من", sub: "مدیریت آدرس‌های تحویل سفارشات", onClick: () => go("addresses") },
    { icon: <Wallet />, title: "کیف پول و اعتبارات", sub: "تخفیف‌ها و موجودی حساب شما", onClick: () => setWalletOpen(true) },
    { icon: <Bell />, title: "نوتیفیکیشن", sub: "اطلاع‌رسانی پیامک و اعلان‌های ما", onClick: () => {} , switch: true },
    { icon: <Phone />, title: "پشتیبانی و تماس", sub: " پاسخ‌گویی ۱۱ تا ۲۳", onClick: () => { window.location.href = `tel:${(data?.settings?.phone || "").replace(/\s/g, "")}`; } },
    { icon: <Instagram />, title: "اینستاگرام ما", sub: `@${data?.settings?.instagram || "mahi_yar"}`, onClick: () => toast({ title: "اینستاگرام", description: `@${data?.settings?.instagram} — پروفایل ما رو فالو کن! 📸` }) },
    { icon: <Info />, title: "درباره ماهی‌یار", sub: "نسخه ۱٫۰ · ساخته‌شده با ❤️", onClick: () => toast({ title: "ماهی‌یار نسخه ۱٫۰", description: "سفارش آنلاین ماهی تازه — بدون درگاه پرداخت، پرداخت در محل" }) },
  ];

  return (
    <div>
      <ScreenHeader title="تنظیمات" action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><FishIcon className="h-6 w-6 text-brand" aria-hidden /></span>} />

      {/* کارت کوچک کاربر */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="my-card p-3.5 flex items-center gap-3.5">
        <span className="h-14 w-14 rounded-full overflow-hidden border-[3px] border-teal-brand shrink-0">
          <Image src="/assets/avatar-fish.png" alt="آواتار" width={56} height={56} className="h-full w-full object-cover" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-black text-ink">{data?.profile?.name} 👑</p>
          <p dir="ltr" className="text-right text-[12px] font-bold text-grey tabular-nums">{data?.profile?.phone}</p>
        </div>
        <button
          type="button"
          onClick={() => go("profile")}
          aria-label="مشاهده پروفایل"
          className="h-10 w-10 rounded-full bg-brand text-white grid place-items-center active:scale-90 transition-transform shrink-0"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </button>
      </motion.div>

      {/* ردیف‌های تنظیمات */}
      <div className="mt-4 space-y-2.5" role="list">
        {rows.map((r, i) => {
          const Row = r.switch ? motion.div : motion.button;
          return (
            <Row
              key={r.title}
              role="listitem"
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
              {...(r.switch ? {} : { type: "button" as const, onClick: r.onClick, "aria-label": r.title })}
              className="my-card-sm p-3 w-full flex items-center gap-3 text-right active:scale-[.99] transition-transform"
            >
              <span className="h-11 w-11 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">{r.icon}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14.5px] font-black text-ink">{r.title}</span>
                <span className="block text-[11px] text-grey leading-4 mt-0.5">{r.sub}</span>
              </span>
              {r.switch ? (
                <Switch checked={notif} onCheckedChange={toggleNotif} aria-label="اعلان‌ها" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-brand-mid shrink-0" aria-hidden />
              )}
            </Row>
          );
        })}
      </div>

      {/* بنر پایین */}
      <div className="relative mt-4 h-28 rounded-[22px] overflow-hidden shadow-[0_8px_22px_rgba(0,172,193,.28)] bg-gradient-to-l from-teal-brand to-brand">
        <div className="absolute inset-0 opacity-90">
          <Image src="/assets/promo-fish.png" alt="" fill className="object-cover" sizes="430px" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-[17px] font-black drop-shadow-[0_2px_4px_rgba(88,24,69,.5)]">
            ما اینجوری‌م… <span aria-hidden>❤️</span> همیشه کنارت
          </p>
        </div>
      </div>
      <Waves className="h-4 w-full text-white/50 mt-5" aria-hidden />

      {/* شیت کیف پول */}
      {walletOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={() => setWalletOpen(false)}>
          <div className="absolute bottom-0 inset-x-0 max-w-md mx-auto bg-white rounded-t-[26px] p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <span className="mx-auto h-16 w-16 rounded-full bg-brand-mist grid place-items-center">
              <Wallet className="h-8 w-8 text-brand" aria-hidden />
            </span>
            <h3 className="mt-3 text-[17px] font-black text-ink">کیف پول ماهی‌یار</h3>
            <p className="mt-2 text-[13px] text-grey font-bold">
              موجودی فعلی: <span className="text-brand font-black">{faPrice(0)}</span>
            </p>
            <p className="mt-1.5 text-[11px] text-teal-deep leading-4">با اولین سفارش، اعتبار هدیه می‌گیری 🎁</p>
            <button
              type="button"
              onClick={() => setWalletOpen(false)}
              className="mt-4 w-full h-12 rounded-full bg-brand text-white text-[14px] font-black active:scale-[.98] transition-transform"
            >
              باشه، متوجه شدم
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
