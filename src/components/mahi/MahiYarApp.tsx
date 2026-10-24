"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useMahiStore } from "./store";
import { AppProvider, useApp } from "./AppContext";
import { MahiLogo, CircleBtn, DrawerItem } from "./ui";
import { toFaDigits } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Waves, Home, Fish, ClipboardList, User, Settings as SettingsIcon, Menu as MenuIcon, ShoppingBasket, MapPin, Heart, LayoutGrid, X } from "lucide-react";

import HomeView from "./views/HomeView";
import MenuView from "./views/MenuView";
import FishDetailView from "./views/FishDetailView";
import CartView from "./views/CartView";
import SuccessView from "./views/SuccessView";
import ProfileView from "./views/ProfileView";
import OrdersView from "./views/OrdersView";
import OrderDetailView from "./views/OrderDetailView";
import AddressesView from "./views/AddressesView";
import AddressFormView from "./views/AddressFormView";
import FavoritesView from "./views/FavoritesView";
import SettingsView from "./views/SettingsView";

const NAV = [
  { key: "settings", view: "settings" as const, label: "تنظیمات", icon: SettingsIcon },
  { key: "fish", view: "menu" as const, label: "ماهی", icon: Fish },
  { key: "home", view: "home" as const, label: "خانه", icon: Home },
  { key: "orders", view: "orders" as const, label: "سفارشات", icon: ClipboardList },
  { key: "profile", view: "profile" as const, label: "پروفایل", icon: User },
];

function Loader() {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-brand-soft to-brand-mid/70">
      <div className="text-center animate-pulse">
        <div className="text-5xl mb-3">🐟</div>
        <p className="font-extrabold text-2xl text-ink">ماهی‌یار</p>
        <p className="text-ink/60 text-sm mt-1">در حال آماده‌سازی منوی تازه‌ها…</p>
        <Waves className="h-4 w-28 mx-auto mt-3 text-teal-brand" aria-hidden />
      </div>
    </div>
  );
}

