import { Metadata } from "next";
import { AboutPageClient } from "@/app/about/about-client";

export const metadata: Metadata = {
  title: "About ChimeUp - Our Mission and Vision | ChimeUp Healthcare",
  description:
    "Learn about ChimeUp's mission to transform healthcare through AI and technology. Discover how we're making healthcare more accessible and efficient.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
