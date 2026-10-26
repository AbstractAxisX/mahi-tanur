"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Settings as SettingsIcon, LayoutGrid, Fish as FishIcon, Salad, Clock, Truck, ClipboardList,
  Plus, Pencil, Trash2, Upload, Loader2, Image as ImageIcon, Sun, Moon, Home as HomeIcon,
  Navigation, ShieldCheck, ShieldOff, Store, Tag, Phone as PhoneIcon, Info as InfoIcon, Check,
  MapPin, Copy, ChevronDown, ExternalLink,
} from "lucide-react";

import { ScreenHeader, PillBtn, CardTitle, StatusBadge } from "../ui";
import { useMahiStore } from "../store";
import { cn } from "@/lib/utils";
import { faPrice, toFaDigits, faDateTime } from "@/lib/format";
import { osmEmbedUrl } from "@/lib/geo";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ═══════════════════════ types ═══════════════════════ */

type EntityTab = "categories" | "fish" | "extras" | "timeslots" | "delivery-methods";
type TabKey = "settings" | "orders" | EntityTab;

type FieldType = "text" | "textarea" | "number" | "image" | "select" | "switch";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
  def?: string | number | boolean;
}

type FormValue = string | number | boolean;
type FormState = Record<string, FormValue>;
type AdminRecord = { id: string } & Record<string, unknown>;

/* ═══════════════════════ helpers ═══════════════════════ */

function errMsg(e: unknown): string {
  if (e instanceof Error && e.message) return e.message;
  return "خطای نامشخص — دوباره تلاش کنید";
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) {
    let msg = `خطای سرور (کد ${toFaDigits(res.status)})`;
    try {
      const j = (await res.json()) as { error?: string };
      if (typeof j.error === "string" && j.error) msg = j.error;
    } catch {
      /* بدنه پاسخ json نبود */
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

const rv = {
  str: (r: AdminRecord | null, k: string): string => (r && typeof r[k] === "string" ? (r[k] as string) : ""),
  num: (r: AdminRecord | null, k: string): number => (r && typeof r[k] === "number" ? (r[k] as number) : 0),
  optNum: (r: AdminRecord | null, k: string): number | null => (r && typeof r[k] === "number" ? (r[k] as number) : null),
};

function parseExtras(json: string): { name: string }[] {
  try {
    const arr: unknown = JSON.parse(json);
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (x): x is { name: string } =>
        typeof x === "object" && x !== null && typeof (x as { name?: unknown }).name === "string"
    );
  } catch {
    return [];
  }
}

/** ساخت فرم از رکورد (یا حالت خالی برای افزودن) */
function recordToForm(fields: FieldDef[], rec: AdminRecord | null): FormState {
  const f: FormState = {};
  for (const fd of fields) {
    if (!rec) {
      if (fd.type === "number") f[fd.key] = typeof fd.def === "number" ? fd.def : 0;
      else if (fd.type === "switch") f[fd.key] = fd.def === true;
      else if (fd.type === "select") f[fd.key] = fd.options?.[0]?.value ?? "";
      else f[fd.key] = "";
      continue;
    }
    const v = rec[fd.key];
    if (fd.type === "number") f[fd.key] = typeof v === "number" ? v : 0;
    else if (fd.type === "switch") f[fd.key] = v === true;
    else f[fd.key] = typeof v === "string" ? v : "";
  }
  return f;
}

/** تبدیل فرم به بدنه درخواست — اعداد عدد، بولین بولین، رشته رشته */
function serializeForm(fields: FieldDef[], form: FormState): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const fd of fields) {
    const v = form[fd.key];
    if (fd.type === "number") out[fd.key] = Number(v) || 0;
    else if (fd.type === "switch") out[fd.key] = v === true;
    else if (fd.type === "image") out[fd.key] = v ? String(v) : null;
    else out[fd.key] = v === undefined || v === null ? "" : String(v);
  }
  return out;
}

/* ═══════════════════════ تنظیمات تب‌ها ═══════════════════════ */

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "settings", label: "تنظیمات سایت", icon: SettingsIcon },
  { key: "categories", label: "دسته‌بندی‌ها", icon: LayoutGrid },
  { key: "fish", label: "ماهی‌ها", icon: FishIcon },
  { key: "extras", label: "حَشوها", icon: Salad },
  { key: "timeslots", label: "زمان‌ها", icon: Clock },
  { key: "delivery-methods", label: "روش دریافت", icon: Truck },
  { key: "orders", label: "سفارش‌ها", icon: ClipboardList },
];

const SINGULAR: Record<EntityTab, string> = {
  categories: "دسته‌بندی",
  fish: "ماهی",
  extras: "حَشو",
  timeslots: "بازه زمانی",
  "delivery-methods": "روش دریافت",
};

const SHIFT_OPTIONS = [
  { value: "ظهر", label: "ظهر" },
  { value: "عصر", label: "عصر" },
];

const SLOT_ICON_OPTIONS = [
  { value: "sun", label: "☀️ خورشید (ظهر)" },
  { value: "moon", label: "🌙 ماه (عصر)" },
];

const DELIVERY_ICON_OPTIONS = [
  { value: "home", label: "🏠 تحویل در محل" },
  { value: "truck", label: "🚚 وانت (رفت و برگشت)" },
  { value: "scooter", label: "🛵 اسکوتر (فقط رفت)" },
];

