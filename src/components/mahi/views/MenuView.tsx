"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { FavHeart } from "../ui";
import { faPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ChevronLeft, Waves, Fish as FishIcon, Sparkles } from "lucide-react";

export default function MenuView() {
  const { data } = useApp();
  const { go, params } = useMahiStore();
  const [cat, setCat] = useState<string>(params.category ?? "all");

  const categories = data?.categories ?? [];
  const fishes = useMemo(() => {
    const all = categories.flatMap((c) => c.fishes);
    return cat === "all" ? all : all.filter((f) => f.categoryId === cat);
  }, [categories, cat]);

  return (
    <div className="space-y-4">
      <div className="text-center pt-1">
        <h1 className="text-[22px] font-black text-ink">منوی ماهی‌ها</h1>
        <p className="text-[12px] text-grey mt-0.5">تازه‌ترین ماهی‌های امروز، آمادهٔ کباب شدن روی زغال 🔥</p>
        <Waves className="h-3 w-24 mx-auto mt-1 text-teal-brand" aria-hidden />
      </div>

      {/* چیپ‌های دسته‌بندی */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1" role="tablist" aria-label="دسته‌بندی ماهی">
        <button
          type="button"
          role="tab"
          aria-selected={cat === "all"}
          onClick={() => setCat("all")}
          className={cn(
            "shrink-0 rounded-full px-4 h-9 text-[13px] font-bold border-2 transition-all active:scale-95",
            cat === "all" ? "bg-brand text-white border-brand shadow-[0_6px_16px_rgba(236,64,122,.35)]" : "bg-white text-ink border-brand-soft"
          )}
        >
          همه
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cat === c.id}
            onClick={() => setCat(c.id)}
            className={cn(
              "shrink-0 rounded-full px-4 h-9 text-[13px] font-bold border-2 transition-all active:scale-95",
              cat === c.id ? "bg-brand text-white border-brand shadow-[0_6px_16px_rgba(236,64,122,.35)]" : "bg-white text-ink border-brand-soft"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* لیست ماهی‌ها */}
      <div className="space-y-3" role="list">
        {fishes.map((f, i) => {
          const isFav = data?.favorites?.includes(f.id);
          const catName = categories.find((c) => c.id === f.categoryId)?.name;
          return (
            <motion.article
              key={f.id}
              role="listitem"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.3) }}
              className="my-card p-3 flex gap-3 active:scale-[.99] transition-transform cursor-pointer"
              onClick={() => go("fish", { fishId: f.id })}
            >
              <div className="relative w-28 h-28 shrink-0">
                <span className="relative block w-full h-full rounded-[18px] overflow-hidden shadow-[0_4px_12px_rgba(88,24,69,.18)]">
                  <Image src={f.image} alt={f.name} fill unoptimized className="object-cover" sizes="112px" />
                </span>
                <FavHeart
                  filled={!!isFav}
                  className="absolute -top-1.5 -left-1.5"
                  onClick={async () => {
                    await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fishId: f.id }) });
                    window.dispatchEvent(new CustomEvent("mahi:refresh"));
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[15px] font-extrabold text-ink leading-6">{f.name}</h2>
                  {f.badgeText ? (
                    <Badge className="bg-teal-brand hover:bg-teal-brand text-[10px] h-5 px-2 border-none">
                      <Sparkles className="h-3 w-3" aria-hidden /> {f.badgeText}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-[11px] text-grey leading-[16px] mt-1 line-clamp-2">{f.description}</p>
                <div className="mt-auto flex items-end justify-between pt-2">
                  <div>
                    <p className="text-[10px] text-grey">{catName}</p>
                    <p className="text-[15px] font-black text-brand tabular-nums">{faPrice(f.price)}</p>
                  </div>
                  <span className="h-10 w-10 rounded-full bg-brand grid place-items-center text-white shadow-[0_6px_16px_rgba(236,64,122,.4)] active:scale-90 transition-transform" aria-hidden>
                    <ChevronLeft className="h-5 w-5" strokeWidth={3} />
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
        {fishes.length === 0 && (
          <div className="my-card p-8 text-center text-grey">
            <FishIcon className="mx-auto h-10 w-10 text-brand-soft" aria-hidden />
            <p className="mt-2 text-[13px] font-bold">ماهی‌ای در این دسته نیست (فعلاً!)</p>
          </div>
        )}
      </div>
    </div>
  );
}
