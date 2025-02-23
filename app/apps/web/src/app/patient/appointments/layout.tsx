import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard-layout";

export const metadata: Metadata = {
  title: "My Appointments | ChimeUp Healthcare",
  description: "View and manage your healthcare appointments with ChimeUp.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 