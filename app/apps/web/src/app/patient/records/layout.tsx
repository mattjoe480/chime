import { Metadata } from "next";
import { DashboardLayout } from "@/components/dashboard-layout";

export const metadata: Metadata = {
  title: "Medical Records | ChimeUp Healthcare",
  description: "Access your medical history and records with ChimeUp.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
} 