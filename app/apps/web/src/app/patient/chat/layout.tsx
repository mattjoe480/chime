import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard-layout";

export const metadata: Metadata = {
  title: "Chat with AI | ChimeUp Healthcare",
  description: "Get instant health information and guidance from our AI assistant.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 