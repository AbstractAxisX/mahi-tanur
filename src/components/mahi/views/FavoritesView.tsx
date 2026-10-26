"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useApp } from "../AppContext";
import { useMahiStore } from "../store";
import { ScreenHeader, FavHeart } from "../ui";
import { faPrice } from "@/lib/format";
import { motion } from "framer-motion";
import { Heart, ChevronLeft, Sparkles } from "lucide-react";

export default function FavoritesView() {
  const { data } = useApp();
  const { go } = useMahiStore();

  const favFish = useMemo(() => {
    const all = (data?.categories ?? []).flatMap((c) => c.fishes);
    return all.filter((f) => (data?.favorites ?? []).includes(f.id));
  }, [data]);

  return (
    <div>
      <ScreenHeader title="علاقه‌مندی‌ها" action={<span className="h-11 w-11 grid place-items-center rounded-full bg-white/60"><Heart className="h-6 w-6 text-brand fill-brand/20" aria-hidden /></span>} />

      <div className="space-y-3" role="list">
        {favFish.map((f, i) => (
          <motion.article
            key={f.id}
            role="listitem"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.05, 0.25) }}
            tabIndex={0}
            onClick={() => go("fish", { fishId: f.id })}
            onKeyDown={(e) => e.key === "Enter" && go("fish", { fishId: f.id })}
            className="my-card p-3 w-full flex items-center gap-3 text-right active:scale-[.99] transition-transform cursor-pointer"
            aria-label={f.name}
          >
            <span className="relative w-28 aspect-video shrink-0">
              <span className="block w-full h-full rounded-[16px] overflow-hidden shadow-[0_4px_12px_rgba(88,24,69,.18)]">
                <Image src={f.image} alt={f.name} fill unoptimized className="object-cover" sizes="112px" />
              </span>
              <FavHeart
                filled
                className="absolute -top-1.5 -left-1.5"
                onClick={async () => {
                  await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fishId: f.id }) });
                  window.dispatchEvent(new CustomEvent("mahi:refresh"));
                }}
              />
            </span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center gap-2">
                <span className="text-[15px] font-black text-ink leading-6">{f.name}</span>
                {f.badgeText ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-brand text-white text-[10px] font-bold px-2 py-0.5">
                    <Sparkles className="h-3 w-3" aria-hidden /> {f.badgeText}
                  </span>
                ) : null}
              </span>
              <span className="block text-[11.5px] text-grey leading-[17px] mt-1 line-clamp-2">{f.description}</span>
              <span className="block text-[15px] font-black text-brand tabular-nums mt-1.5">{faPrice(f.price)}</span>
            </span>
            <ChevronLeft className="h-5 w-5 text-brand-mid shrink-0" aria-hidden />
          </motion.article>
        ))}

        {favFish.length === 0 && (
          <div className="my-card p-10 text-center">
            <Heart className="mx-auto h-14 w-14 text-brand-soft" aria-hidden />
            <p className="mt-3 text-[15px] font-black text-ink">علاقه‌مندی خالی است!</p>
            <p className="text-[12px] text-grey mt-1 leading-5">روی قلبِ هر ماهی در منو بزن تا اینجا ذخیره بشه ❤️</p>
          </div>
        )}
      </div>
    </div>
  );
}
