"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, StatusBadge } from "../ui";
import { faPrice, toFaDigits, faDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TOrder } from "@/lib/types";
import { motion } from "framer-motion";
import { ClipboardList, ChevronLeft, Clock, Fish as FishIcon } from "lucide-react";

const FILTERS = [
  { key: "all", label: "همه" },
  { key: "preparing", label: "در حال آماده‌سازی" },
  { key: "delivered", label: "تحویل شده" },
];

export default function OrdersView() {
  const { data } = useApp();
  const { go } = useMahiStore();
  const [filter, setFilter] = useState("all");

  const orders = useMemo(() => {
    const all = data?.orders ?? [];
    return filter === "all" ? all : all.filter((o) => o.status === filter);
  }, [data?.orders, filter]);

  return (
    <div>
      <ScreenHeader title="سفارش‌های من" action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><ClipboardList className="h-6 w-6 text-brand" aria-hidden /></span>} />

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="tablist" aria-label="فیلتر وضعیت">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-4 h-9 text-[12.5px] font-bold border-2 transition-all active:scale-95",
              filter === f.key ? "bg-brand text-white border-brand shadow-[0_6px_16px_rgba(236,64,122,.35)]" : "bg-white text-ink border-brand-soft"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2.5" role="list">
        {orders.length === 0 && (
          <div className="my-card p-8 text-center text-grey">
            <FishIcon className="mx-auto h-10 w-10 text-brand-soft" aria-hidden />
            <p className="mt-2 text-[13px] font-bold">سفارشی با این وضعیت نیست</p>
          </div>
        )}
        {orders.map((o: TOrder, i) => (
          <motion.button
            key={o.id}
            type="button"
            role="listitem"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.3) }}
            onClick={() => go("order-detail", { orderId: o.id })}
            className="my-card-sm p-3 w-full flex items-center gap-3 text-right active:scale-[.99] transition-transform"
            aria-label={`سفارش ${o.fishName}`}
          >
            <span className="w-[68px] h-[68px] rounded-[16px] overflow-hidden shrink-0 shadow-[0_4px_10px_rgba(88,24,69,.18)]">
              <Image src={o.fishImage} alt={o.fishName} width={68} height={68} unoptimized className="h-full w-full object-cover" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={o.status} />
                <span className="text-[14px] font-black text-ink">{o.fishName}</span>
              </span>
              <span className="block text-[10.5px] text-grey leading-4 mt-1">
                {o.deliveryMethodTitle} | {o.timeSlotLabel} ({o.timeSlotShift})
              </span>
              <span className="block text-[11px] font-black text-grey mt-0.5 tabular-nums">مبلغ: {faPrice(o.total)}</span>
              <span className="flex items-center gap-1 text-[10px] text-grey mt-0.5 tabular-nums">
                <Clock className="h-3 w-3" aria-hidden />
                {faDateTime(o.createdAt)}
              </span>
            </span>
            <ChevronLeft className="h-5 w-5 text-brand-mid shrink-0" aria-hidden />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