const ORDER_STATUSES = [
  { value: "preparing", label: "آماده‌سازی" },
  { value: "delivered", label: "تحویل شد" },
  { value: "canceled", label: "لغو شد" },
];

function fieldsFor(tab: EntityTab, cats: AdminRecord[]): FieldDef[] {
  switch (tab) {
    case "categories":
      return [
        { key: "name", label: "نام دسته‌بندی", type: "text", required: true, placeholder: "مثلاً قزل آلا" },
        { key: "image", label: "تصویر دسته‌بندی", type: "image" },
        { key: "order", label: "ترتیب نمایش", type: "number", def: 0 },
        { key: "active", label: "فعال باشد", type: "switch", def: true },
      ];
    case "fish":
      return [
        { key: "name", label: "نام ماهی", type: "text", required: true, placeholder: "مثلاً قزل آلا" },
        { key: "image", label: "تصویر ماهی", type: "image", required: true },
        { key: "description", label: "توضیحات", type: "textarea", placeholder: "توضیح کوتاه درباره این ماهی…" },
        { key: "price", label: "قیمت هر عدد (تومان)", type: "number", required: true, placeholder: "مثلاً 195000" },
        { key: "badgeText", label: "متن بج (اختیاری)", type: "text", placeholder: "مثلاً پیشنهاد ویژه" },
        { key: "inStock", label: "موجود است", type: "switch", def: true },
        {
          key: "categoryId", label: "دسته‌بندی", type: "select", required: true,
          options: cats.map((c) => ({ value: c.id, label: rv.str(c, "name") || "بدون نام" })),
        },
        { key: "order", label: "ترتیب نمایش", type: "number", def: 0 },
        { key: "active", label: "فعال باشد", type: "switch", def: true },
      ];
    case "extras":
      return [
        { key: "name", label: "نام حَشو", type: "text", required: true, placeholder: "مثلاً سبزیجات" },
        { key: "image", label: "تصویر حَشو", type: "image", required: true },
        { key: "price", label: "قیمت (تومان)", type: "number", required: true, placeholder: "مثلاً 10000" },
        { key: "order", label: "ترتیب نمایش", type: "number", def: 0 },
        { key: "active", label: "فعال باشد", type: "switch", def: true },
      ];
    case "timeslots":
      return [
        { key: "label", label: "بازه زمانی", type: "text", required: true, placeholder: "مثلاً ۱۱:۰۰ تا ۱۳:۰۰" },
        { key: "shift", label: "شیفت", type: "select", required: true, options: SHIFT_OPTIONS },
        { key: "icon", label: "آیکون", type: "select", options: SLOT_ICON_OPTIONS },
        { key: "order", label: "ترتیب نمایش", type: "number", def: 0 },
        { key: "active", label: "فعال باشد", type: "switch", def: true },
      ];
    case "delivery-methods":
      return [
        {
          key: "code", label: "کد یکتا", type: "text", required: true,
          placeholder: "مثلاً express", hint: "هر روش دریافت باید یک کد یکتا داشته باشد (مثل in_place، one_way)",
        },
        { key: "title", label: "عنوان", type: "text", required: true, placeholder: "مثلاً پیک فقط رفت" },
        { key: "subtitle", label: "زیرعنوان", type: "text", placeholder: "مثلاً تحویل توسط پیک" },
        { key: "price", label: "قیمت (تومان)", type: "number", def: 0, hint: "برای رایگان بودن، صفر بگذارید" },
        { key: "icon", label: "آیکون", type: "select", options: DELIVERY_ICON_OPTIONS },
        { key: "order", label: "ترتیب نمایش", type: "number", def: 0 },
        { key: "active", label: "فعال باشد", type: "switch", def: true },
      ];
  }
}

/* ═══════════════ فیلدهای تنظیمات سایت (گروه‌بندی‌شده) ═══════════════ */

const SETTINGS_GROUPS: { title: string; icon: LucideIcon; fields: FieldDef[] }[] = [
  {
    title: "مشخصات کلی",
    icon: Store,
    fields: [
      { key: "appName", label: "نام اپلیکیشن", type: "text", required: true },
      { key: "appSlogan", label: "شعار", type: "text" },
      { key: "logoImage", label: "لوگو (PNG)", type: "image" },
    ],
  },
  {
    title: "بخش هیرو (کاور بالای صفحه اصلی)",
    icon: ImageIcon,
    fields: [
      { key: "heroImage", label: "عکس کاور (تمام‌عرض)", type: "image" },
      { key: "heroBadgeText", label: "متن بج کاور", type: "text", placeholder: "مثلاً ماهی و غذای دریایی" },
      { key: "heroTitle", label: "تیتر کاور", type: "text" },
      { key: "heroSubtitle", label: "زیرتیتر کاور", type: "text" },
      { key: "heroCtaText", label: "متن دکمه ثبت سفارش", type: "text" },
    ],
  },
  {
    title: "بنر تبلیغاتی (فقط عکس)",
    icon: Tag,
    fields: [
      { key: "promoImage", label: "عکس بنر", type: "image" },
      { key: "promoLink", label: "لینک کلیک (اختیاری)", type: "text", placeholder: "https://…" },
    ],
  },
  {
    title: "تماس و آدرس",
    icon: PhoneIcon,
    fields: [
      { key: "phone", label: "تلفن", type: "text", placeholder: "۰۹۱۲۳۴۵۶۷۸۹" },
      { key: "workHours", label: "ساعات کاری", type: "text", placeholder: "۱۱:۰۰ الی ۲۳:۰۰" },
      { key: "instagram", label: "اینستاگرام (بدون @)", type: "text" },
      { key: "addressText", label: "آدرس", type: "textarea" },
    ],
  },
  {
    title: "فوتر",
    icon: InfoIcon,
    fields: [{ key: "footerNote", label: "متن فوتر", type: "text" }],
  },
];

