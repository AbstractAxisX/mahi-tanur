"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, CardTitle, FavHeart, PillBtn } from "../ui";
import { faPrice, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import {
  Fish as FishIcon, Minus, Plus, Check, Sun, Moon, MapPin, Truck, Home as HomeIcon,
  ShoppingBag, Send, User, Phone, NotebookPen, Zap, ChevronLeft, Map as MapIcon, Navigation, Pencil,
} from "lucide-react";

export default function FishDetailView() {
  const { data } = useApp();
  const { go, params, addToCart } = useMahiStore();
  const existingCartTotal = useMahiStore((s) => s.cart.reduce((sum, c) => sum + c.total, 0));
  const { toast } = useToast();

  const fish = useMemo(() => {
    const all = (data?.categories ?? []).flatMap((c) => c.fishes);
    return all.find((f) => f.id === params.fishId) ?? null;
  }, [data, params.fishId]);

  const extras = data?.extras ?? [];
  const timeSlots = data?.timeSlots ?? [];
  const methods = data?.deliveryMethods ?? [];
  const addresses = data?.addresses ?? [];
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  const [qty, setQty] = useState(1);
  const [selExtras, setSelExtras] = useState<string[]>([]);
  const [timeId, setTimeId] = useState<string | null>(null);
  const [methodCode, setMethodCode] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(defaultAddress?.id ?? null);
  const [receiver, setReceiver] = useState(data?.profile?.name ?? "");
  const [receiverPhone, setReceiverPhone] = useState(data?.profile?.phone ?? "");
  const [note, setNote] = useState("");
  const [addrSheet, setAddrSheet] = useState(false);

  if (!fish) {
    return (
      <div className="my-card p-8 text-center">
        <p className="text-grey font-bold">ماهی مورد نظر پیدا نشد.</p>
        <PillBtn className="mt-4 mx-auto" onClick={() => go("menu")}>بازگشت به منو</PillBtn>
      </div>
    );
  }

  const isFav = data?.favorites?.includes(fish.id);
  const chosenTime = timeSlots.find((t) => t.id === timeId) ?? null;
  const chosenMethod = methods.find((m) => m.code === methodCode) ?? null;
  const chosenAddress = addresses.find((a) => a.id === addressId) ?? null;

  const chosenExtras = extras.filter((e) => selExtras.includes(e.id));
  const extrasTotal = chosenExtras.reduce((s, e) => s + e.price, 0);
  const deliveryPrice = chosenMethod?.price ?? 0;
  const unitTotal = fish.price * qty + extrasTotal;
  const grand = unitTotal + deliveryPrice;
  const cartGrand = existingCartTotal + grand;

  const toggleExtra = (id: string) =>
    setSelExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const submit = () => {
    if (!chosenTime) return toast({ title: "زمان تحویل را انتخاب کنید", description: "یکی از دو بازهٔ ظهر یا عصر را انتخاب کنید." });
    if (!chosenMethod) return toast({ title: "روش دریافت کالا را انتخاب کنید" });
    if (!chosenAddress) return toast({ title: "آدرس تحویل را انتخاب کنید", description: "از کارت «محل تحویل» یک آدرس انتخاب کنید." });
    if (!receiver.trim()) return toast({ title: "نام گیرنده را وارد کنید" });
    const phone = receiverPhone.trim();
    if (!phone) return toast({ title: "شماره تماس گیرنده را وارد کنید" });

    const item: CartItem = {
      uid: `${fish.id}-${Date.now()}`,
      fishId: fish.id,
      fishName: fish.name,
      fishImage: fish.image,
      fishPrice: fish.price,
      description: fish.description,
      quantity: qty,
      extras: chosenExtras.map((e) => ({ id: e.id, name: e.name, image: e.image, price: e.price })),
      extrasTotal,
      timeSlot: chosenTime ? { id: chosenTime.id, label: chosenTime.label, shift: chosenTime.shift } : null,
      deliveryMethod: chosenMethod ? { id: chosenMethod.id, code: chosenMethod.code, title: chosenMethod.title, price: chosenMethod.price } : null,
      addressId: chosenAddress.id,
      addressFull: chosenAddress.full,
      addressLat: chosenAddress.lat ?? null,
      addressLng: chosenAddress.lng ?? null,
      receiver: receiver.trim(),
      receiverPhone: phone,
      note: note.trim(),
      unitTotal,
      total: grand,
    };
    addToCart(item);
    toast({ title: "به سبد خرید اضافه شد 🐟", description: `${fish.name} × ${toFaDigits(qty)} — ${faPrice(grand)}` });
    go("cart");
  };

  return (
    <div className="pb-2">
      <ScreenHeader title={fish.name} action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><FishIcon className="h-6 w-6 text-brand" aria-hidden /></span>} />

      <div className="space-y-3.5">
        {/* ───── کارت محصول (عکس ۱۶:۹ + نام + توضیحات — عمودی و خوانا) ───── */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="my-card p-3.5">
          {/* عکس تمام‌عرض ۱۶:۹ با گوشه گرد */}
          <div className="relative w-full aspect-video rounded-[16px] overflow-hidden shadow-[0_6px_18px_rgba(88,24,69,.22)] bg-brand-faint">
            <Image src={fish.image} alt={fish.name} fill unoptimized className="object-cover" sizes="448px" />
            <FavHeart
              filled={!!isFav}
              className="absolute top-2 left-2"
              onClick={async () => {
                await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fishId: fish.id }) });
                window.dispatchEvent(new CustomEvent("mahi:refresh"));
                toast({ title: isFav ? "از علاقه‌مندی‌ها حذف شد" : "به علاقه‌مندی‌ها اضافه شد ❤️" });
              }}
            />
          </div>
          {/* نام + قیمت در یک ردیف */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-8 w-8 shrink-0 rounded-full bg-brand-mist grid place-items-center">
                <FishIcon className="h-[18px] w-[18px] text-brand" aria-hidden />
              </span>
              <h2 className="text-[19px] font-black text-brand leading-7 truncate">{fish.name}</h2>
            </div>
            <span className="shrink-0 rounded-full bg-brand-mist px-3 py-1 text-[12px] font-extrabold text-brand-deep tabular-nums">
              {faPrice(fish.price)} <span className="font-bold">/ هر عدد</span>
            </span>
          </div>
          {/* توضیحات */}
          <p className="text-[12.5px] text-body leading-[20px] mt-2.5">{fish.description}</p>
        </motion.section>

        {/* ───── تعداد ماهی ───── */}
        <section aria-label="تعداد ماهی" className="my-card p-4">
          <CardTitle
            icon={<FishIcon className="h-5 w-5" aria-hidden />}
            title="تعداد ماهی"
            sub="تعیین تعداد ماهی مورد نظر برای این سفارش"
          />
          <div className="mt-4 flex items-center justify-center gap-5 relative">
            <Zap className="absolute right-2 h-5 w-5 text-brand-soft" aria-hidden />
            <Zap className="absolute left-2 h-5 w-5 text-brand-soft" aria-hidden />
            <button
              type="button"
              aria-label="افزایش"
              onClick={() => setQty((q) => Math.min(9, q + 1))}
              className="h-12 w-12 rounded-full bg-brand text-white grid place-items-center shadow-[0_6px_16px_rgba(236,64,122,.4)] active:scale-90 transition-transform"
            >
              <Plus className="h-6 w-6" strokeWidth={3} />
            </button>
            <div className="min-w-24 text-center">
              <span className="text-[20px] font-black text-ink tabular-nums leading-7">{toFaDigits(qty)}</span>
              <span className="text-[12px] font-bold text-grey"> عدد</span>
            </div>
            <button
              type="button"
              aria-label="کاهش"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-12 w-12 rounded-full bg-brand text-white grid place-items-center shadow-[0_6px_16px_rgba(236,64,122,.4)] active:scale-90 transition-transform"
            >
              <Minus className="h-6 w-6" strokeWidth={3} />
            </button>
          </div>
        </section>

        {/* ───── حَشو (اختیاری) ───── */}
        <section aria-label="حَشو" className="my-card p-4">
          <CardTitle
            icon={<span aria-hidden>🥗</span>}
            title="حَشو (اختیاری)"
            sub="در صورت تمایل گزینه‌های زیر را به همراه ماهی اصلی انتخاب کنید."
            subCls="text-teal-deep"
          />
          <div className="mt-4 flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {extras.map((e) => {
              const on = selExtras.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-label={`${e.name} — ${faPrice(e.price)}`}
                  onClick={() => toggleExtra(e.id)}
                  className={cn(
                    "shrink-0 w-[86px] rounded-[16px] p-2 text-center border-2 transition-all active:scale-95 relative",
                    on ? "bg-brand-mist border-brand" : "bg-white border-brand-soft"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1.5 left-1.5 h-5 w-5 rounded-full grid place-items-center border-2",
                      on ? "bg-brand border-brand text-white" : "bg-white border-grey/40 text-transparent"
                    )}
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                  </span>
                  <span className="block mt-1.5 w-full aspect-square rounded-[12px] overflow-hidden">
                    <Image src={e.image} alt={e.name} width={70} height={70} unoptimized className="h-full w-full object-cover" />
                  </span>
                  <span className="block text-[12px] font-extrabold text-ink leading-5 mt-1.5">{e.name}</span>
                  <span className="block text-[11px] font-bold text-brand tabular-nums leading-4">{faPrice(e.price)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ───── انتخاب زمان ───── */}
        <section aria-label="انتخاب زمان" className="my-card p-4">
          <CardTitle
            icon={<Sun className="h-5 w-5" aria-hidden />}
            title="انتخاب زمان"
            sub="ساعت مورد نظر خود را انتخاب کنید."
          />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {timeSlots.map((t) => {
              const on = timeId === t.id;
              const Icon = t.icon === "moon" ? Moon : Sun;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setTimeId(t.id)}
                  className={cn(
                    "rounded-[16px] border-2 p-3 flex flex-col items-center gap-1 transition-all active:scale-95",
                    on ? "border-brand bg-white" : "border-teal-mist bg-white"
                  )}
                >
                  <Icon className={cn("h-7 w-7", on ? "text-brand" : "text-teal-brand")} strokeWidth={2.2} aria-hidden />
                  <span className={cn("text-[14px] font-extrabold tabular-nums leading-6", on ? "text-brand" : "text-teal-deep")}>{t.label}</span>
                  <span className={cn("text-[11px] font-bold", on ? "text-brand" : "text-teal-deep")}>
                    {t.shift}
                    {on && <Check className="inline h-4 w-4 mr-1" strokeWidth={3} aria-hidden />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ───── محل تحویل ───── */}
        <section aria-label="محل تحویل" className="my-card p-4">
          <CardTitle
            icon={<MapPin className="h-5 w-5" aria-hidden />}
            title="محل تحویل"
            sub="سفارش در آدرس زیر ثبت می‌شود."
            subCls="text-teal-deep"
          />
          <button
            type="button"
            onClick={() => setAddrSheet(true)}
            className="mt-4 w-full flex items-center gap-3 bg-[#f5f5f5] rounded-[25px] p-2.5 text-right active:scale-[.99] transition-transform"
            aria-label="تغییر آدرس تحویل"
          >
            <span className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 border-2 border-white shadow-sm">
              <Image src="/assets/map-thumb.png" alt="نقشه" width={48} height={48} className="h-full w-full object-cover" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[10px] text-grey">{chosenAddress ? chosenAddress.title : "آدرسی انتخاب نشده"}</span>
              <span className="block text-[12px] font-bold text-ink leading-[17px] line-clamp-2">
                {chosenAddress ? chosenAddress.full : "برای انتخاب آدرس ضربه بزنید"}
              </span>
            </span>
            {chosenAddress?.lat != null && chosenAddress?.lng != null && (
              <span className="shrink-0 inline-flex items-center gap-1 h-9 px-3 rounded-full bg-teal-mist text-teal-deep text-[11px] font-black" title="این آدرس لوکیشن نقشه دارد">
                <MapPin className="h-4 w-4" fill="currentColor" aria-hidden />
                نقشه
              </span>
            )}
            <span className="shrink-0 inline-flex items-center gap-1 h-9 px-4 rounded-full bg-brand text-white text-[12px] font-bold">
              <MapIcon className="h-4 w-4" aria-hidden />
              تغییر
            </span>
          </button>
        </section>

        {/* ───── دریافت کالا ───── */}
        <section aria-label="روش دریافت کالا" className="my-card p-4">
          <CardTitle
            icon={<Truck className="h-5 w-5" aria-hidden />}
            title="دریافت کالا"
            sub="مرحلهٔ نهایی ارسال؛ بسته و هزینه را انتخاب کنید."
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {methods.map((m) => {
              const on = methodCode === m.code;
              const Icon = m.icon === "home" ? HomeIcon : m.icon === "scooter" ? Navigation : Truck;
              return (
                <button
                  key={m.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setMethodCode(m.code)}
                  className={cn(
                    "rounded-[16px] border-2 p-2.5 flex flex-col items-center gap-1 transition-all active:scale-95",
                    on ? "bg-teal-brand border-teal-brand text-white shadow-[0_8px_18px_rgba(0,188,212,.4)]" : "bg-white border-brand-soft text-ink"
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
                  <span className="text-[12px] font-extrabold leading-4">{m.title}</span>
                  <span className={cn("text-[10px] leading-3", on ? "text-white/85" : "text-grey")}>{m.subtitle}</span>
                  <span className={cn("text-[12px] font-black tabular-nums", on ? "text-white" : "text-brand")}>
                    {m.price > 0 ? `+ ${faPrice(m.price)}` : "رایگان"}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ───── اطلاعات گیرنده ───── */}
        <section aria-label="اطلاعات گیرنده" className="my-card p-4">
          <CardTitle
            icon={<User className="h-5 w-5" aria-hidden />}
            title="اطلاعات گیرنده"
            sub="نام گیرندهٔ سفارش و شماره تماس، جهت هماهنگی با شما نیاز است."
            subCls="text-teal-deep"
          />
          <div className="mt-4 space-y-2.5">
            <label className="flex items-center gap-2 bg-white border-2 border-brand-soft rounded-2xl h-12 px-3 focus-within:border-brand transition-colors">
              <User className="h-5 w-5 text-brand shrink-0" aria-hidden />
              <input
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                placeholder="نام و نام خانوادگی *"
                className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink placeholder:text-grey/70 placeholder:font-normal"
              />
            </label>
            <label className="flex items-center gap-2 bg-white border-2 border-brand-soft rounded-2xl h-12 px-3 focus-within:border-brand transition-colors">
              <Phone className="h-5 w-5 text-brand shrink-0" aria-hidden />
              <input
                dir="ltr"
                inputMode="tel"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                placeholder="شماره تماس *"
                className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink text-left placeholder:text-grey/70 placeholder:font-normal placeholder:text-right"
              />
            </label>
            <label className="flex items-center gap-2 bg-white border-2 border-brand-soft rounded-2xl h-12 px-3 focus-within:border-brand transition-colors">
              <NotebookPen className="h-5 w-5 text-brand shrink-0" aria-hidden />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="توضیحات (اختیاری)"
                className="flex-1 bg-transparent outline-none text-[13px] font-bold text-ink placeholder:text-grey/70 placeholder:font-normal"
              />
            </label>
          </div>
        </section>
      </div>

      {/* ───── نوار چسبان جمع کل ───── */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-4 rounded-t-[26px] bg-brand shadow-[0_-8px_24px_rgba(236,64,122,.4)] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-white text-[15px] font-extrabold">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            جمع کل سبد
          </span>
          <span className="text-left">
            <span className="block text-[19px] font-black text-white tabular-nums leading-6">{faPrice(cartGrand)}</span>
            <span className="block text-[9.5px] text-white/80 leading-3 mt-0.5">
              (ماهی {toFaDigits(qty)} عدد + حَشو + هزینه ارسال)
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={submit}
          className="mt-3 w-full h-14 rounded-full bg-teal-brand text-white text-[16px] font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,172,193,.45)] active:scale-[.98] transition-transform"
        >
          <Send className="h-5 w-5 -scale-x-100" aria-hidden />
          ثبت سفارش نهایی
          <ChevronLeft className="h-5 w-5" strokeWidth={3} aria-hidden />
        </button>
      </div>

      {/* ───── شیت انتخاب آدرس ───── */}
      <Sheet open={addrSheet} onOpenChange={setAddrSheet}>
        <SheetContent side="bottom" className="rounded-t-[26px] max-h-[75vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>انتخاب آدرس تحویل</SheetTitle>
            <SheetDescription>آدرس مقصد سفارش را انتخاب کنید</SheetDescription>
          </SheetHeader>
          <div className="p-5 pb-3">
            <h3 className="text-center text-[16px] font-black text-ink">انتخاب آدرس تحویل</h3>
            <p className="text-center text-[11px] text-teal-deep mt-1">آدرس مقصد سفارش را انتخاب کنید</p>
          </div>
          <div className="px-4 pb-4 space-y-2 overflow-y-auto max-h-[52vh]">
            {addresses.map((a) => {
              const on = addressId === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => { setAddressId(a.id); setAddrSheet(false); toast({ title: `آدرس «${a.title}» انتخاب شد` }); }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-[18px] border-2 p-3 text-right transition-all active:scale-[.99]",
                    on ? "border-brand bg-brand-faint" : "border-brand-soft bg-white"
                  )}
                >
                  <span className={cn("h-11 w-11 rounded-full grid place-items-center shrink-0", on ? "bg-brand text-white" : "bg-brand-mist text-brand")}>
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[14px] font-extrabold text-ink">{a.title}</span>
                      {a.isDefault && <span className="text-[9px] rounded-full bg-teal-brand text-white px-2 py-0.5 font-bold">پیش‌فرض</span>}
                      {a.lat != null && a.lng != null && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] rounded-full bg-teal-mist text-teal-deep px-2 py-0.5 font-bold">
                          <MapPin className="h-2.5 w-2.5" fill="currentColor" aria-hidden /> لوکیشن
                        </span>
                      )}
                    </span>
                    <span className="block text-[11.5px] text-grey leading-[16px] mt-0.5 line-clamp-2">{a.full}</span>
                    {a.receiver && <span className="block text-[10px] text-teal-deep mt-0.5">{a.receiver} · {toFaDigits(a.phone || "")}</span>}
                  </span>
                  {on && <Check className="h-5 w-5 text-brand shrink-0" strokeWidth={3} aria-hidden />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => { setAddrSheet(false); go("address-form", { backTo: "fish", fishId: fish.id }); }}
              className="w-full flex items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-brand-mid p-3.5 text-brand font-extrabold text-[13px] active:scale-[.99] transition-transform"
            >
              <Pencil className="h-4 w-4" aria-hidden />
              افزودن آدرس جدید
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
