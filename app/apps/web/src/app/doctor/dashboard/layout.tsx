import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard-layout";

export const metadata: Metadata = {
  title: "Doctor Dashboard | ChimeUp Healthcare",
  description: "Manage your patients and appointments with ChimeUp.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
