"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useMahiStore } from "../store";
import { PillBtn, MahiLogo } from "../ui";
import { faPrice, toFaDigits } from "@/lib/format";
import type { Order } from "@/lib/types";
import { motion } from "framer-motion";
import { CheckCircle2, Waves, ClipboardList, Home as HomeIcon, PartyPopper } from "lucide-react";

export default function SuccessView() {
  const { params, go } = useMahiStore();
  const orders = useMemo<Order[]>(() => {
    try {
      return JSON.parse(params.orders || "[]");
    } catch {
      return [];
    }
  }, [params.orders]);

  const grand = orders.reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <div className="pt-6 pb-4 space-y-5">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }} className="text-center">
        <span className="mx-auto h-24 w-24 rounded-full bg-teal-brand grid place-items-center shadow-[0_10px_30px_rgba(0,188,212,.45)]">
          <CheckCircle2 className="h-14 w-14 text-white" aria-hidden />
        </span>
        <h1 className="mt-4 text-[22px] font-black text-ink">سفارش شما ثبت شد!</h1>
        <p className="mt-1 text-[13px] text-grey font-bold flex items-center justify-center gap-1.5">
          <PartyPopper className="h-4 w-4 text-brand" aria-hidden />
          ممنون از اعتمادتون؛ ماهی‌ها دارن آماده می‌شن
        </p>
        <Waves className="h-3 w-32 mx-auto mt-2 text-teal-brand" aria-hidden />
      </motion.div>

      {orders.map((o) => (
        <div key={o.id} className="my-card p-3.5 flex items-center gap-3">
          <span className="w-16 h-16 rounded-[16px] overflow-hidden shrink-0 shadow">
            <Image src={o.fishImage} alt={o.fishName} width={64} height={64} unoptimized className="h-full w-full object-cover" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-black text-ink">{o.fishName} <span className="text-grey text-[11px]">×{toFaDigits(o.quantity)}</span></p>
            <p className="text-[10.5px] text-grey mt-0.5 leading-4">
              {o.deliveryMethodTitle} · {o.timeSlotLabel} ({o.timeSlotShift})
            </p>
            <p className="text-[10px] text-grey leading-4 mt-0.5 truncate">{o.addressFull}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="rounded-full bg-brand-mist px-2.5 py-0.5 text-[10px] font-black text-brand-deep tabular-nums">
                کد پیگیری: {toFaDigits((o.code ?? "").slice(0, 6))}
              </span>
              <span className="text-[12px] font-black text-brand tabular-nums">{faPrice(o.total)}</span>
            </div>
          </div>
        </div>
      ))}

      <div className="my-card p-4 text-center bg-gradient-to-l from-brand-faint to-teal-mist/30">
        <p className="text-[13px] font-bold text-ink">مبلغ کل: <span className="text-[17px] font-black text-brand tabular-nums">{faPrice(grand)}</span></p>
        <p className="text-[11px] text-teal-deep mt-1">💳 پرداخت در محل تحویل انجام می‌شود (بدون درگاه پرداخت)</p>
      </div>

      <div className="flex gap-3 justify-center">
        <PillBtn tone="teal" onClick={() => go("orders")} className="px-7">
          <ClipboardList className="h-4 w-4" aria-hidden />
          سفارش‌های من
        </PillBtn>
        <PillBtn onClick={() => go("home")} className="px-7">
          <HomeIcon className="h-4 w-4" aria-hidden />
          صفحه اصلی
        </PillBtn>
      </div>

      <p className="text-center text-[12px] font-black text-ink-2/80 pt-2">
        عشق ماهی، عشق تازگی <span aria-hidden>❤️</span>
      </p>
      <div className="flex justify-center opacity-90">
        <MahiLogo size="sm" />
      </div>
    </div>
  );
}
