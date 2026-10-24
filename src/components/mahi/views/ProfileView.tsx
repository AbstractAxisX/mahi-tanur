"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { StatusBadge, PillBtn } from "../ui";
import { faPrice, toFaDigits, faDateTime } from "@/lib/format";
import type { TOrder } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Crown, Camera, Pencil, Wallet, MapPin,
  Heart, ClipboardList, Clock, ChevronLeft as ChevL, ChevronLeft,
} from "lucide-react";

export default function ProfileView() {
  const { data, refresh } = useApp();
  const { go } = useMahiStore();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(data?.profile?.name ?? "");
  const [phone, setPhone] = useState(data?.profile?.phone ?? "");

  const profile = data?.profile;
  const addresses = data?.addresses ?? [];
  const favorites = data?.favorites ?? [];
  const orders = useMemo(() => (data?.orders ?? []).slice(0, 3), [data?.orders]);

  const save = async () => {
    if (!name.trim()) return toast({ title: "نام را وارد کنید" });
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
    });
    await refresh();
    setEditOpen(false);
    toast({ title: "پروفایل به‌روزرسانی شد ✅" });
  };

  const stats = [
    { icon: Wallet, label: "اعتبار خرید", value: faPrice(0), tone: "pink", onClick: () => toast({ title: "کیف پول", description: "اعتبار فعلی شما: ۰ تومان — به‌زودی شارژ می‌شه! 💳" }) },
    { icon: MapPin, label: "آدرس‌ها", value: toFaDigits(addresses.length), tone: "pink", onClick: () => go("addresses") },
    { icon: Heart, label: "علاقه‌مندی‌ها", value: toFaDigits(favorites.length), tone: "pink", onClick: () => go("favorites") },
    { icon: ClipboardList, label: "سفارشات من", value: toFaDigits(data?.orders?.length ?? 0), tone: "pink", onClick: () => go("orders") },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* هدر صفحه پروفایل */}
      <div className="flex items-center justify-between px-1">
        <span className="h-11 w-11" aria-hidden />
        <div className="text-center">
          <h1 className="text-[22px] font-black text-ink leading-7">پروفایل کاربری</h1>
          <p className="text-[11px] font-bold text-teal-deep">{profile?.note || "عشق ماهی، عشق تازگی"}</p>
        </div>
        <button
          type="button"
          onClick={() => go("settings")}
          aria-label="تنظیمات"
          className="h-11 w-11 rounded-full bg-brand text-white grid place-items-center shadow-[0_4px_12px_rgba(236,64,122,.35)] active:scale-95 transition-transform"
        >
          <SettingsIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* کارت پروفایل */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-card p-4 relative overflow-hidden"
        aria-label="اطلاعات کاربر"
      >
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <span className="block h-[74px] w-[74px] rounded-full overflow-hidden border-[3px] border-teal-brand shadow-[0_4px_14px_rgba(0,188,212,.35)]">
              <Image src={profile?.avatar || "/assets/avatar-fish.png"} alt="آواتار" width={74} height={74} className="h-full w-full object-cover" />
            </span>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  aria-label="ویرایش پروفایل"
                  className="absolute -bottom-1 -left-1 h-7 w-7 rounded-full bg-brand text-white grid place-items-center border-2 border-white shadow active:scale-90 transition-transform"
                >
                  <Camera className="h-3.5 w-3.5" aria-hidden />
                </button>
              </DialogTrigger>
              <DialogContent className="rounded-[26px] max-w-[92vw]">
                <DialogHeader className="sr-only">
                  <DialogTitle>ویرایش پروفایل</DialogTitle>
                  <DialogDescription>تغییر نام و شماره تماس کاربر</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <label className="block">
                    <span className="text-[12px] font-bold text-grey">نام</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full h-11 rounded-2xl border-2 border-brand-soft bg-white px-4 text-[14px] font-bold text-ink outline-none focus:border-brand transition-colors"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[12px] font-bold text-grey">شماره تماس</span>
                    <input
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full h-11 rounded-2xl border-2 border-brand-soft bg-white px-4 text-[14px] font-bold text-ink text-left outline-none focus:border-brand transition-colors"
                    />
                  </label>
                  <PillBtn className="w-full h-12 mt-1" onClick={save}>
                    <Pencil className="h-4 w-4" aria-hidden />
                    ذخیره تغییرات
                  </PillBtn>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-1.5 text-[20px] font-black text-ink leading-7">
              {profile?.name || "کاربر"}
              <Crown className="h-4 w-4 text-amber-400" aria-hidden />
            </p>
            <p dir="ltr" className="text-right text-[13px] font-bold text-grey mt-0.5 tabular-nums">{toFaDigits(profile?.phone || "")}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-brand px-3.5 py-1 text-[11px] font-black text-white shadow-[0_4px_12px_rgba(236,64,122,.35)]">
              ⭐ {profile?.role || "کاربر عالی"}
            </span>
          </div>
        </div>
        <p className="text-center text-[12px] font-black text-brand mt-3.5 border-t border-dashed border-brand-soft pt-3">
          عشق ماهی، عشق تازگی <span aria-hidden>❤️</span>
        </p>
      </motion.section>

      {/* آمار سریع */}
      <section aria-label="آمار حساب" className="grid grid-cols-4 gap-2.5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.label}
              type="button"
              onClick={s.onClick}
              whileTap={{ scale: 0.93 }}
              className="my-card-sm p-2.5 text-center space-y-1"
              aria-label={`${s.label}: ${s.value}`}
            >
              <span className="mx-auto h-9 w-9 rounded-full bg-brand-mist grid place-items-center text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="block text-[10.5px] font-extrabold text-ink leading-4">{s.label}</span>
              <span className="block text-[11px] font-black text-brand-deep tabular-nums leading-4">{s.value}</span>
            </motion.button>
          );
        })}
      </section>

      {/* سفارشات اخیر */}
      <section aria-label="سفارشات اخیر">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[16px] font-black text-brand-dark">سفارشات من از اینجا 📋</h2>
          <button type="button" onClick={() => go("orders")} className="text-[12px] font-bold text-grey flex items-center gap-0.5">
            مشاهده همه
            <ChevL className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-3 space-y-2.5">
          {orders.length === 0 && (
            <div className="my-card p-6 text-center text-grey text-[13px] font-bold">
              هنوز سفارشی ثبت نکردی! از منو شروع کن 🐟
            </div>
          )}
          {orders.map((o: TOrder, i) => (
            <motion.button
              key={o.id}
              type="button"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => go("order-detail", { orderId: o.id })}
              className="my-card-sm p-3 w-full flex items-center gap-3 text-right active:scale-[.99] transition-transform"
              aria-label={`جزئیات سفارش ${o.fishName}`}
            >
              <span className="w-16 h-16 rounded-[14px] overflow-hidden shrink-0 shadow-[0_4px_10px_rgba(88,24,69,.18)]">
                <Image src={o.fishImage} alt={o.fishName} width={64} height={64} unoptimized className="h-full w-full object-cover" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={o.status} />
                  <span className="text-[14px] font-black text-ink">{o.fishName}</span>
                </span>
                <span className="block text-[10.5px] text-grey leading-4 mt-1">
                  زمان: {o.timeSlotLabel} ({o.timeSlotShift}) | تعداد: {toFaDigits(o.quantity)}
                </span>
                <span className="block text-[11px] font-black text-grey mt-0.5 tabular-nums">مبلغ: {faPrice(o.total)}</span>
                <span className="flex items-center gap-1 text-[10px] text-grey mt-0.5 tabular-nums">
                  <Clock className="h-3 w-3" aria-hidden />
                  {faDateTime(o.createdAt)}
                </span>
              </span>
              <ChevronLeft className="h-5 w-5 text-brand-mid shrink-0" aria-hidden />
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
