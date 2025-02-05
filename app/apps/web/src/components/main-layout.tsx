"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNavbar = !pathname?.includes("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={cn("flex-1", showNavbar && "pt-14")}>{children}</main>
    </div>
  );
}
