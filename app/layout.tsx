import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zenith — Level Up Your Mind",
  description: "Mindfulness that fits the way you live.",
  applicationName: "Zenith",
  appleWebApp: { capable: true, title: "Zenith", statusBarStyle: "black-translucent" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0A0F1F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-dvh antialiased">
        <StoreProvider>
          {/* Phone-width column. On desktop it sits centred in an ambient field
              so the mobile-first layout reads as intentional, not broken. */}
          <div className="mx-auto min-h-dvh w-full max-w-[460px] bg-abyss relative overflow-x-clip
                          sm:my-6 sm:min-h-[900px] sm:rounded-[42px] sm:border sm:border-hairline
                          sm:shadow-[0_60px_140px_-40px_rgba(0,0,0,0.9)] sm:overflow-hidden">
            {children}
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
