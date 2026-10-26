import { Fish, FishCategory, Extra, TimeSlot, DeliveryMethod, Profile, Address, Order, SiteSettings } from "@prisma/client";

export type TFish = Fish;
export type TCategory = FishCategory;
export type TExtra = Extra;
export type TTimeSlot = TimeSlot;
export type TDeliveryMethod = DeliveryMethod;
export type TProfile = Profile;
export type TAddress = Address;
export type TOrder = Order;
export type TSettings = SiteSettings;

export interface AppBoot {
  settings: TSettings;
  categories: (TCategory & { fishes: TFish[] })[];
  extras: TExtra[];
  timeSlots: TTimeSlot[];
  deliveryMethods: TDeliveryMethod[];
  profile: TProfile;
  addresses: TAddress[];
  favorites: string[]; // fishIds
  orders: TOrder[];
}

export interface CartExtra {
  id: string;
  name: string;
  image: string;
  price: number;
}

export interface CartItem {
  uid: string;
  fishId: string;
  fishName: string;
  fishImage: string;
  fishPrice: number;
  description: string;
  quantity: number;
  extras: CartExtra[];
  extrasTotal: number;
  timeSlot: { id: string; label: string; shift: string } | null;
  deliveryMethod: { id: string; code: string; title: string; price: number } | null;
  addressId: string | null;
  addressFull: string;
  addressLat: number | null; // موقعیت روی نقشه
  addressLng: number | null;
  receiver: string;
  receiverPhone: string;
  note: string;
  unitTotal: number; // fish*qty + extras
  total: number; // unitTotal + delivery
}

export type ViewName =
  | "home"
  | "menu"
  | "fish"
  | "cart"
  | "success"
  | "profile"
  | "orders"
  | "order-detail"
  | "addresses"
  | "address-form"
  | "favorites"
  | "settings"
  | "admin";
