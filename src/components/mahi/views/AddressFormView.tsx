"use client";

import { useState } from "react";
import Image from "next/image";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, PillBtn } from "../ui";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Home as HomeIcon, Briefcase, Building2, User, Phone, NotebookPen, ChevronLeft, Navigation, Crosshair, Trash2, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";
import { parseCoordText, osmEmbedUrl } from "@/lib/geo";

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

  /* ─── موقعیت مکانی روی نقشه ─── */
  const [latText, setLatText] = useState(editing?.lat != null ? String(editing.lat) : "");
  const [lngText, setLngText] = useState(editing?.lng != null ? String(editing.lng) : "");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

  const lat = parseCoordText(latText, -90, 90);
  const lng = parseCoordText(lngText, -180, 180);
  const hasLoc = lat != null && lng != null;

  /** دریافت موقعیت فعلی از GPS مرورگر (نیاز به اجازهٔ دسترسی مکان) */
  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocError("مرورگر شما از دریافت موقعیت پشتیبانی نمی‌کند — مختصات را دستی وارد کنید.");
      setManualOpen(true);
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatText(pos.coords.latitude.toFixed(6));
        setLngText(pos.coords.longitude.toFixed(6));
        setAccuracy(Math.round(pos.coords.accuracy));
        setLocating(false);
        toast({ title: "موقعیت مکانی دریافت شد 📍", description: "موقعیت دقیق شما روی نقشه ثبت شد." });
      },
      (err) => {
        setLocating(false);
        setManualOpen(true);
        if (err.code === 1) {
          setLocError("دسترسی به موقعیت رد شد — از تنظیمات مرورگر اجازهٔ دسترسی به «مکان» را بدهید و دوباره تلاش کنید.");
        } else if (err.code === 2) {
          setLocError("موقعیت در دسترس نیست — لوکیشن گوشی را روشن کنید یا مختصات را دستی وارد کنید.");
        } else if (err.code === 3) {
          setLocError("دریافت موقعیت طول کشید — دوباره تلاش کنید یا مختصات را دستی وارد کنید.");
        } else {
          setLocError("دریافت موقعیت با خطا مواجه شد.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const clearLoc = () => {
    setLatText("");
    setLngText("");
    setAccuracy(null);
    setLocError(null);
  };

  const save = async () => {
    if (!full.trim()) return toast({ title: "متن آدرس را وارد کنید" });
    if (!receiver.trim()) return toast({ title: "نام گیرنده را وارد کنید" });
    const body = {
      title,
      full: full.trim(),
      receiver: receiver.trim(),
      phone: phone.trim(),
      isDefault,
      lat: hasLoc && lat != null ? lat : null,
      lng: hasLoc && lng != null ? lng : null,
    };
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

      {/* ───── موقعیت روی نقشه (GPS مرورگر) ───── */}
      <div className="my-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-black text-ink flex items-center gap-1.5">
            <MapPin className="h-[18px] w-[18px] text-brand" fill="currentColor" aria-hidden />
            موقعیت روی نقشه
          </span>
          {hasLoc ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-mist text-teal-deep text-[10px] font-black px-2.5 py-1">
              <Navigation className="h-3 w-3" aria-hidden />
              لوکیشن ثبت شد
            </span>
          ) : (
            <span className="rounded-full bg-brand-faint text-grey text-[10px] font-bold px-2.5 py-1">اختیاری</span>
          )}
        </div>

        {/* نقشه: امبد واقعی اگر لوکیشن هست، در غیر این صورت حالت خالی */}
        {hasLoc && lat != null && lng != null ? (
          <div className="relative h-48 rounded-[16px] overflow-hidden border-2 border-brand-soft bg-white">
            <iframe
              src={osmEmbedUrl(lat, lng)}
              title="موقعیت شما روی نقشه"
              className="h-full w-full border-0"
              loading="lazy"
            />
            <span className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center">
              <span dir="ltr" className="rounded-full bg-white/95 shadow px-3 py-1 text-[10.5px] font-black text-ink tabular-nums">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
            </span>
          </div>
        ) : (
          <div className="relative h-40 rounded-[16px] overflow-hidden shadow-inner">
            <Image src="/assets/map-thumb.png" alt="پیش‌نمایش نقشه" fill className="object-cover" sizes="430px" />
            <span className="absolute inset-0 bg-brand-deep/20" aria-hidden />
            <span className="absolute inset-0 grid place-items-center">
              <span className="text-center">
                <span className="mx-auto mb-2 h-12 w-12 rounded-full bg-brand grid place-items-center shadow-[0_8px_20px_rgba(236,64,122,.5)] border-4 border-white">
                  <MapPin className="h-6 w-6 text-white" aria-hidden />
                </span>
                <span className="block text-[11px] font-black text-white drop-shadow-[0_2px_4px_rgba(88,24,69,.8)]">
                  موقعیت خود را روی نقشه ثبت کنید
                </span>
              </span>
            </span>
          </div>
        )}

        {/* دکمهٔ GPS */}
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className={cn(
            "mt-3 w-full h-12 rounded-full text-white text-[13.5px] font-black flex items-center justify-center gap-2 active:scale-[.98] transition-transform disabled:opacity-70",
            hasLoc ? "bg-teal-deep shadow-[0_6px_16px_rgba(0,137,154,.4)]" : "bg-teal-brand shadow-[0_6px_16px_rgba(0,172,193,.4)]"
          )}
        >
          {locating ? (
            <>
              <span className="h-5 w-5 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
              در حال دریافت موقعیت…
            </>
          ) : (
            <>
              <Crosshair className="h-5 w-5" aria-hidden />
              {hasLoc ? "به‌روزرسانی موقعیت فعلی" : "دریافت موقعیت فعلی (GPS)"}
            </>
          )}
        </button>

        {/* خطا */}
        {locError && (
          <p className="mt-2 text-[11px] text-rose-500 font-bold leading-[17px] bg-rose-50 rounded-xl px-3 py-2" role="alert">
            {locError}
          </p>
        )}

        {/* دقت + حذف */}
        {hasLoc && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10.5px] text-grey font-bold">
              {accuracy != null ? `دقت موقعیت: ~${toFaDigits(accuracy)} متر` : "مختصات دستی وارد شده"}
            </span>
            <button
              type="button"
              onClick={clearLoc}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-rose-50 text-rose-400 text-[10.5px] font-black active:scale-95 transition-transform"
              aria-label="حذف لوکیشن"
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              حذف لوکیشن
            </button>
          </div>
        )}

        {/* ورود دستی مختصات */}
        <button
          type="button"
          onClick={() => setManualOpen((v) => !v)}
          aria-expanded={manualOpen}
          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-teal-deep active:scale-95 transition-transform"
        >
          <Keyboard className="h-3.5 w-3.5" aria-hidden />
          {manualOpen ? "بستن ورود دستی" : "ورود دستی مختصات"}
        </button>
        {manualOpen && (
          <div className="grid grid-cols-2 gap-3 mt-2">
            <label className="block">
              <span className="text-[11px] font-bold text-grey">عرض جغرافیایی (Lat)</span>
              <input
                dir="ltr"
                inputMode="decimal"
                value={latText}
                onChange={(e) => { setLatText(e.target.value); setAccuracy(null); }}
                placeholder="32.653900"
                className="mt-1.5 w-full h-11 rounded-2xl border-2 border-brand-soft bg-white px-3 text-[13px] font-bold text-ink text-left tabular-nums outline-none focus:border-brand transition-colors placeholder:text-grey/50"
              />
            </label>
            <label className="block">
              <span className="text-[11px] font-bold text-grey">طول جغرافیایی (Lng)</span>
              <input
                dir="ltr"
                inputMode="decimal"
                value={lngText}
                onChange={(e) => { setLngText(e.target.value); setAccuracy(null); }}
                placeholder="51.666020"
                className="mt-1.5 w-full h-11 rounded-2xl border-2 border-brand-soft bg-white px-3 text-[13px] font-bold text-ink text-left tabular-nums outline-none focus:border-brand transition-colors placeholder:text-grey/50"
              />
            </label>
            {(latText.trim() || lngText.trim()) && !hasLoc && (
              <p className="col-span-2 text-[10.5px] text-rose-500 font-bold">هر دو مقدار باید عدد معتبر باشند (مثلاً 32.6539 و 51.666)</p>
            )}
          </div>
        )}
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
    </div>
  );
}
