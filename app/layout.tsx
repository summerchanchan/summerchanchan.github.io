import type { Metadata } from "next";
import { headers } from "next/headers";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({ variable: "--font-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: "Summer's World — Xiayu Chen",
    description: "Explore Xiayu “Summer” Chen’s research, writing, photography, and work in technology for social good.",
    icons: {
      icon: [{ url: "/summer-favicon.jpg", type: "image/jpeg" }],
      shortcut: "/summer-favicon.jpg",
      apple: "/summer-favicon.jpg",
    },
    openGraph: { title: "Summer's World", description: "Care · Research · Photography", images: [new URL("/og.png", base).toString()] },
    twitter: { card: "summary_large_image", title: "Summer's World", description: "Care · Research · Photography", images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${sans.variable}`}>{children}</body></html>;
}
