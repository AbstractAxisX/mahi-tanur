// Persian (Farsi) formatting helpers
const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toFaDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function toEnDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** 195000 → «۱۹۵٬۰۰۰ تومان» */
export function faPrice(amount: number, withUnit = true): string {
  const s = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  const fa = toFaDigits(s);
  return withUnit ? `${fa} تومان` : fa;
}

/** 195000 → «۱۹۵٬۰۰۰» */
export function faNumber(amount: number): string {
  return toFaDigits(String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, "٬"));
}

export function faDateTime(d: Date | string): string {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const day = date.getDate();
  return toFaDigits(`${y}/${String(m).padStart(2, "0")}/${String(day).padStart(2, "0")}`);
}

export const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  preparing: { label: "در حال آماده‌سازی", cls: "bg-teal-c text-white" },
  delivered: { label: "تحویل شد", cls: "bg-emerald-500 text-white" },
  canceled: { label: "لغو شد", cls: "bg-rose-400 text-white" },
};
