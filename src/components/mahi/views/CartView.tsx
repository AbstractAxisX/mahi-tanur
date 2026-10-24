"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, PillBtn } from "../ui";
import { faPrice, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  ShoppingBasket, Trash2, Sun, Moon, Truck, MapPin, Minus, Plus,
  ShoppingBag, Send, ChevronLeft, Fish as FishIcon, ReceiptText,
} from "lucide-react";

export default function CartView() {
  const { data } = useApp();
  const { cart, removeFromCart, updateCartItem, clearCart, go } = useMahiStore();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const itemsTotal = useMemo(() => cart.reduce((s, c) => s + c.unitTotal, 0), [cart]);
  const deliveryTotal = useMemo(() => cart.reduce((s, c) => s + (c.deliveryMethod?.price ?? 0), 0), [cart]);
  const grand = itemsTotal + deliveryTotal;

  if (cart.length === 0) {
    return (
      <div>
        <ScreenHeader title="سبد خرید" action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><ShoppingBasket className="h-6 w-6 text-brand" aria-hidden /></span>} />
        <div className="my-card p-10 text-center mt-4">
          <FishIcon className="mx-auto h-16 w-16 text-brand-soft" aria-hidden />
          <p className="mt-3 text-[16px] font-black text-ink">سبد خرید شما خالی است!</p>
          <p className="mt-1 text-[12px] text-grey leading-5">از منوی ماهی‌ها، یک ماهی تازه انتخاب کن و اینجا برگرده 🐟</p>
          <PillBtn className="mt-5 mx-auto" onClick={() => go("menu")}>
            رفتن به منو
            <ChevronLeft className="h-4 w-4" strokeWidth={3} aria-hidden />
          </PillBtn>
        </div>
      </div>
    );
  }

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = cart.map((c) => ({
        fishId: c.fishId,
        fishName: c.fishName,
        fishImage: c.fishImage,
        fishPrice: c.fishPrice,
        quantity: c.quantity,
        extras: c.extras.map((e) => ({ name: e.name, price: e.price })),
        deliveryMethodTitle: c.deliveryMethod?.title ?? "",
        deliveryPrice: c.deliveryMethod?.price ?? 0,
        timeSlotLabel: c.timeSlot?.label ?? "",
        timeSlotShift: c.timeSlot?.shift ?? "",
        addressFull: c.addressFull,
        receiver: c.receiver,
        receiverPhone: c.receiverPhone,
        note: c.note || null,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      const created = (await res.json()) as Order[];
      clearCart();
      window.dispatchEvent(new CustomEvent("mahi:refresh"));
      go("success", { orders: JSON.stringify(created) });
    } catch {
      toast({ title: "ثبت سفارش با خطا مواجه شد", description: "لطفاً دوباره تلاش کنید." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-2">
      <ScreenHeader title="سبد خرید" action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><ShoppingBasket className="h-6 w-6 text-brand" aria-hidden /></span>} />

      <div className="space-y-3.5">
        {cart.map((c, idx) => (
          <motion.section
            key={c.uid}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.05, 0.25) }}
            className="my-card p-3.5"
            aria-label={`آیتم ${c.fishName}`}
          >
            <div className="flex gap-3">
              <span className="relative w-24 h-24 shrink-0 rounded-[18px] overflow-hidden shadow-[0_4px_14px_rgba(88,24,69,.2)]">
                <Image src={c.fishImage} alt={c.fishName} fill unoptimized className="object-cover" sizes="96px" />
                <span className="absolute bottom-1 left-1 rounded-full bg-brand text-white text-[10px] font-black px-2 py-0.5 tabular-nums">
                  ×{toFaDigits(c.quantity)}
                </span>
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[15px] font-black text-ink leading-6">{c.fishName}</h2>
                  <button
                    type="button"
                    onClick={() => { removeFromCart(c.uid); toast({ title: "از سبد حذف شد" }); }}
                    aria-label="حذف آیتم"
                    className="h-9 w-9 rounded-full bg-rose-50 text-rose-400 grid place-items-center active:scale-90 transition-transform shrink-0"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <p className="text-[11.5px] text-grey leading-[17px] mt-1 line-clamp-2">{c.description}</p>
                {c.extras.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.extras.map((e) => (
                      <span key={e.id} className="inline-flex items-center gap-1 rounded-full bg-brand-mist text-brand-deep text-[10.5px] font-bold px-2.5 py-1">
                        🥗 {e.name} · {faPrice(e.price, false)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[10.5px]">
              <span className="flex items-center gap-1.5 rounded-xl bg-brand-faint px-2.5 py-2 font-bold text-ink">
                {c.timeSlot?.shift === "عصر" ? <Moon className="h-4 w-4 text-teal-deep shrink-0" aria-hidden /> : <Sun className="h-4 w-4 text-teal-deep shrink-0" aria-hidden />}
                <span className="min-w-0">
                  <span className="block text-[9px] text-grey leading-3">زمان</span>
                  <span className="block tabular-nums leading-4">{c.timeSlot?.label}</span>
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-brand-faint px-2.5 py-2 font-bold text-ink">
                <Truck className="h-4 w-4 text-brand shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[9px] text-grey leading-3">ارسال</span>
                  <span className="block leading-4">{c.deliveryMethod?.title}</span>
                </span>
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-brand-faint px-2.5 py-2 font-bold text-ink">
                <MapPin className="h-4 w-4 text-brand shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-[9px] text-grey leading-3">آدرس</span>
                  <span className="block leading-4 truncate">{c.addressFull.slice(0, 18)}…</span>
                </span>
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 pt-2.5 border-t border-dashed border-brand-soft">
              {/* کنترل تعداد */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="کاهش"
                  onClick={() => c.quantity > 1 && updateCartItem(c.uid, { quantity: c.quantity - 1 })}
                  className="h-9 w-9 rounded-full bg-white border-2 border-brand text-brand grid place-items-center active:scale-90 transition-transform"
                >
                  <Minus className="h-4 w-4" strokeWidth={3} />
                </button>
                <span className="text-[15px] font-black text-ink tabular-nums w-6 text-center">{toFaDigits(c.quantity)}</span>
                <button
                  type="button"
                  aria-label="افزایش"
                  onClick={() => updateCartItem(c.uid, { quantity: c.quantity + 1 })}
                  className="h-9 w-9 rounded-full bg-white border-2 border-brand text-brand grid place-items-center active:scale-90 transition-transform"
                >
                  <Plus className="h-4 w-4" strokeWidth={3} />
                </button>
              </div>
              <div className="text-left">
                {c.deliveryMethod && c.deliveryMethod.price > 0 && (
                  <p className="text-[10px] text-grey leading-4">+ ارسال: {faPrice(c.deliveryMethod.price)}</p>
                )}
                <p className="text-[16px] font-black text-brand tabular-nums leading-6">{faPrice(c.total)}</p>
              </div>
            </div>
          </motion.section>
        ))}

        {/* ───── خلاصه factura ───── */}
        <section aria-label="خلاصه سفارش" className="my-card p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="h-10 w-10 rounded-full bg-brand-mist grid place-items-center text-brand">
              <ReceiptText className="h-5 w-5" aria-hidden />
            </span>
            <h2 className="text-[16px] font-extrabold text-brand-deep">جمع کل سفارش</h2>
          </div>
          <dl className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-grey font-bold">ماهی‌ها و حَشوها</dt>
              <dd className="font-black text-ink tabular-nums">{faPrice(itemsTotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-grey font-bold">هزینهٔ پیک</dt>
              <dd className="font-black text-ink tabular-nums">
                {deliveryTotal > 0 ? faPrice(deliveryTotal) : "رایگان"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-dashed border-brand-soft pt-2.5 mt-2.5">
              <dt className="font-black text-[15px] text-ink">قابل پرداخت</dt>
              <dd className="text-[19px] font-black text-brand tabular-nums">{faPrice(grand)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[11px] text-teal-deep leading-4 bg-teal-mist/40 rounded-xl px-3 py-2">
            💳 پرداخت در محل تحویل انجام می‌شود — بدون درگاه پرداخت آنلاین.
          </p>
        </section>
      </div>

      {/* ───── نوار چسبان ───── */}
      <div className="sticky bottom-0 z-30 -mx-4 mt-4 rounded-t-[26px] bg-brand shadow-[0_-8px_24px_rgba(236,64,122,.4)] px-4 pt-3 pb-[max(env(safe-area-inset-bottom),12px)]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-white text-[15px] font-extrabold">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            جمع کل سبد
          </span>
          <span className="text-left">
            <span className="block text-[19px] font-black text-white tabular-nums leading-6">{faPrice(grand)}</span>
            <span className="block text-[9.5px] text-white/80 leading-3 mt-0.5">
              ({toFaDigits(cart.length)} آیتم · {faPrice(itemsTotal, false)} کالا + {faPrice(deliveryTotal, false)} ارسال)
            </span>
          </span>
        </div>
        <button
          type="button"
          disabled={submitting}
          onClick={submit}
          className={cn(
            "mt-3 w-full h-14 rounded-full text-white text-[16px] font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,172,193,.45)] active:scale-[.98] transition-transform",
            submitting ? "bg-teal-mist text-teal-deep" : "bg-teal-brand"
          )}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="h-5 w-5 border-2 border-teal-deep/30 border-t-teal-deep rounded-full animate-spin" aria-hidden />
              در حال ثبت سفارش…
            </span>
          ) : (
            <>
              <Send className="h-5 w-5 -scale-x-100" aria-hidden />
              ثبت نهایی سفارش
              <ChevronLeft className="h-5 w-5" strokeWidth={3} aria-hidden />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
