import { Metadata } from "next";
import { FAQPageClient } from "@/app/faq/faq-client";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | ChimeUp Healthcare",
  description:
    "Find answers to common questions about ChimeUp's healthcare platform, appointments, billing, and services. Get the support you need.",
};

export default function FAQPage() {
  return <FAQPageClient />;
}
