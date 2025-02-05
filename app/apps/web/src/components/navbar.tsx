"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { getDashboardUrl } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Hide navbar on dashboard pages
  if (pathname?.includes("/dashboard")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">ChimeUp</span>
          </Link>
        </div>

        <div className="flex items-center space-x-6">
          {session?.user && (
            <Link
              href={getDashboardUrl(session.user.role)}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
          )}

          {session?.user ? (
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-sm font-medium"
            >
              Sign Out
            </Button>
          ) : (
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-sm font-medium">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
