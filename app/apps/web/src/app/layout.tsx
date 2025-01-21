import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import {ReactNode} from "react";
import {SessionProvider} from "next-auth/react";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const logirent = localFont({
    src: [
        {
            path: '../../public/fonts/logirent-regular.ttf',
            weight: '400'
        },
        {
            path: '../../public/fonts/logirent-bold.ttf',
            weight: '700'
        },
    ]
})

export const metadata: Metadata = {
    title: "Chime",
    description: "World's first AI health app",
};

export default function RootLayout({children,}: Readonly<{ children: ReactNode;
}>) {
    return (
    <html lang="en" suppressHydrationWarning>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        <SessionProvider>
            {children}
        </SessionProvider>
    </ThemeProvider>
    </body>
    </html>
    );
}
