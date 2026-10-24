import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ماهی‌یار | سفارش آنلاین ماهی تازه",
  description: "سفارش آنلاین ماهی تازه با تحویل در محل یا پیک — قزل آلا، کپور، سالمون، سوف و...",
  keywords: ["ماهی", "سفارش ماهی", "قزل آلا", "کپور", "سالمون", "ماهی‌یار"],
};

export const viewport: Viewport = {
  themeColor: "#ec407a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
