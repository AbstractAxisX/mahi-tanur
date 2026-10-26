"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, StatusBadge } from "../ui";
import { faPrice, toFaDigits, faDateTime } from "@/lib/format";
import type { TOrder } from "@/lib/types";
import { motion } from "framer-motion";
import { Sun, Moon, Truck, MapPin, User, Phone, NotebookPen, ReceiptText, Clock, Navigation } from "lucide-react";

export default function OrderDetailView() {
  const { data } = useApp();
  const { params } = useMahiStore();

  const order = useMemo<TOrder | null>(() => (data?.orders ?? []).find((o) => o.id === params.orderId) ?? null, [data, params.orderId]);
  const extras = useMemo<{ name: string; price: number }[]>(() => {
    try {
      return order ? JSON.parse(order.extrasJson || "[]") : [];
    } catch {
      return [];
    }
  }, [order]);

  if (!order) {
    return (
      <div className="my-card p-8 text-center text-grey font-bold">
        سفارش پیدا نشد.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <ScreenHeader title="جزئیات سفارش" />

      <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="my-card p-4" aria-label="خلاصه سفارش">
        <div className="flex items-center gap-3.5">
          <span className="w-28 aspect-video rounded-[16px] overflow-hidden shrink-0 shadow-[0_6px_16px_rgba(88,24,69,.2)] relative">
            <Image src={order.fishImage} alt={order.fishName} fill unoptimized className="object-cover" sizes="112px" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={order.status} />
            </div>
            <h2 className="text-[17px] font-black text-ink mt-1.5">{order.fishName}</h2>
            <p className="text-[11px] text-grey mt-0.5">
              {toFaDigits(order.quantity)} عدد · {faPrice(order.fishPrice)} / هر عدد
            </p>
            <p className="flex items-center gap-1 text-[10px] text-grey mt-1 tabular-nums">
              <Clock className="h-3 w-3" aria-hidden />
              {faDateTime(order.createdAt)} · کد: {toFaDigits((order.code ?? "").slice(0, 6))}
            </p>
          </div>
        </div>
      </motion.section>

      <section className="my-card p-4 space-y-3" aria-label="جزئیات ارسال">
        <h3 className="text-[15px] font-extrabold text-brand-deep">جزئیات ارسال</h3>
        <p className="flex items-center gap-2.5 text-[12.5px] text-body font-bold">
          <span className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">
            {order.timeSlotShift === "عصر" ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
          </span>
          زمان تحویل: {order.timeSlotLabel} ({order.timeSlotShift})
        </p>
        <p className="flex items-center gap-2.5 text-[12.5px] text-body font-bold">
          <span className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">
            <Truck className="h-4 w-4" aria-hidden />
          </span>
          {order.deliveryMethodTitle} — {order.deliveryPrice > 0 ? faPrice(order.deliveryPrice) : "رایگان"}
        </p>
        <p className="flex items-center gap-2.5 text-[12.5px] text-body font-bold">
          <span className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">{order.addressFull}</span>
          {order.addressLat != null && order.addressLng != null && (
            <a
              href={`geo:${order.addressLat},${order.addressLng}`}
              className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full bg-teal-brand text-white text-[11px] font-bold active:scale-95 transition-transform"
              aria-label="مشاهدهٔ موقعیت تحویل روی نقشه"
            >
              <Navigation className="h-3.5 w-3.5" aria-hidden />
              نقشه
            </a>
          )}
        </p>
        <p className="flex items-center gap-2.5 text-[12.5px] text-body font-bold">
          <span className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">
            <User className="h-4 w-4" aria-hidden />
          </span>
          {order.receiver} · <span dir="ltr" className="tabular-nums">{toFaDigits(order.receiverPhone)}</span>
        </p>
        {order.note && (
          <p className="flex items-center gap-2.5 text-[12.5px] text-body font-bold">
            <span className="h-9 w-9 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">
              <NotebookPen className="h-4 w-4" aria-hidden />
            </span>
            یادداشت: {order.note}
          </p>
        )}
      </section>

      <section className="my-card p-4" aria-label="حَشوهای انتخابی">
        <h3 className="text-[15px] font-extrabold text-brand-deep mb-3">حَشوهای انتخابی</h3>
        {extras.length === 0 ? (
          <p className="text-[12px] text-grey font-bold">بدون حَشو — ماهی خالص! 🐟</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {extras.map((e, i) => (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-brand-mist text-brand-deep text-[12px] font-bold px-3 py-1.5">
                🥗 {e.name} · {faPrice(e.price, false)}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="my-card p-4" aria-label="صورت‌حساب">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="h-10 w-10 rounded-full bg-brand-mist grid place-items-center text-brand">
            <ReceiptText className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="text-[15px] font-extrabold text-brand-deep">صورت‌حساب</h3>
        </div>
        <dl className="space-y-2 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-grey font-bold">ماهی ({toFaDigits(order.quantity)} × {faPrice(order.fishPrice, false)})</dt>
            <dd className="font-black text-ink tabular-nums">{faPrice(order.fishPrice * order.quantity)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-grey font-bold">حَشوها</dt>
            <dd className="font-black text-ink tabular-nums">{order.extrasTotal > 0 ? faPrice(order.extrasTotal) : "—"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-grey font-bold">هزینهٔ پیک</dt>
            <dd className="font-black text-ink tabular-nums">{order.deliveryPrice > 0 ? faPrice(order.deliveryPrice) : "رایگان"}</dd>
          </div>
          <div className="flex justify-between border-t border-dashed border-brand-soft pt-2.5 mt-2.5">
            <dt className="font-black text-[15px] text-ink">قابل پرداخت</dt>
            <dd className="text-[19px] font-black text-brand tabular-nums">{faPrice(order.total)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[11px] text-teal-deep bg-teal-mist/40 rounded-xl px-3 py-2">
          💳 پرداخت در محل تحویل انجام شد (بدون درگاه پرداخت)
        </p>
      </section>
    </div>
  );
}
