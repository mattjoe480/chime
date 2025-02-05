import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import localFont from "next/font/local";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from "@/components/main-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const logirent = localFont({
  src: [
    {
      path: "../../public/fonts/logirent-regular.ttf",
      weight: "400",
    },
    {
      path: "../../public/fonts/logirent-bold.ttf",
      weight: "700",
    },
  ],
  variable: "--font-logirent",
});

export const metadata: Metadata = {
  title: "ChimeUp - AI-Powered Healthcare Platform",
  description:
    "ChimeUp is India's first AI-powered healthcare platform connecting patients with providers, managing records, and providing 24/7 health assistance.",
  keywords:
    "healthcare, AI healthcare, telemedicine, digital health, medical records, doctor appointments",
  authors: [{ name: "ChimeUp Healthcare" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://chimeup.in",
    siteName: "ChimeUp Healthcare",
    title: "ChimeUp - AI-Powered Healthcare Platform",
    description:
      "Transform your healthcare experience with ChimeUp's AI-powered platform",
    images: [
      {
        url: "/og-image.png", // Add your OG image
        width: 1200,
        height: 630,
        alt: "ChimeUp Healthcare Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChimeUp - AI-Powered Healthcare Platform",
    description:
      "Transform your healthcare experience with ChimeUp's AI-powered platform",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${logirent.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <MainLayout>{children}</MainLayout>
          </SessionProvider>
        </ThemeProvider>
        <Toaster />
      </body>
      <GoogleAnalytics gaId="G-QHK3REEFCM" />
    </html>
  );
}