const SETTINGS_FIELDS: FieldDef[] = SETTINGS_GROUPS.flatMap((g) => g.fields);

/* ═══════════════════════ آیکون‌های کمکی ═══════════════════════ */

function SlotIcon({ icon, className }: { icon: string; className?: string }) {
  return icon === "moon" ? <Moon className={className} aria-hidden /> : <Sun className={className} aria-hidden />;
}

function DeliveryGlyph({ icon, className }: { icon: string; className?: string }) {
  if (icon === "home") return <HomeIcon className={className} aria-hidden />;
  if (icon === "scooter") return <Navigation className={className} aria-hidden />;
  return <Truck className={className} aria-hidden />;
}

/* ═══════════════════════ فیلد تصویر (URL + آپلود + پیش‌نمایش) ═══════════════════════ */

function ImageField({
  label, value, required, onChange,
}: {
  label: string;
  value: string;
  required?: boolean;
  onChange: (v: string) => void;
}) {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "حجم تصویر زیاد است", description: "حداکثر حجم مجاز ۸ مگابایت است" });
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        let msg = "آپلود ناموفق بود";
        try {
          const j = (await res.json()) as { error?: string };
          if (j.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const j = (await res.json()) as { url: string };
      onChange(j.url);
      toast({ title: "عکس آپلود شد ✅" });
    } catch (e) {
      toast({ title: "آپلود ناموفق", description: errMsg(e) });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-[12.5px] font-bold text-ink">
        {label}
        {required ? " *" : ""}
      </Label>
      <div className="flex items-start gap-3">
        <span className="relative h-16 w-16 shrink-0 rounded-2xl overflow-hidden border-2 border-brand-soft bg-brand-faint grid place-items-center">
          {value ? (
            <Image src={value} alt={label} fill unoptimized sizes="64px" className="object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-brand-soft" aria-hidden />
          )}
        </span>
        <div className="flex-1 min-w-0 space-y-2">
          <Input
            dir="ltr"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://… یا /uploads/…"
            className="h-10 rounded-xl border-brand-soft bg-white text-[12px] text-left"
            aria-label={`${label} — آدرس تصویر`}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-brand-mist text-brand-deep text-[12px] font-black active:scale-95 transition-transform disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
              {busy ? "در حال آپلود…" : "آپلود عکس"}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-full bg-rose-50 text-rose-400 text-[11px] font-black active:scale-95 transition-transform"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                حذف
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
    </div>
  );
}

/* ═══════════════════════ رندر فیلد فرم ═══════════════════════ */

function FieldInput({
  def, value, onChange,
}: {
  def: FieldDef;
  value: FormValue | undefined;
  onChange: (v: FormValue) => void;
}) {
  const id = useId();
  const ltrField = def.key === "code" || def.key === "instagram";

  if (def.type === "image") {
    return (
      <div className="sm:col-span-2">
        <ImageField label={def.label} value={String(value ?? "")} required={def.required} onChange={onChange} />
      </div>
    );
  }

  if (def.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-brand-faint border-2 border-brand-soft px-3.5 h-12">
        <Label htmlFor={id} className="text-[13px] font-bold text-ink cursor-pointer">
          {def.label}
          {def.required ? " *" : ""}
        </Label>
        <Switch id={id} checked={value === true} onCheckedChange={(v) => onChange(v)} aria-label={def.label} />
      </div>
    );
  }

  const control =
    def.type === "textarea" ? (
      <Textarea
        id={id}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        placeholder={def.placeholder}
        rows={3}
        dir="auto"
        className="rounded-2xl border-brand-soft bg-white text-[13px]"
      />
    ) : def.type === "select" ? (
      <Select value={String(value ?? "")} onValueChange={(v) => onChange(v)} dir="rtl">
        <SelectTrigger id={id} className="h-11 w-full rounded-2xl border-brand-soft bg-white text-[13px] font-bold">
          <SelectValue placeholder="انتخاب کنید" />
        </SelectTrigger>
        <SelectContent className="rounded-2xl">
          {(def.options ?? []).map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-[13px]">
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ) : (
      <Input
        id={id}
        type={def.type === "number" ? "number" : "text"}
        dir={def.type === "number" || ltrField ? "ltr" : "auto"}
        value={String(value ?? "")}
        onChange={(e) =>
          onChange(
            def.type === "number"
              ? e.target.value === ""
                ? 0
                : Number(e.target.value)
              : e.target.value
          )
        }
        placeholder={def.placeholder}
        className="h-11 rounded-2xl border-brand-soft bg-white text-[13px]"
      />
    );

  return (
    <div className={cn("space-y-1.5", def.type === "textarea" && "sm:col-span-2")}>
      <Label htmlFor={id} className="text-[12.5px] font-bold text-ink">
        {def.label}
        {def.required ? " *" : ""}
      </Label>
      {control}
      {def.hint ? <p className="text-[10.5px] text-grey leading-4">{def.hint}</p> : null}
    </div>
  );
}

