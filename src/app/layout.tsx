import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import { Providers } from "@/components/providers";
import { env } from "@/lib/env";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_NAME = "AniLux — Premium Anime Streaming";
const SITE_DESC =
  "Stream premium anime in a luxurious, lightning-fast experience. Featured, trending, and newly added series with Hindi Dub support.";

function siteUrl(): string {
  try {
    return env.siteUrl;
  } catch {
    return "https://example.com";
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: "%s · AniLux",
  },
  description: SITE_DESC,
  applicationName: "AniLux",
  keywords: ["anime", "streaming", "hindi dub", "watch anime", "anime online"],
  openGraph: {
    type: "website",
    siteName: "AniLux",
    title: SITE_NAME,
    description: SITE_DESC,
    url: siteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
    { media: "(prefers-color-scheme: light)", color: "#f3f6fa" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
