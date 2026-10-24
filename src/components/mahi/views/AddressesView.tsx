"use client";

import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, PillBtn } from "../ui";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { MapPin, ChevronLeft, Pencil, Trash2, Plus, Home as HomeIcon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AddressesView() {
  const { data, refresh } = useApp();
  const { go } = useMahiStore();
  const { toast } = useToast();
  const addresses = data?.addresses ?? [];

  const remove = async (id: string) => {
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    await refresh();
    toast({ title: "آدرس حذف شد" });
  };

  const setDefault = async (id: string) => {
    await fetch(`/api/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    await refresh();
    toast({ title: "آدرس پیش‌فرض تغییر کرد ✅" });
  };

  return (
    <div>
      <ScreenHeader title="آدرس‌های من" action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><MapPin className="h-6 w-6 text-brand" aria-hidden /></span>} />

      <div className="space-y-3" role="list">
        {addresses.map((a, i) => (
          <motion.article
            key={a.id}
            role="listitem"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.06, 0.3) }}
            className={cn("my-card p-4 relative", a.isDefault && "border-2 border-brand")}
          >
            <div className="flex items-start gap-3">
              <span className="h-12 w-12 rounded-full bg-brand-mist grid place-items-center text-brand shrink-0">
                {a.title === "خانه" ? <HomeIcon className="h-6 w-6" aria-hidden /> : a.title === "محل کار" ? <Star className="h-6 w-6" aria-hidden /> : <MapPin className="h-6 w-6" aria-hidden />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[15px] font-black text-ink">{a.title}</h2>
                  {a.isDefault ? (
                    <span className="rounded-full bg-teal-brand text-white text-[10px] font-black px-2.5 py-0.5">پیش‌فرض</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDefault(a.id)}
                      className="rounded-full bg-brand-faint text-brand-deep text-[10px] font-black px-2.5 py-0.5 border border-brand-soft active:scale-95 transition-transform"
                    >
                      انتخاب به‌عنوان پیش‌فرض
                    </button>
                  )}
                </div>
                <p className="text-[12px] text-grey leading-[18px] mt-1.5">{a.full}</p>
                {a.receiver && (
                  <p className="text-[11px] font-bold text-teal-deep mt-1.5 tabular-nums">
                    {a.receiver} · {toFaDigits(a.phone || "")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3.5 pt-3 border-t border-dashed border-brand-soft">
              <PillBtn tone="ghost" className="h-9 text-[12px] px-4" onClick={() => go("address-form", { addressId: a.id, backTo: "addresses" })}>
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                ویرایش
              </PillBtn>
              <button
                type="button"
                onClick={() => remove(a.id)}
                aria-label="حذف آدرس"
                className="h-9 w-9 rounded-full bg-rose-50 text-rose-400 grid place-items-center active:scale-90 transition-transform"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
              <span className="flex-1" />
              <ChevronLeft className="h-5 w-5 text-brand-mist" aria-hidden />
            </div>
          </motion.article>
        ))}

        {addresses.length === 0 && (
          <div className="my-card p-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-brand-soft" aria-hidden />
            <p className="mt-2 text-[14px] font-black text-ink">هنوز آدرسی ثبت نشده</p>
            <p className="text-[12px] text-grey mt-1">برای تحویل سفارش، حداقل یک آدرس اضافه کن</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => go("address-form", { backTo: "addresses" })}
        className="mt-4 w-full h-14 rounded-full bg-brand text-white text-[15px] font-black flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(236,64,122,.4)] active:scale-[.98] transition-transform"
      >
        <Plus className="h-5 w-5" strokeWidth={3} aria-hidden />
        افزودن آدرس جدید
      </button>
    </div>
  );
}
