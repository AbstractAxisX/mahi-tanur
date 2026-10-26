import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX = 8 * 1024 * 1024; // ۸ مگابایت

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "فرمت فایل معتبر نیست" }, { status: 400 });
    }
    if (file.size > MAX) {
      return NextResponse.json({ error: "حجم فایل بیش از حد مجاز است" }, { status: 400 });
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
    const name = `${randomUUID().replace(/-/g, "").slice(0, 24)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
  } catch (e) {
    console.error("upload error", e);
    return NextResponse.json({ error: "آپلود انجام نشد" }, { status: 500 });
  }
}
