"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, PillBtn } from "../ui";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Home as HomeIcon, Briefcase, Building2, User, Phone, ChevronLeft, Navigation, Crosshair, Trash2, Keyboard, MapPinned } from "lucide-react";
import { cn } from "@/lib/utils";
import { toFaDigits } from "@/lib/format";
import { parseCoordText } from "@/lib/geo";
import { IRAN_PROVINCES, DEFAULT_PROVINCE, DEFAULT_CITY, provinceByName, cityOf } from "@/lib/iran-geo";
import type { FlyTarget } from "../MapPicker";

/* نقشه Leaflet فقط سمت کلاینت (دینامیک، بدون SSR) */
const MapPicker = dynamic(() => import("../MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-60 rounded-[16px] border-2 border-brand-soft bg-brand-faint grid place-items-center">
      <span className="text-[12px] font-black text-grey">در حال بارگذاری نقشه…</span>
    </div>
  ),
});

const TITLES = [
  { key: "خانه", icon: HomeIcon },
  { key: "محل کار", icon: Briefcase },
  { key: "ویلا", icon: Building2 },
  { key: "سایر", icon: MapPin },
];

export default function AddressFormView() {
  const { data, refresh } = useApp();
  const { params, go, back } = useMahiStore();
  const authUser = useMahiStore((s) => s.authUser);
  const { toast } = useToast();

  const editing = data?.addresses?.find((a) => a.id === params.addressId) ?? null;
  const [title, setTitle] = useState(editing?.title ?? "خانه");
  const [full, setFull] = useState(editing?.full ?? "");
  const [receiver, setReceiver] = useState(editing?.receiver ?? authUser?.name ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? authUser?.phone ?? "");
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

  /* ─── استان / شهر + پرواز نقشه ─── */
  const [province, setProvince] = useState(DEFAULT_PROVINCE);
  const [city, setCity] = useState(DEFAULT_CITY);
  const [flyTarget, setFlyTarget] = useState<FlyTarget>(null);
  const [flyNonce, setFlyNonce] = useState(0);
  const fly = (lt: number, ln: number, zoom: number) => {
    setFlyNonce((n) => n + 1);
    setFlyTarget({ lat: lt, lng: ln, zoom, nonce: flyNonce + 1 });
  };

  /* مرکز اولیه نقشه: موقعیت آدرس در حال ویرایش، وگرنه شهر پیش‌فرض */
  const defaultCity = cityOf(DEFAULT_PROVINCE, DEFAULT_CITY);
  const initialCenter: [number, number] =
    editing?.lat != null && editing?.lng != null
      ? [editing.lat, editing.lng]
      : defaultCity
        ? [defaultCity.lat, defaultCity.lng]
        : [32.6539, 51.666];
  const initialZoom = editing?.lat != null ? 14 : 11;

  const onProvinceChange = (v: string) => {
    setProvince(v);
    setCity("");
    const p = provinceByName(v);
    if (p) fly(p.center.lat, p.center.lng, 9);
  };

  const onCityChange = (v: string) => {
    setCity(v);
    const ct = cityOf(province, v);
    if (ct) fly(ct.lat, ct.lng, 13);
  };

  /** لمس/کلیک روی نقشه یا جابه‌جایی پین */
  const onPick = (la: number, ln: number) => {
    setLatText(la.toFixed(6));
    setLngText(ln.toFixed(6));
    setAccuracy(null);
    setLocError(null);
  };

  /** دریافت موقعیت فعلی از GPS مرورگر (نیاز به اجازهٔ دسترسی مکان) */
  const locate = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setLocError("مرورگر شما از دریافت موقعیت پشتیبانی نمی‌کند — موقعیت را از روی نقشه انتخاب کنید.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude;
        const ln = pos.coords.longitude;
        setLatText(la.toFixed(6));
        setLngText(ln.toFixed(6));
        setAccuracy(Math.round(pos.coords.accuracy));
        setLocating(false);
        fly(la, ln, 16);
        toast({ title: "موقعیت مکانی دریافت شد 📍", description: "موقعیت دقیق شما روی نقشه ثبت شد." });
      },
      (err) => {
        setLocating(false);
        if (err.code === 1) {
          setLocError("دسترسی به موقعیت رد شد — از تنظیمات مرورگر اجازهٔ دسترسی به «مکان» را بدهید و دوباره تلاش کنید. یا شهر خود را انتخاب کنید و پین را روی نقشه بگذارید.");
        } else if (err.code === 2) {
          setLocError("موقعیت در دسترس نیست — لوکیشن گوشی را روشن کنید؛ یا شهر خود را انتخاب کنید و پین را روی نقشه بگذارید.");
        } else if (err.code === 3) {
          setLocError("دریافت موقعیت طول کشید — دوباره تلاش کنید؛ یا شهر خود را انتخاب کنید و پین را روی نقشه بگذارید.");
        } else {
          setLocError("دریافت موقعیت با خطا مواجه شد — پین را دستی روی نقشه بگذارید.");
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

      {/* ───── موقعیت روی نقشه (تعاملی — همیشه باز) ───── */}
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

        {/* انتخاب استان و شهر */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-[11px] font-bold text-grey flex items-center gap-1">
              <MapPinned className="h-3.5 w-3.5 text-brand" aria-hidden />
              استان
            </span>
            <Select value={province} onValueChange={onProvinceChange} dir="rtl">
              <SelectTrigger className="mt-1.5 h-11 w-full rounded-2xl border-2 border-brand-soft bg-white text-[13px] font-bold" aria-label="انتخاب استان">
                <SelectValue placeholder="انتخاب استان" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl max-h-64">
                {IRAN_PROVINCES.map((p) => (
                  <SelectItem key={p.name} value={p.name} className="text-[13px]">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <span className="text-[11px] font-bold text-grey">شهر</span>
            <Select value={city} onValueChange={onCityChange} dir="rtl">
              <SelectTrigger className="mt-1.5 h-11 w-full rounded-2xl border-2 border-brand-soft bg-white text-[13px] font-bold" aria-label="انتخاب شهر">
                <SelectValue placeholder="اول استان را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl max-h-64">
                {(provinceByName(province)?.cities ?? []).map((ct) => (
                  <SelectItem key={ct.name} value={ct.name} className="text-[13px]">
                    {ct.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="mb-3 text-[10.5px] text-grey font-bold leading-4">
          استان و شهرت را انتخاب کن تا نقشه اونجا بره؛ بعد پین دقیق آدرس را با لمس نقشه ثبت کن.
        </p>

        {/* نقشه تعاملی */}
        <MapPicker
          lat={lat}
          lng={lng}
          onPick={onPick}
          center={initialCenter}
          zoom={initialZoom}
          flyTarget={flyTarget}
          height={240}
        />

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
              {accuracy != null ? `دقت موقعیت: ~${toFaDigits(accuracy)} متر` : "موقعیت روی نقشه ثبت شد"}
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
                className="flex-1 min-w-0 w-0 bg-transparent outline-none text-[13px] font-bold text-ink"
              />
            </span>
          </label>
          <label className="block">
            <span className="text-[12px] font-bold text-grey">شماره تماس</span>
            <span className="mt-2 flex items-center gap-2 rounded-2xl border-2 border-brand-soft bg-white h-12 px-3 focus-within:border-brand transition-colors">
              <Phone className="h-4 w-4 text-brand shrink-0" aria-hidden />
              <input
                dir="ltr"
                inputMode="tel"
                maxLength={20}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 min-w-0 w-0 bg-transparent outline-none text-[13px] font-bold text-ink text-left tabular-nums"
              />
            </span>
          </label>
        </div>

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
