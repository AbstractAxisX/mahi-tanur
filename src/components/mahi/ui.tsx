"use client";

import { cn } from "@/lib/utils";
import { faPrice, toFaDigits } from "@/lib/format";
import { ChevronLeft, ChevronRight, Fish, Waves, Bell, ShoppingBasket, Heart } from "lucide-react";
import { useMahiStore } from "./store";

/* ───────── لوگو ───────── */
export function MahiLogo({ size = "md", light = false }: { size?: "sm" | "md" | "lg"; light?: boolean }) {
  const s = size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg";
  return (
    <span className="inline-flex items-center gap-1.5 select-none">
      <span className="relative inline-flex items-center justify-center">
        <Fish className={cn("text-brand", light && "text-white")} strokeWidth={2.6} aria-hidden />
      </span>
      <span className={cn("font-black tracking-tight text-brand", light && "text-white drop-shadow-[0_2px_0_rgba(168,20,87,.55)]", s)}>
        ماهی‌یار
      </span>
      <Waves className="h-3 w-8 text-teal-brand shrink-0" strokeWidth={2.4} aria-hidden />
    </span>
  );
}

/* ───────── دکمه دایره‌ای صورتی (هدر) ───────── */
export function CircleBtn({
  children,
  onClick,
  label,
  className,
  badge,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  label: string;
  className?: string;
  badge?: string | number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative h-11 w-11 shrink-0 rounded-full bg-brand text-white grid place-items-center shadow-[0_4px_12px_rgba(236,64,122,.35)] active:scale-95 transition-transform",
        className
      )}
    >
      {children}
      {badge !== undefined && (
        <span className="absolute -top-1 -left-1 min-w-5 h-5 px-1 rounded-full bg-teal-brand text-white text-[11px] font-bold grid place-items-center border-2 border-white">
          {toFaDigits(badge)}
        </span>
      )}
    </button>
  );
}

/* ───────── سربرگ صفحات داخلی ───────── */
export function ScreenHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  const back = useMahiStore((s) => s.back);
  return (
    <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
      <CircleBtn label="بازگشت" onClick={back}>
        <ChevronRight className="h-6 w-6" strokeWidth={2.8} />
      </CircleBtn>
      <div className="flex-1 text-center">
        <h1 className="text-[22px] font-extrabold text-ink leading-7">{title}</h1>
        <Waves className="h-2.5 w-16 mx-auto text-teal-brand" strokeWidth={2.5} aria-hidden />
      </div>
      <div className="w-11 shrink-0 flex justify-start">{action}</div>
    </div>
  );
}

/* ───────── عنوان بخش (انواع ماهی ها) ───────── */
export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <Fish className="h-5 w-5 text-brand" strokeWidth={2.6} aria-hidden />
      <span className="text-teal-deep font-extrabold text-lg">{children}</span>
      <Waves className="h-4 w-10 text-brand-soft" strokeWidth={2.6} aria-hidden />
      <span className="text-teal-deep font-extrabold text-lg opacity-0 hidden sm:inline">{""}</span>
    </div>
  );
}

/* ───────── تیتر کارت سفید (تعداد ماهی، انتخاب زمان و ...) ───────── */
export function CardTitle({
  icon,
  title,
  sub,
  subCls,
}: {
  icon: React.ReactNode;
  title: string;
  sub?: string;
  subCls?: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="h-10 w-10 shrink-0 rounded-full bg-brand-mist grid place-items-center text-brand">{icon}</span>
      <div className="min-w-0">
        <h2 className="text-[16px] font-extrabold text-brand-deep leading-6">{title}</h2>
        {sub ? <p className={cn("text-[11.5px] leading-4 mt-0.5 text-grey", subCls)}>{sub}</p> : null}
      </div>
    </div>
  );
}

/* ───────── دکمه قرصی ───────── */
export function PillBtn({
  children,
  onClick,
  tone = "pink",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "pink" | "teal" | "white" | "ghost";
  className?: string;
}) {
  const tones: Record<string, string> = {
    pink: "bg-brand text-white shadow-[0_6px_16px_rgba(236,64,122,.4)]",
    teal: "bg-teal-brand text-white shadow-[0_6px_16px_rgba(0,188,212,.4)]",
    white: "bg-white text-brand-deep border-2 border-brand-mist",
    ghost: "bg-brand-mist text-brand-deep",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full px-5 h-10 text-[14px] font-bold active:scale-95 transition-transform",
        tones[tone],
        className
      )}
    >
      {children}
    </button>
  );
}

/* ───────── بج وضعیت سفارش ───────── */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    preparing: { label: "در حال آماده‌سازی", cls: "bg-teal-brand" },
    delivered: { label: "تحویل شد", cls: "bg-emerald-500" },
    canceled: { label: "لغو شد", cls: "bg-rose-400" },
  };
  const s = map[status] ?? map.preparing;
  return <span className={cn("inline-block rounded-full px-3 py-1 text-[11px] font-bold text-white", s.cls)}>{s.label}</span>;
}

/* ───────── قیمت ───────── */
export function Price({ value, unit = true, className }: { value: number; unit?: boolean; className?: string }) {
  return <span className={cn("tabular-nums", className)}>{faPrice(value, unit)}</span>;
}

/* ───────── قلب علاقه‌مندی ───────── */
export function FavHeart({ filled, onClick, className }: { filled: boolean; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      aria-label={filled ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
      className={cn(
        "h-9 w-9 grid place-items-center rounded-full backdrop-blur-sm transition-transform active:scale-90",
        filled ? "bg-white/90 text-brand" : "bg-white/70 text-brand-soft",
        className
      )}
    >
      <Heart className={cn("h-5 w-5", filled && "fill-brand")} strokeWidth={2.4} />
    </button>
  );
}

/* ───────── آیتم منوی کشویی ───────── */
export function DrawerItem({
  icon,
  label,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-right hover:bg-brand-faint transition-colors"
    >
      <span className="h-10 w-10 rounded-full bg-brand-mist grid place-items-center text-brand-deep shrink-0">{icon}</span>
      <span className="flex-1 font-bold text-[14px] text-ink">{label}</span>
      {badge ? (
        <span className="min-w-6 h-6 px-1.5 rounded-full bg-brand text-white text-[12px] font-bold grid place-items-center">
          {toFaDigits(badge)}
        </span>
      ) : (
        <ChevronLeft className="h-4 w-4 text-brand-mid" aria-hidden />
      )}
    </button>
  );
}

export { Bell, ShoppingBasket };
