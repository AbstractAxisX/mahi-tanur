"use client";

import Image from "next/image";
import { useState } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { toEnDigits } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { PiUser } from "react-icons/pi";
import {
  Waves, Phone, ArrowLeft, Flame, ShieldCheck, MapPin, User as UserIcon,
  Lock, ChevronDown, Fish as FishIcon,
} from "lucide-react";

/* ═══════════════════════ سیلوئت بندر (پل، نخل، خورشید، قایق) — تک‌رنگ سرخابی تیره ═══════════════════════ */
function PortSilhouette() {
  const c = "#8e1e56";
  return (
    <svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMax meet" className="block w-full h-auto" aria-hidden="true">
      {/* پرنده‌های کوچک در آسمان */}
      <g fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.75">
        <path d="M92 26 q5 -6 10 0 q5 -6 10 0" />
        <path d="M132 38 q4 -5 8 0 q4 -5 8 0" />
        <path d="M300 22 q5 -6 10 0 q5 -6 10 0" />
        <path d="M336 36 q4 -5 8 0 q4 -5 8 0" />
      </g>

      {/* خورشید روی افق */}
      <circle cx="200" cy="98" r="24" fill={c} opacity="0.4" />

      {/* پل قوسی (مثل پل بندر انزلی) */}
      <g fill="none" stroke={c} strokeLinecap="round">
        <path d="M28 84 H372" strokeWidth="5" />
        <path d="M68 84 Q200 14 332 84" strokeWidth="4" />
        <path d="M108 64 V84 M148 47 V84 M200 41 V84 M252 47 V84 M292 64 V84" strokeWidth="2.5" />
        <path d="M68 84 V112 M332 84 V112" strokeWidth="5" />
      </g>

      {/* نخل‌های سمت چپ */}
      <g fill="none" stroke={c} strokeLinecap="round">
        <path d="M32 118 C 38 104 34 88 40 74" strokeWidth="4.5" />
        <path d="M40 74 Q 26 66 16 70 M40 74 Q 28 60 20 58 M40 74 Q 40 58 36 50 M40 74 Q 50 58 56 52 M40 74 Q 54 62 64 64 M40 74 Q 52 72 60 78" strokeWidth="3" />
        <path d="M74 118 C 78 108 76 98 80 90" strokeWidth="3.5" opacity="0.85" />
        <path d="M80 90 Q 70 84 62 86 M80 90 Q 70 78 64 76 M80 90 Q 80 78 77 72 M80 90 Q 89 78 94 74 M80 90 Q 91 82 98 84" strokeWidth="2.4" opacity="0.85" />
      </g>

      {/* ساختمان‌ها و برج سمت راست */}
      <g fill={c}>
        <rect x="282" y="76" width="12" height="36" rx="1.5" opacity="0.85" />
        <rect x="298" y="64" width="16" height="48" rx="1.5" />
        <rect x="318" y="52" width="20" height="60" rx="1.5" />
        <rect x="341" y="70" width="14" height="42" rx="1.5" opacity="0.85" />
        <rect x="362" y="32" width="16" height="80" rx="2" />
      </g>
      <path d="M370 32 V18" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="370" cy="17" r="2" fill={c} />

      {/* قایق‌ها روی آب */}
      <g fill={c}>
        <path d="M112 114 h20 l-5 6 h-10 z" />
        <path d="M122 114 v-13 l9 13 z" opacity="0.9" />
        <path d="M252 118 h16 l-4 5 h-8 z" opacity="0.9" />
        <path d="M260 118 v-10 l7 10 z" opacity="0.8" />
      </g>

      {/* انعکاس خورشید روی آب */}
      <g stroke={c} strokeLinecap="round" opacity="0.5">
        <path d="M188 122 h24" strokeWidth="3" />
        <path d="M192 130 h16" strokeWidth="2.5" />
        <path d="M195 137 h10" strokeWidth="2" />
      </g>

      {/* موج‌های آب */}
      <g fill="none" stroke={c} strokeLinecap="round">
        <path d="M0 112 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" strokeWidth="2" opacity="0.55" />
        <path d="M0 124 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" strokeWidth="2" opacity="0.4" />
        <path d="M0 136 q12 -5 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" strokeWidth="2" opacity="0.28" />
      </g>
    </svg>
  );
}

