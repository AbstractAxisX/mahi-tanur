"use client";

/* ─── دراپ‌داون جستجو‌دار (کامبوباکس) برای انتخاب استان/شهر ───
   - محتوای بازشو داخل Popover با z-[1000] رندر می‌شود تا هرگز زیر نقشه (Leaflet: z≤700) نرود
   - تایپ = فیلتر زندهٔ گزینه‌ها (جستجوی فارسی)
   - کیبورد: فلش بالا/پایین + Enter برای انتخاب، Esc برای بستن */

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type GeoOption = { name: string };

export default function SearchableGeoSelect({
  label,
  icon,
  value,
  onChange,
  options,
  placeholder = "انتخاب کنید",
  searchPlaceholder = "جستجو…",
  disabled = false,
  emptyText = "چیزی پیدا نشد",
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (name: string) => void;
  options: GeoOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);

  /* حذف نام‌های تکراری (برخی شهرها در داده‌ها دوبار آمده‌اند) */
  const uniqueOptions = options.filter((o, i) => options.findIndex((x) => x.name === o.name) === i);

  return (
    <div className="min-w-0">
      <span className="text-[11px] font-bold text-grey flex items-center gap-1">
        {icon}
        {label}
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            dir="rtl"
            className={cn(
              "mt-1.5 h-11 w-full rounded-2xl border-2 bg-white text-[13px] font-bold flex items-center justify-between gap-1.5 px-3 outline-none transition-colors text-right",
              "focus:border-brand active:scale-[.98]",
              disabled ? "border-brand-faint bg-brand-faint/60 text-grey cursor-not-allowed" : "border-brand-soft text-ink",
              open && "border-brand"
            )}
          >
            <span className={cn("flex-1 min-w-0 truncate text-right", value ? "text-ink" : "text-grey/70")}>
              {value || placeholder}
            </span>
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-brand transition-transform duration-200", open && "rotate-180")}
              aria-hidden
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          dir="rtl"
          align="start"
          sideOffset={6}
          className="z-[1000] w-[min(92vw,320px)] p-0 rounded-2xl border-2 border-brand-soft shadow-[0_12px_32px_rgba(74,21,75,.18)]"
        >
          <Command loop>
            <CommandInput
              dir="rtl"
              placeholder={searchPlaceholder}
              className="text-[13px] font-bold placeholder:font-normal"
            />
            <CommandList className="max-h-60">
              <CommandEmpty className="text-[12px] text-grey font-bold py-6 text-center">{emptyText}</CommandEmpty>
              <CommandGroup>
                {uniqueOptions.map((opt) => (
                  <CommandItem
                    key={opt.name}
                    value={opt.name}
                    onSelect={(current) => {
                      onChange(current);
                      setOpen(false);
                    }}
                    className="text-[13px] font-bold rounded-xl data-[selected=true]:bg-brand-faint data-[selected=true]:text-brand-dark"
                  >
                    <Check
                      className={cn("h-4 w-4 shrink-0 text-brand", value === opt.name ? "opacity-100" : "opacity-0")}
                      aria-hidden
                    />
                    <span className="truncate">{opt.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
