"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { StatusBadge, PillBtn } from "../ui";
import { faPrice, toFaDigits, toEnDigits, faDateTime } from "@/lib/format";
import type { TOrder } from "@/lib/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon, Crown, Camera, Pencil, Wallet, MapPin,
  Heart, ClipboardList, Clock, ChevronLeft as ChevL, ChevronLeft,
  ShieldCheck, LogIn, LogOut, LayoutGrid,
} from "lucide-react";

export default function ProfileView() {
  const { data } = useApp();
  const go = useMahiStore((s) => s.go);
  const authUser = useMahiStore((s) => s.authUser);
  const setAuth = useMahiStore((s) => s.setAuth);
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const addresses = data?.addresses ?? [];
  const favorites = data?.favorites ?? [];

  const isAdmin = authUser?.role === "admin";

  /* سفارش‌های کاربر = سفارش‌هایی که با شماره او ثبت شده‌اند (مقایسه با نرمال‌سازی ارقام فارسی/انگلیسی) */
  const myOrders = useMemo(() => {
    const all = data?.orders ?? [];
    if (!authUser) return []; // مهمان — هنوز سفارشی به نامش ثبت نشده
    if (isAdmin) return all; // مدیر همه را می‌بیند
    return all.filter((o) => toEnDigits(o.receiverPhone) === toEnDigits(authUser.phone));
  }, [data?.orders, authUser, isAdmin]);

  const orders = useMemo(() => myOrders.slice(0, 3), [myOrders]);

  /* ویرایش نام/شماره → PATCH /api/auth/user → setAuth */
  const openEdit = () => {
    setName(authUser?.name ?? "");
    setPhone(authUser?.phone ?? "");
    setEditOpen(true);
  };

  const save = async () => {
    if (!authUser) return;
    const cleanName = name.trim();
    const cleanPhone = toEnDigits(phone).replace(/[\s\-()]/g, "");
    if (cleanName.length < 2) return toast({ title: "نام را کامل وارد کنید" });
    if (!/^09\d{9}$/.test(cleanPhone)) return toast({ title: "شماره موبایل معتبر نیست", description: "مثلاً ۰۹۱۲۳۴۵۶۷۸۹" });
    setSaving(true);
    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authUser.id, name: cleanName, phone: cleanPhone }),
      });
      const json = (await res.json()) as {
        user?: { id: string; name: string; phone: string; avatar?: string | null; role: string };
        error?: string;
      };
      if (!res.ok || !json.user) throw new Error(json.error || "ذخیره انجام نشد");
      setAuth(json.user);
      setEditOpen(false);
      toast({ title: "پروفایل به‌روزرسانی شد ✅" });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "ذخیره انجام نشد" });
    } finally {
      setSaving(false);
    }
  };

  /* خروج از حساب */
  const logout = () => {
    setAuth(null);
    setLogoutOpen(false);
    toast({ title: "خروج انجام شد — فعلاً مهمانی! 👋" });
  };

  const stats = [
    { icon: Wallet, label: "اعتبار خرید", value: faPrice(0), tone: "pink", onClick: () => toast({ title: "کیف پول", description: "اعتبار فعلی شما: ۰ تومان — به‌زودی شارژ می‌شه! 💳" }) },
    { icon: MapPin, label: "آدرس‌ها", value: toFaDigits(addresses.length), tone: "pink", onClick: () => go("addresses") },
    { icon: Heart, label: "علاقه‌مندی‌ها", value: toFaDigits(favorites.length), tone: "pink", onClick: () => go("favorites") },
    { icon: ClipboardList, label: "سفارشات من", value: toFaDigits(myOrders.length), tone: "pink", onClick: () => go("orders") },
  ];

  return (
    <div className="space-y-4 pt-1">
      {/* هدر صفحه پروفایل */}
      <div className="flex items-center justify-between px-1">
        <span className="h-11 w-11" aria-hidden />
        <div className="text-center">
          <h1 className="text-[22px] font-black text-ink leading-7">پروفایل کاربری</h1>
          <p className="text-[11px] font-bold text-teal-deep">عشق ماهی، عشق تازگی</p>
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

      {/* ═══ کارت پروفایل — مهمان / کاربر / مدیر ═══ */}
      {!authUser ? (
        /* ─── حالت مهمان ─── */
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-card p-4 relative overflow-hidden"
          aria-label="حساب مهمان"
        >
          <div className="flex items-center gap-3.5">
            <span className="relative shrink-0">
              <span className="block h-[74px] w-[74px] rounded-full overflow-hidden border-[3px] border-brand-soft shadow-[0_4px_14px_rgba(236,64,122,.25)]">
                <Image src="/assets/avatar-fish.png" alt="مهمان" width={74} height={74} className="h-full w-full object-cover" />
              </span>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[20px] font-black text-ink leading-7">سلام، مهمان 👋</p>
              <p className="text-[11.5px] font-bold text-grey leading-[17px] mt-1">
                برای ثبت سفارش و دیدن سفارش‌هات فقط اسم و شماره‌ات لازمه — بدون رمز و کد تأیید!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => go("login")}
            className="mt-4 w-full h-12 rounded-full bg-brand text-white text-[15px] font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(236,64,122,.4)] active:scale-[.98] transition-transform"
          >
            <LogIn className="h-5 w-5" aria-hidden />
            ورود / ثبت‌نام
          </button>
        </motion.section>
      ) : isAdmin ? (
        /* ─── حالت مدیر ─── */
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-card p-4 relative overflow-hidden"
          aria-label="حساب مدیر"
        >
          <div className="flex items-center gap-3.5">
            <span className="h-[74px] w-[74px] shrink-0 rounded-full border-[3px] border-teal-brand bg-teal-mist grid place-items-center shadow-[0_4px_14px_rgba(0,188,212,.3)]">
              <ShieldCheck className="h-9 w-9 text-teal-deep" aria-hidden />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[20px] font-black text-ink leading-7">{authUser.name}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-teal-brand px-3.5 py-1 text-[11px] font-black text-white shadow-[0_4px_12px_rgba(0,188,212,.35)]">
                👑 مدیر
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => go("admin")}
            className="mt-4 w-full h-12 rounded-full bg-teal-brand text-white text-[15px] font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,172,193,.4)] active:scale-[.98] transition-transform"
          >
            <LayoutGrid className="h-5 w-5" aria-hidden />
            رفتن به پنل مدیریت
          </button>
        </motion.section>
      ) : (
        /* ─── حالت کاربر واردشده ─── */
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-card p-4 relative overflow-hidden"
          aria-label="اطلاعات کاربر"
        >
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <span className="block h-[74px] w-[74px] rounded-full overflow-hidden border-[3px] border-teal-brand shadow-[0_4px_14px_rgba(0,188,212,.35)]">
                <Image src={authUser.avatar || "/assets/avatar-fish.png"} alt="آواتار" width={74} height={74} className="h-full w-full object-cover" />
              </span>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <button
                  type="button"
                  onClick={openEdit}
                  aria-label="ویرایش پروفایل"
                  className="absolute -bottom-1 -left-1 h-7 w-7 rounded-full bg-brand text-white grid place-items-center border-2 border-white shadow active:scale-90 transition-transform"
                >
                  <Camera className="h-3.5 w-3.5" aria-hidden />
                </button>
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
                        aria-label="نام"
                        className="mt-1 w-full h-11 rounded-2xl border-2 border-brand-soft bg-white px-4 text-[14px] font-bold text-ink outline-none focus:border-brand transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[12px] font-bold text-grey">شماره تماس</span>
                      <input
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        aria-label="شماره تماس"
                        className="mt-1 w-full h-11 rounded-2xl border-2 border-brand-soft bg-white px-4 text-[14px] font-bold text-ink text-left outline-none focus:border-brand transition-colors"
                      />
                    </label>
                    <PillBtn className="w-full h-12 mt-1" onClick={() => void save()}>
                      <Pencil className="h-4 w-4" aria-hidden />
                      {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
                    </PillBtn>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1.5 text-[20px] font-black text-ink leading-7">
                {authUser.name}
                <Crown className="h-4 w-4 text-amber-400" aria-hidden />
              </p>
              <p dir="ltr" className="text-right text-[13px] font-bold text-grey mt-0.5 tabular-nums">{toFaDigits(authUser.phone)}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-brand px-3.5 py-1 text-[11px] font-black text-white shadow-[0_4px_12px_rgba(236,64,122,.35)]">
                ⭐ مشتری ماهی تنور
              </span>
            </div>
          </div>
        </motion.section>
      )}

      {/* آمار سریع */}
      <section aria-label="آمار حساب" className="grid grid-cols-4 gap-2.5 bg-white p-2 rounded-lg">
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
              {authUser
                ? "هنوز سفارشی با این شماره ثبت نشده! از منو شروع کن 🐟"
                : "هنوز سفارشی ثبت نکردی! از منو شروع کن 🐟"}
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

      {/* ═══ خروج از حساب ═══ */}
      {authUser && (
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          className="w-full h-12 rounded-full bg-rose-50 border-2 border-rose-100 text-rose-500 text-[14px] font-black flex items-center justify-center gap-2 active:scale-[.98] transition-transform"
        >
          <LogOut className="h-5 w-5" aria-hidden />
          خروج از حساب
        </button>
      )}

      {/* تأیید خروج */}
      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="max-w-xs rounded-[26px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink">از حساب خارج می‌شی؟</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] leading-5">
              سبد خرید و اطلاعات‌ات حفظ می‌شه؛ هر وقت خواستی دوباره با اسم و شماره‌ات وارد شو.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="rounded-full flex-1">نه، برگرد</AlertDialogCancel>
            <AlertDialogAction
              onClick={logout}
              className="rounded-full flex-1 bg-rose-400 hover:bg-rose-500"
            >
              بله، خارج شو
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
