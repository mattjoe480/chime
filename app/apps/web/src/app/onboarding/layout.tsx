import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Your Profile | ChimeUp Healthcare",
  description:
    "Complete your profile to get the most out of ChimeUp's healthcare platform.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