/* ═══════════════════════ صفحه ورود / ثبت‌نام (مطابق موکاپ) ═══════════════════════ */
export default function LoginView() {
  const { data } = useApp();
  const setAuth = useMahiStore((s) => s.setAuth);
  const go = useMahiStore((s) => s.go);
  const back = useMahiStore((s) => s.back);
  const { toast } = useToast();

  const settings = data?.settings;
  const heroImage = data?.categories?.[0]?.fishes?.[0]?.image || "/assets/seed/trout.jpg";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const [adminOpen, setAdminOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminBusy, setAdminBusy] = useState(false);

  /* ─── ورود کاربر: فقط اسم + شماره موبایل ─── */
  const submitLogin = async () => {
    const cleanName = name.trim();
    const cleanPhone = toEnDigits(phone).replace(/[\s\-()]/g, "");
    if (cleanName.length < 2) {
      return toast({ title: "نام را کامل وارد کن ✍️", description: "اسم کوچیکه! حداقل ۲ حرف لازمه." });
    }
    if (!/^09\d{9}$/.test(cleanPhone)) {
      return toast({ title: "شماره موبایل معتبر نیست 📱", description: "مثلاً ۰۹۱۲ ۳۴۵ ۶۷۸۹ — با رقم ۰۹ شروع می‌شه." });
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanName, phone: cleanPhone }),
      });
      const json = (await res.json()) as {
        user?: { id: string; name: string; phone: string; avatar?: string | null; role: string };
        error?: string;
      };
      if (!res.ok || !json.user) throw new Error(json.error || "ورود انجام نشد — دوباره تلاش کن");
      setAuth(json.user);
      toast({ title: `خوش اومدی ${json.user.name}! 🐟`, description: "حسابت آماده‌ست — سفارش‌هات اینجا جمع می‌شن." });
      if (json.user.role === "admin") go("admin");
      else back();
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "ورود انجام نشد" });
    } finally {
      setBusy(false);
    }
  };

  /* ─── ورود مدیر ─── */
  const submitAdmin = async () => {
    if (!username.trim() || !password) {
      return toast({ title: "نام کاربری و رمز مدیر را وارد کن" });
    }
    setAdminBusy(true);
    try {
      const res = await fetch("/api/auth/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const json = (await res.json()) as {
        user?: { id: string; name: string; phone: string; avatar?: string | null; role: string };
        error?: string;
      };
      if (!res.ok || !json.user) throw new Error(json.error || "ورود مدیر انجام نشد");
      setAuth(json.user);
      toast({ title: "خوش اومدی، مدیر! 👑" });
      go("admin");
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : "ورود مدیر انجام نشد" });
    } finally {
      setAdminBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f9b0cf] via-[#ee4f92] to-[#b3134f]">
      {/* ═══ برند: لوگو + نام + موج + شعار ═══ */}
      <div className="relative z-10 pt-9 pb-1 px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: -14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="relative h-[92px] w-[92px] rounded-full bg-[#8e1e56] border-[4px] border-white shadow-[0_10px_28px_rgba(88,6,40,.4)] grid place-items-center"
        >
          <Flame className="absolute top-2.5 h-4 w-4 text-white/95" aria-hidden />
          <FishIcon className="h-11 w-11 text-white -scale-x-100 mt-3" strokeWidth={1.8} aria-hidden />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mt-4 text-[36px] leading-[46px] font-black text-white select-none"
          style={{ textShadow: "0 3px 0 #a01354, 0 7px 22px rgba(88,6,40,.5)" }}
        >
          {settings?.appName || "ماهی تنور"}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.4 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-1 w-44"
        >
          <Waves className="h-4 w-full text-teal-brand drop-shadow-[0_1px_2px_rgba(88,6,40,.35)]" strokeWidth={2.6} aria-hidden />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
          className="mt-2 text-white/90 text-[13px] font-bold"
        >
          {settings?.appSlogan || "سفارش آنلاین ماهی تازه"}
        </motion.p>
      </div>

      {/* ═══ عکس ماهی کبابی ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, type: "spring", stiffness: 150, damping: 18 }}
        className="relative z-10 px-9 mt-4"
      >
        <div className="relative aspect-[16/10] rounded-[26px] overflow-hidden border-[4px] border-white/95 shadow-[0_16px_38px_rgba(88,6,40,.4)] bg-[#8e1e56]">
          <Image src={heroImage} alt="ماهی کبابی تازه" fill unoptimized priority className="object-cover" sizes="448px" />
        </div>
        {/* برگ‌های تزئینی کنار قاب */}
        <span className="absolute -top-2 -right-3 text-xl rotate-[24deg] select-none" aria-hidden>🌿</span>
        <span className="absolute -bottom-2.5 -left-3 text-xl -rotate-[18deg] select-none" aria-hidden>🌿</span>
      </motion.div>

      {/* ═══ سیلوئت بندر + پل (پشت پنل سفید) ═══ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-0 -mb-6 mt-3 px-2"
        aria-hidden
      >
        <PortSilhouette />
      </motion.div>

      {/* ═══ پنل سفید پایین ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, type: "spring", stiffness: 130, damping: 20 }}
        className="relative z-10 bg-white rounded-t-[36px] shadow-[0_-14px_44px_rgba(88,6,40,.32)] px-6 pt-5 pb-7"
      >
        {/* عنوان */}
        <div className="text-center">
          <h2 className="text-[21px] font-black text-ink leading-7">ورود / ثبت‌نام</h2>
          <p className="text-[12px] font-bold text-teal-deep mt-1">فقط اسم و شماره کافیه — بدون رمز و کد!</p>
        </div>

        {/* فرم ورود کاربر */}
        <div className="mt-5 space-y-3">
          <label className="flex items-center gap-2.5 bg-white border-2 border-brand-soft rounded-2xl h-[52px] px-4 focus-within:border-brand transition-colors">
            <PiUser className="h-[22px] w-[22px] text-brand shrink-0" aria-hidden />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام و نام خانوادگی"
              aria-label="نام و نام خانوادگی"
              autoComplete="name"
              className="flex-1 bg-transparent outline-none text-[14px] font-bold text-ink placeholder:text-grey/80 placeholder:font-normal"
            />
          </label>

          <label className="flex items-center gap-2.5 bg-white border-2 border-brand-soft rounded-2xl h-[52px] px-4 focus-within:border-brand transition-colors">
            <Phone className="h-[20px] w-[20px] text-brand shrink-0" aria-hidden />
            <input
              dir="ltr"
              inputMode="tel"
              maxLength={20}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void submitLogin(); }}
              placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
              aria-label="شماره موبایل"
              autoComplete="tel"
              className="flex-1 min-w-0 w-0 bg-transparent outline-none text-[14px] font-bold text-ink text-left tabular-nums placeholder:text-grey/80 placeholder:font-normal"
            />
          </label>

          {/* دکمه ورود به منو */}
          <button
            type="button"
            onClick={() => void submitLogin()}
            disabled={busy}
            className="relative w-full h-[54px] rounded-full bg-teal-brand text-white text-[16.5px] font-black shadow-[0_10px_24px_rgba(0,172,193,.5)] active:scale-[.98] transition-transform disabled:opacity-60"
          >
            {busy ? "در حال ورود…" : "ورود به منو"}
            <span className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white grid place-items-center shadow-[0_4px_10px_rgba(0,96,110,.25)]" aria-hidden>
              {busy ? (
                <Flame className="h-5 w-5 text-teal-brand animate-pulse" aria-hidden />
              ) : (
                <ArrowLeft className="h-5 w-5 text-teal-deep" strokeWidth={3} aria-hidden />
              )}
            </span>
          </button>

          {/* ورود مهمان */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => go("home")}
              className="text-[12.5px] font-bold text-grey/90 underline decoration-brand-soft decoration-2 underline-offset-4 active:scale-95 transition-transform"
            >
              فعلاً به عنوان مهمان می‌رم
            </button>
          </div>
        </div>

        {/* ═══ بخش ورود مدیر ═══ */}
        <div className="mt-5 pt-4 border-t border-dashed border-brand-soft">
          <button
            type="button"
            onClick={() => setAdminOpen((v) => !v)}
            aria-expanded={adminOpen}
            className="mx-auto flex items-center gap-1.5 text-[12px] font-black text-grey active:scale-95 transition-transform"
          >
            <ShieldCheck className="h-4 w-4 text-brand-deep" aria-hidden />
            ورود مدیر
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${adminOpen ? "rotate-180" : ""}`} aria-hidden />
          </button>

          <AnimatePresence initial={false}>
            {adminOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-3.5 space-y-2.5">
                  <label className="flex items-center gap-2.5 bg-brand-faint border-2 border-brand-soft rounded-2xl h-11 px-3.5 focus-within:border-brand transition-colors">
                    <UserIcon className="h-[18px] w-[18px] text-brand shrink-0" aria-hidden />
                    <input
                      dir="ltr"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username"
                      aria-label="نام کاربری مدیر"
                      autoComplete="username"
                      className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink text-left placeholder:text-grey/70 placeholder:font-normal"
                    />
                  </label>
                  <label className="flex items-center gap-2.5 bg-brand-faint border-2 border-brand-soft rounded-2xl h-11 px-3.5 focus-within:border-brand transition-colors">
                    <Lock className="h-[18px] w-[18px] text-brand shrink-0" aria-hidden />
                    <input
                      dir="ltr"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") void submitAdmin(); }}
                      placeholder="password"
                      aria-label="رمز عبور مدیر"
                      autoComplete="current-password"
                      className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink text-left placeholder:text-grey/70 placeholder:font-normal"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => void submitAdmin()}
                    disabled={adminBusy}
                    className="w-full h-11 rounded-full bg-brand text-white text-[13.5px] font-black flex items-center justify-center gap-2 shadow-[0_6px_16px_rgba(236,64,122,.4)] active:scale-[.98] transition-transform disabled:opacity-60"
                  >
                    <ShieldCheck className="h-4 w-4" aria-hidden />
                    {adminBusy ? "در حال ورود…" : "ورود به پنل مدیریت"}
                  </button>

                  {/* راهنمای مشخصات مدیر (درخواست صریح کارفرما) */}
                  <p className="rounded-xl bg-brand-faint border border-brand-mist px-3 py-2 text-[11px] font-bold text-brand-dark leading-5 text-center">
                    مشخصات ورود مدیر — <span dir="ltr" className="tabular-nums">نام کاربری: admin — رمز: admin123</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══ سه آیتم ویژگی پایین پنل ═══ */}
        <div className="mt-5 pt-4 border-t border-brand-mist flex items-center justify-between px-1">
          {[
            { icon: MapPin, label: "تحویل در محل" },
            { icon: Flame, label: "پخت روزانه" },
            { icon: ShieldCheck, label: "کیفیت تضمینی" },
          ].map((it, i) => {
            const Icon = it.icon;
            return (
              <div key={it.label} className={`flex-1 flex flex-col items-center gap-1 ${i < 2 ? "border-l border-brand-mist" : ""}`}>
                <Icon className="h-[22px] w-[22px] text-brand-deep" aria-hidden />
                <span className="text-[11px] font-black text-[#880e4f]">{it.label}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
