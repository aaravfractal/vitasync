import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/components/toast";

export const metadata: Metadata = {
  title: "VitaSync — Your whole health record, in one place",
  description:
    "Symptom check, vitals, doctor booking and refills in one place. One record. Yours. Built in Dehradun.",
};
export const viewport: Viewport = { themeColor: "#F7F5F0", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- app router root layout, applies to every page */}
        <link
          href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@400;500;600&family=Space+Grotesk:wght@600;700&family=Noto+Sans+Devanagari:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full"><StoreProvider><ToastProvider>{children}</ToastProvider></StoreProvider></body>
    </html>
  );
}
