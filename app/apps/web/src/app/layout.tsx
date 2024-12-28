import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import Image from "next/image";
import React from "react";
import Logo from './icons/brand.svg';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Chime",
    description: "World's first AI health app",
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode;
}>) {
    return (
    <html lang="en" suppressHydrationWarning>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange>
        <Image
        priority
        src={Logo}
        alt="Follow us on Twitter"
        className="fixed z-50 top-0 left-0 sm:w-[100px] md:w-[150px] -py-3.5"
    />
        {children}
    </ThemeProvider>
    </body>
    </html>
    );
}
