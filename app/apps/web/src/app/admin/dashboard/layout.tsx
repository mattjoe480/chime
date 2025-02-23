import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard-layout";

export const metadata: Metadata = {
  title: "Admin Dashboard | ChimeUp Healthcare",
  description: "Manage your healthcare system with ChimeUp.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
