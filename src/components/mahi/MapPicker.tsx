"use client";

/* ─── نقشه تعاملی انتخاب موقعیت (Leaflet + OpenStreetMap) ───
   - همیشه باز و قابل استفاده است (بدون نیاز به GPS)
   - لمس/کلیک روی نقشه یا جابه‌جایی پین → ثبت مختصات
   - دکمه «موقعیت من» → GPS مرورگر (در صورت اجازه)
   - flyTarget → پرواز نقشه به شهر انتخاب‌شده از سمت والد */

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type FlyTarget = { lat: number; lng: number; zoom: number; nonce: number } | null;

/** پین برند (تیل) — divIcon سفارشی برای نمایش هماهنگ با تم */
function usePinIcon(): L.DivIcon {
  return useMemo(
    () =>
      L.divIcon({
        className: "mahi-pin-wrap",
        html: `
          <div style="position:relative;width:34px;height:44px;">
            <div style="position:absolute;top:0;left:0;width:34px;height:34px;border-radius:50%;
                        background:#00ACD1;border:4px solid #fff;
                        box-shadow:0 6px 14px rgba(0,96,110,.45);
                        display:grid;place-items:center;">
              <div style="width:10px;height:10px;border-radius:50%;background:#fff;"></div>
            </div>
            <div style="position:absolute;top:29px;left:11px;width:0;height:0;
                        border-left:6px solid transparent;border-right:6px solid transparent;
                        border-top:12px solid #00ACD1;
                        filter:drop-shadow(0 2px 3px rgba(0,96,110,.35));"></div>
          </div>`,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
      }),
    []
  );
}

/** رویدادهای نقشه: کلیک/لمس → انتخاب موقعیت */
function MapEvents({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onPick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

/** پرواز نرم نقشه به هدف والد (شهر/استان) */
function Flyer({ target }: { target: FlyTarget }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.1 });
    }
  }, [target, map]);
  return null;
}

export default function MapPicker({
  lat,
  lng,
  onPick,
  center = [32.6539, 51.666],
  zoom = 12,
  flyTarget = null,
  height = 240,
}: {
  lat: number | null;
  lng: number | null;
  onPick: (lat: number, lng: number) => void;
  center?: [number, number];
  zoom?: number;
  flyTarget?: FlyTarget;
  height?: number;
}) {
  const pinIcon = usePinIcon();
  const hasPin = lat != null && lng != null;

  return (
    <div
      className="relative rounded-[16px] overflow-hidden border-2 border-brand-soft bg-brand-faint"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasPin && lat != null && lng != null ? (
          <Marker
            position={[lat, lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = (e.target as L.Marker).getLatLng();
                onPick(p.lat, p.lng);
              },
            }}
          />
        ) : null}
        <MapEvents onPick={onPick} />
        <Flyer target={flyTarget} />
      </MapContainer>

      {/* راهنمای روی نقشه */}
      {!hasPin && (
        <span className="pointer-events-none absolute top-2 inset-x-0 flex justify-center z-[500]">
          <span className="rounded-full bg-white/95 shadow px-3 py-1 text-[10.5px] font-black text-brand-dark">
            روی نقشه بزن تا موقعیت ثبت بشه 📍
          </span>
        </span>
      )}

      {/* مختصات جاری */}
      {hasPin && lat != null && lng != null && (
        <span className="pointer-events-none absolute bottom-2 inset-x-0 flex justify-center z-[500]">
          <span dir="ltr" className="rounded-full bg-white/95 shadow px-3 py-1 text-[10.5px] font-black text-ink tabular-nums">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </span>
        </span>
      )}
    </div>
  );
}
