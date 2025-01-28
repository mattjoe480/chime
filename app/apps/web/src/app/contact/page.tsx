import { Metadata } from "next";
import { ContactPageClient } from "@/app/contact/contact-client";

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch with ChimeUp Healthcare",
  description:
    "Have questions? Contact ChimeUp's support team available 24/7. Reach us via email, phone, or send us a message through our contact form.",
};

export default function ContactPage() {
  return <ContactPageClient />;
}