function BottomNav() {
  const { view, go } = useMahiStore();
  return (
    <nav aria-label="ناوبری اصلی" className="bg-white/95 backdrop-blur rounded-t-[28px] shadow-[0_-6px_24px_rgba(236,64,122,.18)] pb-[max(env(safe-area-inset-bottom),10px)]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-end px-2 pt-2">
        {NAV.map((item) => {
          const active = view === item.view;
          const Icon = item.icon;
          if (item.key === "home") {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => go("home")}
                aria-label={item.label}
                aria-current={view === "home" ? "page" : undefined}
                className="flex flex-col items-center -mt-5"
              >
                <span
                  className={`h-14 w-14 rounded-full grid place-items-center border-4 border-white transition-transform active:scale-95 ${
                    view === "home" ? "bg-brand text-white shadow-[0_8px_20px_rgba(236,64,122,.45)]" : "bg-brand-mist text-brand-deep"
                  }`}
                >
                  <Icon className="h-7 w-7" strokeWidth={2.4} />
                </span>
                <span className={`text-[11px] mt-1 font-extrabold ${view === "home" ? "text-brand" : "text-grey"}`}>{item.label}</span>
              </button>
            );
          }
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => go(item.view)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 pt-2 pb-1"
            >
              <Icon className={`h-6 w-6 ${active ? "text-brand" : "text-grey"}`} strokeWidth={2.2} />
              <span className={`text-[11px] font-bold ${active ? "text-brand" : "text-grey"}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DrawerMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { go } = useMahiStore();
  const { data } = useApp();
  const cartCount = useMahiStore((s) => s.cart.length);
  const profile = data?.profile;
  const close = () => onOpenChange(false);
  const items: { icon: React.ReactNode; label: string; onClick: () => void; badge?: number }[] = [
    { icon: <Home />, label: "صفحه اصلی", onClick: () => { close(); go("home"); } },
    { icon: <Fish />, label: "منوی ماهی‌ها", onClick: () => { close(); go("menu"); } },
    { icon: <ShoppingBasket />, label: "سبد خرید", onClick: () => { close(); go("cart"); }, badge: cartCount },
    { icon: <ClipboardList />, label: "سفارش‌های من", onClick: () => { close(); go("orders"); } },
    { icon: <MapPin />, label: "آدرس‌های من", onClick: () => { close(); go("addresses"); } },
    { icon: <Heart />, label: "علاقه‌مندی‌ها", onClick: () => { close(); go("favorites"); } },
    { icon: <SettingsIcon />, label: "تنظیمات", onClick: () => { close(); go("settings"); } },
    { icon: <LayoutGrid />, label: "پنل مدیریت", onClick: () => { close(); go("admin"); } },
  ];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[86vw] max-w-[340px] bg-brand-faint border-none p-0 rounded-l-[28px]">
        <SheetHeader className="sr-only">
          <SheetTitle>منوی اصلی ماهی‌یار</SheetTitle>
          <SheetDescription>ناوبری به بخش‌های مختلف برنامه</SheetDescription>
        </SheetHeader>
        <div className="p-5 bg-gradient-to-l from-brand to-brand-mid text-white rounded-l-[28px] relative overflow-hidden">
          <div className="absolute -bottom-4 left-0 right-0 opacity-40">
            <Waves className="h-8 w-full text-teal-brand" aria-hidden />
          </div>
          <div className="flex items-start justify-between">
            <div className="relative z-10">
              <p className="text-[13px] text-white/85">سلام {profile?.name || "کاربر"} عزیز 👋</p>
              <p className="font-black text-lg leading-7 mt-0.5">عشق ماهی، عشق تازگی</p>
              <p className="text-[11px] text-white/80 mt-1">{toFaDigits(profile?.phone || "")}</p>
            </div>
            <button type="button" onClick={close} aria-label="بستن" className="h-8 w-8 rounded-full bg-white/20 grid place-items-center">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
          {items.map((it) => (
            <DrawerItem key={it.label} icon={it.icon} label={it.label} onClick={it.onClick} badge={it.badge} />
          ))}
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <MahiLogo size="sm" />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ViewRouter() {
  const { view } = useMahiStore();
  switch (view) {
    case "home": return <HomeView />;
    case "menu": return <MenuView />;
    case "fish": return <FishDetailView />;
    case "cart": return <CartView />;
    case "success": return <SuccessView />;
    case "profile": return <ProfileView />;
    case "orders": return <OrdersView />;
    case "order-detail": return <OrderDetailView />;
    case "addresses": return <AddressesView />;
    case "address-form": return <AddressFormView key={params.addressId ?? "new"} />;
    case "favorites": return <FavoritesView />;
    case "settings": return <SettingsView />;
    case "admin": return <AdminLazy />;
    default: return <HomeView />;
  }
}

function AdminLazy() {
  const [Comp, setComp] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    import("./views/AdminView").then((m) => setComp(() => m.default));
  }, []);
  if (!Comp) {
    return (
      <div className="p-10 text-center text-grey">
        <div className="text-4xl mb-2 animate-bounce">🎛️</div>
        در حال بارگذاری پنل مدیریت…
      </div>
    );
  }
  return <Comp />;
}

function Shell() {
  const { view, go } = useMahiStore();
  const { data } = useApp();
  const [drawer, setDrawer] = useState(false);
  const cartCount = useMahiStore((s) => s.cart.length);
  const showTopBar = view === "home";
  const hideNav = view === "fish" || view === "cart";

  const topBar = useMemo(
    () => (
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <CircleBtn label="منو" onClick={() => setDrawer(true)}>
          <MenuIcon className="h-6 w-6" strokeWidth={2.6} />
        </CircleBtn>
        <div className="flex-1 text-center leading-6">
          <div className="font-black text-[22px] text-ink drop-shadow-[0_1px_0_rgba(255,255,255,.6)]">
            ماهی‌یار
          </div>
          <div className="text-[11px] font-bold text-ink-2/80">{data?.settings?.appSlogan || "سفارش آنلاین ماهی تازه"}</div>
        </div>
        <CircleBtn label="سبد خرید" badge={cartCount} onClick={() => go("cart")}>
          <ShoppingBasket className="h-6 w-6" strokeWidth={2.4} />
        </CircleBtn>
      </div>
    ),
    [cartCount, data?.settings?.appSlogan, go]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-soft via-brand-soft to-[#f4a3c4]">
      {/* موج تزئینی بالای صفحه */}
      <div className="relative pointer-events-none" aria-hidden>
        <Waves className="h-4 w-full text-white/50" />
      </div>
      <header className={showTopBar ? "" : "hidden"}>{topBar}</header>
      <main className="flex-1 w-full max-w-md mx-auto px-4 pb-6 pt-1">{ViewRouter()}</main>
      {hideNav ? null : (
        <footer className="sticky bottom-0 z-40">
          <BottomNav />
        </footer>
      )}
      <DrawerMenu open={drawer} onOpenChange={setDrawer} />
    </div>
  );
}

export default function MahiYarApp() {
  return (
    <AppProvider initial={null}>
      <ShellGate />
    </AppProvider>
  );
}

function ShellGate() {
  const { data, loading } = useApp();
  if (loading || !data) return <Loader />;
  return <Shell />;
}
