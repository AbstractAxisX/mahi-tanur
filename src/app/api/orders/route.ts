import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface IncomingOrder {
  fishId?: string | null;
  fishName: string;
  fishImage: string;
  fishPrice: number;
  quantity: number;
  extras?: { name: string; price: number; image?: string }[];
  deliveryMethodTitle: string;
  deliveryPrice: number;
  timeSlotLabel: string;
  timeSlotShift?: string;
  addressFull: string;
  receiver: string;
  receiverPhone: string;
  note?: string | null;
}

export async function GET() {
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: IncomingOrder[] = Array.isArray(body) ? body : [body];
    if (!items.length) return NextResponse.json({ error: "empty order" }, { status: 400 });

    const created = [];
    for (const it of items) {
      if (!it.fishName || !it.receiver || !it.receiverPhone) continue;
      const extras = it.extras ?? [];
      const extrasTotal = extras.reduce((s, e) => s + (e.price || 0), 0);
      const total = (it.fishPrice || 0) * (it.quantity || 1) + extrasTotal + (it.deliveryPrice || 0);
      const order = await db.order.create({
        data: {
          fishId: it.fishId ?? null,
          fishName: it.fishName,
          fishImage: it.fishImage,
          fishPrice: it.fishPrice || 0,
          quantity: it.quantity || 1,
          extrasJson: JSON.stringify(extras),
          extrasTotal,
          deliveryMethodTitle: it.deliveryMethodTitle,
          deliveryPrice: it.deliveryPrice || 0,
          timeSlotLabel: it.timeSlotLabel,
          timeSlotShift: it.timeSlotShift ?? "",
          addressFull: it.addressFull,
          receiver: it.receiver,
          receiverPhone: it.receiverPhone,
          note: it.note ?? null,
          total,
        },
      });
      created.push(order);
    }
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error("order create error", e);
    return NextResponse.json({ error: "order failed" }, { status: 500 });
  }
}
