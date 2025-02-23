"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide navbar on patient, doctor, and admin pages
  const hideNavbarPaths = ['/patient/', '/doctor/', '/admin/'];
  const showNavbar = !hideNavbarPaths.some(path => pathname?.startsWith(path));

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className={cn("flex-1", showNavbar && "pt-14")}>{children}</main>
    </div>
  );
}
