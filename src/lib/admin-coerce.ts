/* ─── تبدیل و پاک‌سازی بدنه درخواست‌های پنل ادمین (POST/PATCH) ───
   اعداد فارسی/انگلیسی → Int ، بولین‌ها → Boolean ، رشته‌ها → String */

import { toEnDigits } from "./format";

const NUMERIC = ["order", "price"];
const STRINGS = [
  "name", "title", "label", "shift", "icon", "code", "subtitle", "full", "receiver",
  "phone", "note", "image", "description", "badgeText", "appName", "appSlogan",
  "heroImage", "heroTitle", "heroSubtitle", "heroCtaText", "heroBadgeText",
  "logoImage", "promoImage", "promoLink",
  "addressText", "workHours", "footerNote", "instagram", "role", "avatar", "fishName",
];
const BOOLEANS = ["active", "isDefault", "inStock"];
const SKIPPED = ["id", "createdAt", "category", "favorites"];

export function pickAdminData(body: Record<string, unknown>): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (SKIPPED.includes(k) || v === undefined) continue;
    if (k === "categoryId") {
      if (v) data.categoryId = String(v);
      continue;
    }
    if (NUMERIC.includes(k)) {
      const t = toEnDigits(String(v ?? "")).replace(/[^\d.\-]/g, "");
      const n = Number(t);
      data[k] = Number.isFinite(n) ? Math.round(n) : 0;
    } else if (BOOLEANS.includes(k)) {
      data[k] = Boolean(v);
    } else if (STRINGS.includes(k)) {
      data[k] = v === null || v === undefined ? null : String(v);
    } else if (k === "status") {
      data[k] = String(v);
    } else if (k === "lat" || k === "lng") {
      const n = Number(v);
      data[k] = v === null || v === undefined || !Number.isFinite(n) ? null : n;
    }
  }
  return data;
}
