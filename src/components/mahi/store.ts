"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, ViewName } from "@/lib/types";

/** کاربر واردشده (مهمان = null) */
export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  role: string;
}

interface NavEntry {
  view: ViewName;
  params: Record<string, string>;
}

interface MahiState {
  view: ViewName;
  params: Record<string, string>;
  stack: NavEntry[];
  cart: CartItem[];
  cartFlash: number;
  authUser: AuthUser | null;
  go: (view: ViewName, params?: Record<string, string>) => void;
  back: () => void;
  setView: (view: ViewName, params?: Record<string, string>) => void;
  setAuth: (user: AuthUser | null) => void;
  addToCart: (item: CartItem) => void;
  updateCartItem: (uid: string, patch: Partial<CartItem>) => void;
  removeFromCart: (uid: string) => void;
  clearCart: () => void;
}

export const useMahiStore = create<MahiState>()(
  persist(
    (set, get) => ({
      view: "home",
      params: {},
      stack: [],
      cart: [],
      cartFlash: 0,
      authUser: null,

      setView: (view, params = {}) => set({ view, params, stack: [] }),

      setAuth: (user) => set({ authUser: user }),

      go: (view, params = {}) => {
        const { view: cur, params: curParams, stack } = get();
        if (cur === view) {
          set({ params });
          return;
        }
        set({ view, params, stack: [...stack, { view: cur, params: curParams }].slice(-25) });
        if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      },

      back: () => {
        const { stack } = get();
        if (!stack.length) {
          set({ view: "home", params: {} });
          return;
        }
        const last = stack[stack.length - 1];
        set({ view: last.view, params: last.params, stack: stack.slice(0, -1) });
        if (typeof window !== "undefined") window.scrollTo({ top: 0 });
      },

      addToCart: (item) => set((s) => ({ cart: [...s.cart, item], cartFlash: Date.now() })),
      updateCartItem: (uid, patch) =>
        set((s) => ({
          cart: s.cart.map((c) => {
            if (c.uid !== uid) return c;
            const next = { ...c, ...patch };
            next.extrasTotal = next.extras.reduce((sum, e) => sum + e.price, 0);
            next.unitTotal = next.fishPrice * next.quantity + next.extrasTotal;
            next.total = next.unitTotal + (next.deliveryMethod?.price ?? 0);
            return next;
          }),
        })),
      removeFromCart: (uid) => set((s) => ({ cart: s.cart.filter((c) => c.uid !== uid) })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "mahi-yar-cart",
      partialize: (s) => ({ cart: s.cart, authUser: s.authUser }),
    }
  )
);

export function cartTotals(cart: CartItem[]) {
  const itemsTotal = cart.reduce((s, c) => s + c.unitTotal, 0);
  const deliveryTotal = cart.reduce((s, c) => s + (c.deliveryMethod?.price ?? 0), 0);
  const grand = cart.reduce((s, c) => s + c.total, 0);
  return { itemsTotal, deliveryTotal, grand, count: cart.length };
}
