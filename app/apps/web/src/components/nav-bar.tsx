import {signOut, useSession} from "next-auth/react";
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "@/components/themeToggle";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {TbLogout} from "react-icons/tb";
import Link from "next/link";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {getDashboardUrl} from "@/lib/utils";

const getInitials = (name: string | null | undefined) => {
  if (!name) return "U";
  return name.charAt(0).toUpperCase();
};

export const NavBar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const getUserName = () => {
    if (!session?.user) return "User";
    if (session.user.name) return session.user.name;
    if (session.user.email) {
      const [username] = session.user.email.split("@");
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return "User";
  };

  const getAvatarFallback = () => {
    if (session?.user?.name) {
      return getInitials(session.user.name);
    }
    if (session?.user?.email) {
      return getInitials(session.user.email);
    }
    return "U";
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" prefetch className="flex items-center">
              <Image
                src="/assets/brand.svg"
                alt="Chime Logo"
                width={112}
                height={112}
                className="text-primary"
                draggable={false}
                priority
              />
            </Link>
            <div className="hidden items-center gap-8 md:flex">
              {session?.user && (
                <Link
                  href={getDashboardUrl(session.user.role)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/faq"
                prefetch
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                FAQ
              </Link>
              <Link
                href="/about"
                prefetch
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                About
              </Link>
              <Link
                href="/contact"
                prefetch
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="font-logirent text-2xl tracking-wide text-primary select-none">
              Chime
            </span>
          </div>
          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="text-sm">Loading...</div>
            ) : status === "authenticated" && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 border border-primary/10">
                      <AvatarImage
                        src={session?.user?.image || undefined}
                        alt={getUserName()}
                      />
                      <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  alignOffset={-4}
                  sideOffset={8}
                >
                  <div className="border-b px-2 py-2">
                    <p className="text-sm font-medium">{getUserName()}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() =>
                      router.push(getDashboardUrl(session.user.role))
                    }
                  >
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <TbLogout />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" onClick={() => router.push("/auth/signin")}>
                Sign in
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
