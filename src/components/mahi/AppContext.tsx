"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { AppBoot } from "@/lib/types";

interface AppCtx {
  data: AppBoot | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AppCtx>({ data: null, loading: true, refresh: async () => {} });

export function useApp() {
  return useContext(Ctx);
}

export function AppProvider({ children, initial }: { children: React.ReactNode; initial: AppBoot | null }) {
  const [data, setData] = useState<AppBoot | null>(initial);
  const [loading, setLoading] = useState(!initial);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/app", { cache: "no-store" });
      if (res.ok) {
        const json = (await res.json()) as AppBoot;
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initial) void refresh();
    else setLoading(false);
  }, [initial, refresh]);

  // گوش دادن به رویداد بروزرسانی (مثلاً پس از تغییر علاقه‌مندی‌ها)
  useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener("mahi:refresh", handler);
    return () => window.removeEventListener("mahi:refresh", handler);
  }, [refresh]);

  return <Ctx.Provider value={{ data, loading, refresh }}>{children}</Ctx.Provider>;
}
