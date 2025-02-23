"use client";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";

const roleLinks = {
  patient: [
    {
      label: "Dashboard",
      href: "/patient/dashboard",
      icon: <LayoutDashboard size={20} className="flex-shrink-0" />,
    },
    {
      label: "Appointments",
      href: "/patient/appointments",
      icon: <Calendar size={20} className="flex-shrink-0" />,
    },
    {
      label: "Medical Records",
      href: "/patient/records",
      icon: <FileText size={20} className="flex-shrink-0" />,
    },
    {
      label: "Chat with AI",
      href: "/patient/chat",
      icon: <MessageSquare size={20} className="flex-shrink-0" />,
    },
  ],
  doctor: [
    {
      label: "Dashboard",
      href: "/doctor/dashboard",
      icon: <LayoutDashboard size={20} className="flex-shrink-0" />,
    },
    {
      label: "Appointments",
      href: "/doctor/appointments",
      icon: <Calendar size={20} className="flex-shrink-0" />,
    },
    {
      label: "Patients",
      href: "/doctor/patients",
      icon: <Users size={20} className="flex-shrink-0" />,
    },
  ],
  admin: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard size={20} className="flex-shrink-0" />,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <Users size={20} className="flex-shrink-0" />,
    },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const role = session?.user?.role?.toLowerCase() || "none";
  const links = roleLinks[role as keyof typeof roleLinks] || roleLinks.patient;
  const [open, setOpen] = useState(false);

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-neutral-900">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-border">
            <div
              className={cn("flex", open ? "justify-start" : "justify-center")}
            >
              {open ? (
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary flex-shrink-0" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-semibold text-xl truncate"
                  >
                    ChimeUp
                  </motion.span>
                </Link>
              ) : (
                <div className="h-8 w-8 rounded-lg bg-primary flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-8 px-4 overflow-y-auto">
            <nav className="flex flex-col space-y-2">
              {links.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={link}
                  className={cn(
                    "w-full",
                    open ? "justify-start" : "justify-center"
                  )}
                />
              ))}
            </nav>
          </div>

          {/* Settings & Profile Section */}
          <div className="border-t border-border flex-shrink-0">
            <div className="p-4">
              <SidebarLink
                link={{
                  label: "Settings",
                  href: `/${role}/settings`,
                  icon: <Settings size={20} className="flex-shrink-0" />,
                }}
                className={cn(
                  "w-full",
                  open ? "justify-start" : "justify-center"
                )}
              />
            </div>

            <div className="p-4 border-t border-border">
              <div
                className={cn(
                  "flex gap-3 mb-4",
                  open ? "flex-row items-center" : "flex-col items-center"
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || ""}
                  />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                {open && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col min-w-0 flex-1"
                  >
                    <p className="text-sm font-medium leading-none truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {role}
                    </p>
                  </motion.div>
                )}
              </div>
              <button
                onClick={() => signOut()}
                className={cn(
                  "flex items-center w-full rounded-md p-2",
                  "text-red-500 hover:text-red-600",
                  "hover:bg-red-100/10 dark:hover:bg-red-900/20",
                  "transition-colors gap-2",
                  open ? "justify-start" : "justify-center"
                )}
              >
                <LogOut size={20} className="flex-shrink-0" />
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    Sign out
                  </motion.span>
                )}
              </button>
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 overflow-y-auto p-8 bg-background rounded-l-2xl">
        {children}
      </main>
    </div>
  );
}