/* ═══════════════════════ کارت آیتم (تب‌های موجودیت) ═══════════════════════ */

function EntityCard({
  tab, rec, catName, index, onEdit, onDelete, onToggle, onToggleStock,
}: {
  tab: EntityTab;
  rec: AdminRecord;
  catName: string;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onToggleStock?: () => void;
}) {
  const mainKey = tab === "timeslots" ? "label" : tab === "delivery-methods" ? "title" : "name";
  const name = rv.str(rec, mainKey);
  const active = rec.active === true;
  const inStock = rec.inStock !== false;
  const order = rv.num(rec, "order");
  const price = rv.num(rec, "price");
  const image = rv.str(rec, "image");
  const icon = rv.str(rec, "icon");
  const hasImage = tab === "categories" || tab === "fish" || tab === "extras";

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.25) }}
      className="my-card-sm p-3 flex items-center gap-3"
      role="listitem"
    >
      {hasImage ? (
        <span className="relative h-14 w-14 shrink-0 rounded-2xl overflow-hidden border-2 border-brand-soft bg-brand-faint grid place-items-center">
          {image ? (
            <Image src={image} alt={name} fill unoptimized sizes="56px" className="object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-brand-soft" aria-hidden />
          )}
        </span>
      ) : (
        <span
          className={cn(
            "h-14 w-14 shrink-0 rounded-2xl grid place-items-center",
            tab === "timeslots" && icon === "moon" ? "bg-[#ede7f6] text-ink-2" : "bg-teal-mist text-teal-deep"
          )}
        >
          {tab === "timeslots" ? <SlotIcon icon={icon} className="h-6 w-6" /> : <DeliveryGlyph icon={icon} className="h-6 w-6" />}
        </span>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="text-[14px] font-black text-ink truncate max-w-full">{name || "بدون نام"}</h3>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9.5px] font-black shrink-0",
              active ? "bg-teal-mist text-teal-deep" : "bg-grey/15 text-grey"
            )}
          >
            {active ? "فعال" : "غیرفعال"}
          </span>
          {tab === "fish" ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9.5px] font-black shrink-0",
                inStock ? "bg-teal-brand text-white" : "bg-rose-500 text-white"
              )}
            >
              {inStock ? "موجود" : "ناموجود"}
            </span>
          ) : null}
        </div>
        <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[11px] font-bold text-grey">
          {tab === "fish" ? (
            <>
              <span className="text-brand-deep">{faPrice(price)}</span>
              {catName ? (
                <span className="rounded-full bg-brand-faint px-2 py-0.5 text-[10px] text-brand-deep">{catName}</span>
              ) : null}
            </>
          ) : null}
          {tab === "extras" ? <span className="text-brand-deep">{faPrice(price)}</span> : null}
          {tab === "categories" ? <span>ترتیب: {toFaDigits(order)}</span> : null}
          {tab === "timeslots" ? <span>شیفت {rv.str(rec, "shift")}</span> : null}
          {tab === "delivery-methods" ? (
            <>
              <span className="text-brand-deep">{price === 0 ? "رایگان" : faPrice(price)}</span>
              <span dir="ltr" className="rounded-full bg-brand-faint px-2 py-0.5 text-[10px] text-brand-deep">
                {rv.str(rec, "code")}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {tab === "fish" && onToggleStock ? (
          <button
            type="button"
            onClick={onToggleStock}
            aria-label={inStock ? `ناموجود کردن ${name}` : `موجود کردن ${name}`}
            title={inStock ? "ناموجود کردن" : "موجود کردن"}
            className={cn(
              "inline-flex items-center gap-1 h-9 px-2.5 rounded-full text-[10.5px] font-black active:scale-90 transition-transform",
              inStock ? "bg-teal-mist text-teal-deep" : "bg-rose-50 text-rose-500"
            )}
          >
            {inStock ? <Check className="h-3.5 w-3.5" aria-hidden /> : <ShieldOff className="h-3.5 w-3.5" aria-hidden />}
            {inStock ? "موجود" : "ناموجود"}
          </button>
        ) : null}
        <Switch checked={active} onCheckedChange={onToggle} aria-label={active ? `غیرفعال‌کردن ${name}` : `فعال‌کردن ${name}`} />
        <button
          type="button"
          onClick={onEdit}
          aria-label={`ویرایش ${name}`}
          className="h-9 w-9 rounded-full bg-brand-mist text-brand-deep grid place-items-center active:scale-90 transition-transform"
        >
          <Pencil className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`حذف ${name}`}
          className="h-9 w-9 rounded-full bg-rose-50 text-rose-400 grid place-items-center active:scale-90 transition-transform"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════ کارت سفارش ═══════════════════════ */

function OrderCard({
  rec, onStatus, onDelete,
}: {
  rec: AdminRecord;
  onStatus: (status: string) => void;
  onDelete: () => void;
}) {
  const { toast } = useToast();
  const [mapOpen, setMapOpen] = useState(false);
  const fishName = rv.str(rec, "fishName");
  const fishImage = rv.str(rec, "fishImage");
  const quantity = rv.num(rec, "quantity");
  const total = rv.num(rec, "total");
  const status = rv.str(rec, "status");
  const receiver = rv.str(rec, "receiver");
  const phone = rv.str(rec, "receiverPhone");
  const slot = rv.str(rec, "timeSlotLabel");
  const method = rv.str(rec, "deliveryMethodTitle");
  const address = rv.str(rec, "addressFull");
  const note = rv.str(rec, "note");
  const createdAt = rv.str(rec, "createdAt");
  const extras = parseExtras(rv.str(rec, "extrasJson"));
  const lat = rv.optNum(rec, "addressLat");
  const lng = rv.optNum(rec, "addressLng");
  const hasLoc = lat != null && lng != null;

  const copyCoords = async () => {
    if (lat == null || lng == null) return;
    try {
      await navigator.clipboard.writeText(`${lat},${lng}`);
      toast({ title: "مختصات کپی شد", description: `${lat}, ${lng}` });
    } catch {
      toast({ title: "کپی ناموفق بود" });
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-card p-4 space-y-3"
      role="listitem"
    >
      <div className="flex items-start gap-3">
        <span className="relative w-20 aspect-video shrink-0 rounded-xl overflow-hidden border-2 border-brand-soft bg-brand-faint">
          {fishImage ? <Image src={fishImage} alt={fishName} fill unoptimized sizes="80px" className="object-cover" /> : null}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14.5px] font-black text-ink truncate">
              {fishName || "سفارش"}
              <span className="text-grey font-bold text-[12px]"> × {toFaDigits(quantity || 1)}</span>
            </h3>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-[11.5px] font-bold text-grey truncate">
            {receiver}
            {phone ? <> · <span dir="ltr">{toFaDigits(phone)}</span></> : null}
          </p>
          <p className="mt-0.5 text-[11px] text-grey truncate">
            {slot}
            {method ? <> · {method}</> : null}
          </p>
          {address ? <p className="mt-0.5 text-[11px] text-grey leading-4">{address}</p> : null}
          {extras.length > 0 ? (
            <p className="mt-1 text-[10.5px] font-bold text-teal-deep">حَشوها: {extras.map((x) => x.name).join("، ")}</p>
          ) : null}
          {note ? <p className="mt-0.5 text-[10.5px] font-bold text-brand-deep">یادداشت: {note}</p> : null}
        </div>
      </div>

      {/* ── لوکیشن تحویل روی نقشه + باز کردن در برنامه‌های مسیریابی ── */}
      {hasLoc && lat != null && lng != null ? (
        <div className="rounded-[16px] border-2 border-teal-mist bg-teal-mist/25 p-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-black text-teal-deep flex items-center gap-1.5">
              <MapPin className="h-4 w-4" fill="currentColor" aria-hidden />
              موقعیت تحویل روی نقشه
            </span>
            <button
              type="button"
              onClick={() => setMapOpen((v) => !v)}
              aria-expanded={mapOpen}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-white text-teal-deep text-[10.5px] font-black active:scale-95 transition-transform"
            >
              {mapOpen ? "بستن نقشه" : "نمایش نقشه"}
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", mapOpen && "rotate-180")} aria-hidden />
            </button>
          </div>
          {mapOpen && (
            <iframe
              src={osmEmbedUrl(lat, lng)}
              title={`نقشهٔ موقعیت تحویل — ${fishName}`}
              loading="lazy"
              className="h-44 w-full rounded-[12px] border-0 bg-white"
            />
          )}
          <p dir="ltr" className="text-right text-[10px] font-bold text-grey tabular-nums">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            <a
              href={`geo:${lat},${lng}`}
              className="inline-flex items-center justify-center gap-1 h-9 rounded-full bg-teal-brand text-white text-[10.5px] font-black active:scale-95 transition-transform"
              aria-label="باز کردن در برنامه نقشهٔ گوشی"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden />
              نقشه گوشی
            </a>
            <a
              href={`https://maps.google.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 h-9 rounded-full bg-brand-mist text-brand-deep text-[10.5px] font-black active:scale-95 transition-transform"
              aria-label="باز کردن در گوگل مپ"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              گوگل‌مپ
            </a>
            <a
              href={`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 h-9 rounded-full bg-brand-mist text-brand-deep text-[10.5px] font-black active:scale-95 transition-transform"
              aria-label="باز کردن در ویز"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              ویز
            </a>
            <button
              type="button"
              onClick={() => void copyCoords()}
              className="inline-flex items-center justify-center gap-1 h-9 rounded-full bg-brand-mist text-brand-deep text-[10.5px] font-black active:scale-95 transition-transform"
              aria-label="کپی مختصات"
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
              کپی
            </button>
          </div>
        </div>
      ) : (
        <p className="text-[10.5px] text-grey font-bold">📍 این سفارش لوکیشن نقشه ندارد</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-dashed border-brand-soft">
        <span className="text-[15px] font-black text-brand-deep">{faPrice(total)}</span>
        <span className="text-[10.5px] font-bold text-grey tabular-nums">{faDateTime(createdAt)}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex rounded-full bg-brand-mist p-1 gap-1" role="group" aria-label="تغییر وضعیت سفارش">
          {ORDER_STATUSES.map((st) => {
            const on = status === st.value;
            return (
              <button
                key={st.value}
                type="button"
                onClick={() => onStatus(st.value)}
                aria-pressed={on}
                className={cn(
                  "flex-1 h-8 rounded-full text-[10.5px] font-black transition-colors active:scale-95",
                  on
                    ? st.value === "delivered"
                      ? "bg-emerald-500 text-white"
                      : st.value === "canceled"
                        ? "bg-rose-400 text-white"
                        : "bg-teal-brand text-white"
                    : "text-brand-deep/70"
                )}
              >
                {st.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onDelete}
          aria-label="حذف سفارش"
          className="h-9 w-9 shrink-0 rounded-full bg-rose-50 text-rose-400 grid place-items-center active:scale-90 transition-transform"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════ نمای اصلی پنل مدیریت ═══════════════════════ */

export default function AdminView() {
  const { toast } = useToast();
  const authUser = useMahiStore((s) => s.authUser);
  const go = useMahiStore((s) => s.go);

  /* ─── دروازه دسترسی: فقط مدیر ─── */
  if (authUser?.role !== "admin") {
    return (
      <div className="pb-2">
        <ScreenHeader
          title="پنل مدیریت"
          action={
            <span className="h-11 w-11 grid place-items-center rounded-full bg-white/60">
              <ShieldOff className="h-6 w-6 text-brand" aria-hidden />
            </span>
          }
        />
        <div className="my-card p-8 text-center mt-3">
          <span className="mx-auto h-20 w-20 rounded-full bg-brand-mist grid place-items-center">
            <ShieldOff className="h-10 w-10 text-brand-deep" aria-hidden />
          </span>
          <p className="mt-4 text-[17px] font-black text-ink">دسترسی فقط برای مدیر</p>
          <p className="mt-1.5 text-[12.5px] font-bold text-grey leading-5">
            برای ورود به پنل مدیریت، با حساب مدیر وارد شو
          </p>
          <PillBtn className="mt-5 h-12 px-8" onClick={() => go("login")}>
            <ShieldCheck className="h-5 w-5" aria-hidden />
            ورود مدیر
          </PillBtn>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}

function AdminPanel() {
  const { toast } = useToast();
  const [tab, setTab] = useState<TabKey>("settings");
  const [loading, setLoading] = useState(true);
  const [lists, setLists] = useState<Partial<Record<TabKey, AdminRecord[]>>>({});
  const [cats, setCats] = useState<AdminRecord[]>([]);
  const [nonce, setNonce] = useState(0);

  /* فرم افزودن/ویرایش */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRecord | null>(null);
  const [form, setForm] = useState<FormState>({});
  const [saving, setSaving] = useState(false);

  /* حذف */
  const [delTarget, setDelTarget] = useState<AdminRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* فرم تنظیمات سایت */
  const [sForm, setSForm] = useState<FormState | null>(null);
  const [sSaving, setSSaving] = useState(false);

  const entityTab: EntityTab | null = tab === "settings" || tab === "orders" ? null : tab;
  const items: AdminRecord[] = tab === "settings" ? [] : (lists[tab] ?? []);
  const tabMeta = TABS.find((t) => t.key === tab);

  /* ─── بارگذاری داده تب فعال ─── */
  const load = useCallback(
    async (t: TabKey) => {
      setLoading(true);
      try {
        if (t === "settings") {
          const s = await fetchJson<AdminRecord>("/api/admin/settings");
          setSForm(recordToForm(SETTINGS_FIELDS, s));
        } else {
          const arr = await fetchJson<AdminRecord[]>(`/api/admin/${t}`);
          setLists((p) => ({ ...p, [t]: arr }));
          if (t === "categories") {
            setCats(arr);
          } else if (t === "fish") {
            /* برای سلکت دسته‌بندی در فرم ماهی */
            try {
              const c = await fetchJson<AdminRecord[]>("/api/admin/categories");
              setCats(c);
            } catch {
              /* از کش قبلی استفاده می‌شود */
            }
          }
        }
      } catch (e) {
        toast({ title: "خطا در دریافت اطلاعات", description: errMsg(e) });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    void load(tab);
  }, [tab, load, nonce]);

  const bump = () => setNonce((x) => x + 1);
  const refreshApp = () => window.dispatchEvent(new Event("mahi:refresh"));

  /* ─── عملیات‌ها ─── */

  const toggleActive = async (rec: AdminRecord) => {
    if (!entityTab) return;
    const next = !(rec.active === true);
    try {
      await fetchJson(`/api/admin/${entityTab}/${rec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: next }),
      });
      toast({ title: next ? "فعال شد ✅" : "غیرفعال شد" });
      bump();
      refreshApp();
    } catch (e) {
      toast({ title: "تغییر وضعیت ناموفق بود", description: errMsg(e) });
    }
  };

  /* تغییر سریع موجود / ناموجود (تب ماهی‌ها) */
  const toggleInStock = async (rec: AdminRecord) => {
    const next = rec.inStock === false; // اگر ناموجود بود → موجود کن
    try {
      await fetchJson(`/api/admin/fish/${rec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: next }),
      });
      toast({ title: next ? "موجود شد ✅" : "ناموجود شد" });
      bump();
      refreshApp();
    } catch (e) {
      toast({ title: "تغییر موجودی ناموفق بود", description: errMsg(e) });
    }
  };

  const openCreate = () => {
    if (!entityTab) return;
    setEditing(null);
    setForm(recordToForm(fieldsFor(entityTab, cats), null));
    setFormOpen(true);
  };

  const openEdit = (rec: AdminRecord) => {
    if (!entityTab) return;
    setEditing(rec);
    setForm(recordToForm(fieldsFor(entityTab, cats), rec));
    setFormOpen(true);
  };

  const saveForm = async () => {
    if (!entityTab) return;
    const fields = fieldsFor(entityTab, cats);
    for (const fd of fields) {
      if (!fd.required) continue;
      const v = form[fd.key];
      if (v === undefined || v === null || v === "") {
        toast({ title: "تکمیل فیلدهای اجباری", description: `«${fd.label}» را تکمیل کنید` });
        return;
      }
    }
    if (entityTab === "delivery-methods") {
      const code = String(form.code ?? "");
      const dup = (lists["delivery-methods"] ?? []).some((r) => rv.str(r, "code") === code && r.id !== editing?.id);
      if (dup) {
        toast({ title: "کد تکراری است", description: "هر روش دریافت باید یک کد یکتا داشته باشد" });
        return;
      }
    }
    const body = serializeForm(fields, form);
    setSaving(true);
    try {
      await fetchJson(editing ? `/api/admin/${entityTab}/${editing.id}` : `/api/admin/${entityTab}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setFormOpen(false);
      toast({ title: editing ? "با موفقیت ویرایش شد ✅" : "با موفقیت اضافه شد ✅" });
      bump();
      refreshApp();
    } catch (e) {
      toast({ title: "ثبت انجام نشد", description: errMsg(e) });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!delTarget) return;
    setDeleting(true);
    try {
      await fetchJson(`/api/admin/${tab}/${delTarget.id}`, { method: "DELETE" });
      setDelTarget(null);
      toast({ title: "حذف شد 🗑️" });
      bump();
      refreshApp();
    } catch (e) {
      toast({ title: "حذف ناموفق بود", description: errMsg(e) });
    } finally {
      setDeleting(false);
    }
  };

  const setOrderStatus = async (rec: AdminRecord, status: string) => {
    if (rv.str(rec, "status") === status) return;
    try {
      await fetchJson(`/api/orders/${rec.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast({ title: "وضعیت سفارش ثبت شد ✅" });
      bump();
    } catch (e) {
      toast({ title: "تغییر وضعیت ناموفق بود", description: errMsg(e) });
    }
  };

  const saveSettings = async () => {
    if (!sForm) return;
    setSSaving(true);
    try {
      const body: Record<string, string> = {};
      for (const fd of SETTINGS_FIELDS) body[fd.key] = String(sForm[fd.key] ?? "");
      await fetchJson("/api/admin/settings/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      toast({ title: "تنظیمات سایت ذخیره شد ✅" });
      bump();
      refreshApp();
    } catch (e) {
      toast({ title: "ذخیره نشد", description: errMsg(e) });
    } finally {
      setSSaving(false);
    }
  };

  const catNameFor = (rec: AdminRecord): string => {
    const cat = rec.category;
    if (cat && typeof cat === "object") {
      const nm = rv.str(cat as AdminRecord, "name");
      if (nm) return nm;
    }
    const cid = rv.str(rec, "categoryId");
    const c = cats.find((x) => x.id === cid);
    return c ? rv.str(c, "name") : "";
  };

  const delName = delTarget
    ? rv.str(delTarget, tab === "timeslots" ? "label" : tab === "delivery-methods" ? "title" : tab === "orders" ? "fishName" : "name")
    : "";

  /* ─── رندر ─── */

  return (
    <div className="pb-2">
      <ScreenHeader
        title="پنل مدیریت"
        action={
          <span className="h-11 w-11 grid place-items-center rounded-full bg-white/60">
            <ShieldCheck className="h-6 w-6 text-brand" aria-hidden />
          </span>
        }
      />

      {/* چیپ‌های تب (اسکرول افقی) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1" role="tablist" aria-label="بخش‌های پنل مدیریت">
        {TABS.map((t) => {
          const on = tab === t.key;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setTab(t.key)}
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[12.5px] font-black border-2 transition-all active:scale-95",
                on
                  ? "bg-brand text-white border-brand shadow-[0_6px_16px_rgba(236,64,122,.4)]"
                  : "bg-white/70 text-brand-deep border-brand-soft"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>

      <section className="mt-3" aria-live="polite">
        {/* ───── تب تنظیمات سایت ───── */}
        {tab === "settings" ? (
          sForm === null ? (
            <div className="my-card p-5 space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-2xl bg-brand-faint animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {SETTINGS_GROUPS.map((g) => (
                <div key={g.title} className="my-card p-4 mb-3">
                  <CardTitle icon={<g.icon className="h-5 w-5" aria-hidden />} title={g.title} />
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {g.fields.map((fd) => (
                      <FieldInput
                        key={fd.key}
                        def={fd}
                        value={sForm[fd.key]}
                        onChange={(v) => setSForm((p) => (p ? { ...p, [fd.key]: v } : p))}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => void saveSettings()}
                disabled={sSaving}
                className="w-full h-12 rounded-full bg-brand text-white text-[15px] font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(236,64,122,.4)] active:scale-[.98] transition-transform disabled:opacity-60"
              >
                {sSaving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Check className="h-5 w-5" strokeWidth={3} aria-hidden />}
                {sSaving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
              </button>
            </>
          )
        ) : (
          <>
            {/* ───── سربرگ تب + دکمه افزودن ───── */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="text-[16px] font-extrabold text-ink truncate">{tabMeta?.label}</h2>
                <span className="rounded-full bg-white/80 px-2.5 h-6 grid place-items-center text-[11px] font-black text-brand-deep border border-brand-soft shrink-0">
                  {toFaDigits(items.length)}
                </span>
              </div>
              {tab !== "orders" ? (
                <PillBtn onClick={openCreate}>
                  <Plus className="h-4 w-4" strokeWidth={3} aria-hidden />
                  افزودن
                </PillBtn>
              ) : null}
            </div>

            {loading && items.length === 0 ? (
              /* ───── حالت بارگذاری ───── */
              <div className="space-y-2.5">
                {tab === "orders"
                  ? [0, 1, 2].map((i) => <div key={i} className="my-card h-44 animate-pulse" />)
                  : [0, 1, 2, 3].map((i) => <div key={i} className="my-card-sm h-[78px] animate-pulse" />)}
              </div>
            ) : items.length === 0 ? (
              /* ───── حالت خالی ───── */
              <div className="my-card p-8 text-center">
                {tabMeta ? <tabMeta.icon className="mx-auto h-12 w-12 text-brand-soft" aria-hidden /> : null}
                <p className="mt-2 text-[14px] font-black text-ink">هنوز چیزی ثبت نشده</p>
                <p className="text-[12px] text-grey mt-1">
                  {tab === "orders" ? "سفارش‌های ثبت‌شده کاربران اینجا نمایش داده می‌شوند" : "با دکمه «افزودن» اولین مورد را بساز"}
                </p>
              </div>
            ) : tab === "orders" ? (
              /* ───── لیست سفارش‌ها ───── */
              <div className="space-y-3" role="list">
                {items.map((rec) => (
                  <OrderCard
                    key={rec.id}
                    rec={rec}
                    onStatus={(st) => void setOrderStatus(rec, st)}
                    onDelete={() => setDelTarget(rec)}
                  />
                ))}
              </div>
            ) : (
              /* ───── لیست موجودیت‌ها ───── */
              <div className="space-y-2.5" role="list">
                {items.map((rec, i) => (
                  <EntityCard
                    key={rec.id}
                    tab={tab}
                    rec={rec}
                    catName={catNameFor(rec)}
                    index={i}
                    onEdit={() => openEdit(rec)}
                    onDelete={() => setDelTarget(rec)}
                    onToggle={() => void toggleActive(rec)}
                    onToggleStock={tab === "fish" ? () => void toggleInStock(rec) : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* ───── دیالوگ افزودن/ویرایش ───── */}
      {entityTab ? (
        <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); }}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto rounded-[26px] border-2 border-brand-soft">
            <DialogHeader className="text-right">
              <DialogTitle className="text-[16px] font-black text-ink">
                {editing ? `ویرایش ${SINGULAR[entityTab]}` : `افزودن ${SINGULAR[entityTab]}`}
              </DialogTitle>
              <DialogDescription className="text-[11.5px]">
                {editing ? "مشخصات را تغییر دهید و ذخیره کنید" : "مشخصات جدید را وارد کنید و ثبت کنید"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {fieldsFor(entityTab, cats).map((fd) => (
                <FieldInput
                  key={fd.key}
                  def={fd}
                  value={form[fd.key]}
                  onChange={(v) => setForm((p) => ({ ...p, [fd.key]: v }))}
                />
              ))}
            </div>

            <DialogFooter className="flex-row gap-2">
              <PillBtn tone="white" onClick={() => setFormOpen(false)}>
                انصراف
              </PillBtn>
              <PillBtn tone="teal" className="flex-1" onClick={() => void saveForm()}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={3} aria-hidden />
                )}
                {saving ? "در حال ذخیره…" : editing ? "ذخیره تغییرات" : "افزودن"}
              </PillBtn>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* ───── تأیید حذف ───── */}
      <AlertDialog open={!!delTarget} onOpenChange={(o) => { if (!o) setDelTarget(null); }}>
        <AlertDialogContent className="max-w-xs rounded-[26px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink">حذف شود؟</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] leading-5">
              {tab === "orders"
                ? `سفارش «${delName}» به‌طور کامل حذف می‌شود و قابل بازگشت نیست.`
                : `«${delName}» حذف خواهد شد و این عمل قابل بازگشت نیست.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel className="rounded-full flex-1">انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void confirmDelete()}
              className="rounded-full flex-1 bg-rose-400 hover:bg-rose-500"
            >
              {deleting ? "در حال حذف…" : "حذف کن"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
