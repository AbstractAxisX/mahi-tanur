/* ─── ابزارهای نقشه و مختصات جغرافیایی ─── */

/** اعتبارسنجی متن ورودی مختصات */
export function parseCoordText(v: string, min: number, max: number): number | null {
  const t = v.trim().replace(/[،]/g, ".");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}

/** لینک امبد نقشهٔ اوپن‌استریت‌مپ با نشانگر — بدون نیاز به کلید API */
export function osmEmbedUrl(lat: number, lng: number, delta = 0.0025): string {
  const bbox = [lng - delta, lat - delta / 2, lng + delta, lat + delta / 2].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

/** لینک‌های باز کردن موقعیت در برنامه‌های مسیریابی */
export function geoLinks(lat: number, lng: number): { device: string; google: string; waze: string } {
  return {
    device: `geo:${lat},${lng}`,
    google: `https://maps.google.com/?q=${lat},${lng}`,
    waze: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
  };
}
