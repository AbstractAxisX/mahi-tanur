"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, PillBtn } from "../ui";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Home as HomeIcon, Briefcase, Building2, User, Phone, NotebookPen, ChevronLeft, Navigation, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

const TITLES = [
  { key: "خانه", icon: HomeIcon },
  { key: "محل کار", icon: Briefcase },
  { key: "ویلا", icon: Building2 },
  { key: "سایر", icon: MapPin },
];

export default function AddressFormView() {
  const { data, refresh } = useApp();
  const { params, go, back } = useMahiStore();
  const { toast } = useToast();

  const editing = data?.addresses?.find((a) => a.id === params.addressId) ?? null;
  const [title, setTitle] = useState(editing?.title ?? "خانه");
  const [full, setFull] = useState(editing?.full ?? "");
  const [receiver, setReceiver] = useState(editing?.receiver ?? data?.profile?.name ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? data?.profile?.phone ?? "");
  const [note, setNote] = useState("");
  const [isDefault, setIsDefault] = useState(editing?.isDefault ?? (data?.addresses ?? []).length === 0);

  const save = async () => {
    if (!full.trim()) return toast({ title: "متن آدرس را وارد کنید" });
    if (!receiver.trim()) return toast({ title: "نام گیرنده را وارد کنید" });
    const body = { title, full: full.trim(), receiver: receiver.trim(), phone: phone.trim(), isDefault };
    const res = editing
      ? await fetch(`/api/addresses/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      : await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return toast({ title: "ذخیره با خطا مواجه شد" });
    await refresh();
    toast({ title: editing ? "آدرس ویرایش شد ✅" : "آدرس جدید اضافه شد ✅" });
    if (params.backTo === "fish") go("fish", { fishId: params.fishId ?? "" });
    else go("addresses");
  };

  return (
    <div>
      <ScreenHeader title={editing ? "ویرایش آدرس" : "آدرس جدید"} action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><MapPin className="h-6 w-6 text-brand" aria-hidden /></span>} />

      {/* پیش‌نمایش نقشه */}
      <div className="my-card p-4">
        <div className="relative h-40 rounded-[18px] overflow-hidden shadow-inner">
          <Image src="/assets/map-thumb.png" alt="پیش‌نمایش موقعیت" fill className="object-cover" sizes="430px" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="h-12 w-12 rounded-full bg-brand grid place-items-center shadow-[0_8px_20px_rgba(236,64,122,.5)] border-4 border-white">
              <MapPin className="h-6 w-6 text-white" aria-hidden />
            </span>
          </span>
        </div>
        <p className="text-center text-[11px] text-teal-deep mt-2.5 font-bold flex items-center justify-center gap-1">
          <Navigation className="h-3.5 w-3.5" aria-hidden />
          موقعیت تقریبی — آدرس را دقیق بنویسید
        </p>
      </div>

      <div className="my-card p-4 mt-3 space-y-4">
        {/* عنوان */}
        <div>
          <span className="text-[12px] font-bold text-grey">عنوان آدرس</span>
          <div className="flex gap-2 mt-2">
            {TITLES.map((t) => {
              const Icon = t.icon;
              const on = title === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTitle(t.key)}
                  aria-pressed={on}
                  className={cn(
                    "flex-1 h-16 rounded-[16px] border-2 flex flex-col items-center justify-center gap-1 text-[11px] font-extrabold transition-all active:scale-95",
                    on ? "bg-brand border-brand text-white shadow-[0_6px_16px_rgba(236,64,122,.35)]" : "bg-white border-brand-soft text-ink"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  {t.key}
                </button>
              );
            })}
          </div>
        </div>

        {/* متن آدرس */}
        <label className="block">
          <span className="text-[12px] font-bold text-grey">متن کامل آدرس *</span>
          <textarea
            value={full}
            onChange={(e) => setFull(e.target.value)}
            rows={3}
            placeholder="مثلاً: اصفهان، خیابان سعیدی، نبش کوچه توفیق، زنگ ۴"
            className="mt-2 w-full rounded-2xl border-2 border-brand-soft bg-white p-3.5 text-[13px] font-bold text-ink outline-none focus:border-brand transition-colors resize-none placeholder:text-grey/70 placeholder:font-normal leading-6"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[12px] font-bold text-grey">گیرنده</span>
            <span className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-brand-soft bg-white h-12 px-3 focus-within:border-brand transition-colors">
              <User className="h-4 w-4 text-brand shrink-0" aria-hidden />
              <input
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink"
              />
            </span>
          </label>
          <label className="block">
            <span className="text-[12px] font-bold text-grey">شماره تماس</span>
            <span className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-brand-soft bg-white h-12 px-3 focus-within:border-brand transition-colors">
              <Phone className="h-4 w-4 text-brand shrink-0" aria-hidden />
              <input
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink text-left tabular-nums"
              />
            </span>
          </label>
        </div>

        <label className="block">
          <span className="text-[12px] font-bold text-grey">توضیحات (اختیاری)</span>
          <span className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-brand-soft bg-white h-12 px-3 focus-within:border-brand transition-colors">
            <NotebookPen className="h-4 w-4 text-brand shrink-0" aria-hidden />
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثلاً: زنگ تفریح، پلاک آبی"
              className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink placeholder:text-grey/70 placeholder:font-normal"
            />
          </span>
        </label>

        <div className="flex items-center justify-between rounded-2xl bg-brand-faint px-4 py-3.5">
          <span className="text-[13px] font-black text-ink flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand" aria-hidden />
            آدرس پیش‌فرض باشد؟
          </span>
          <Switch checked={isDefault} onCheckedChange={setIsDefault} aria-label="آدرس پیش‌فرض" />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <PillBtn tone="ghost" onClick={back} className="flex-1 h-13 py-3">
          انصراف
        </PillBtn>
        <button
          type="button"
          onClick={save}
          className="flex-[2] h-13 py-3 rounded-full bg-brand text-white text-[15px] font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(236,64,122,.4)] active:scale-[.98] transition-transform"
        >
          ذخیره آدرس
          <ChevronLeft className="h-5 w-5" strokeWidth={3} aria-hidden />
        </button>
      </div>
      <Waves className="h-4 w-full text-white/50 mt-6" aria-hidden />
    </div>
  );
}
