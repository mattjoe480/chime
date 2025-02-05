"use client";
import Signup from "@/components/signup";
import SignIn from "@/components/signin";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { useState } from "react";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isUser, setIsUser] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user && !isRedirecting) {
      setIsRedirecting(true);
      console.log("Session:", session);
      console.log("User role:", session.user.role);

      const role = session.user.role?.toLowerCase() || "none";
      const redirectPath =
        {
          none: "/onboarding",
          patient: "/patient/dashboard",
          doctor: "/doctor/dashboard",
          admin: "/admin/dashboard",
        }[role] || "/auth/signin";

      router.push(redirectPath);
    }
  }, [session, status, router, isRedirecting]);

  // Show loading state while checking session or during redirect
  if (status === "loading" || isRedirecting) {
    return (
      <AuroraBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuroraBackground>
    );
  }

  // Show sign in/signup forms if not authenticated
  return (
    <AuroraBackground>
      {isUser ? (
        <SignIn setIsUser={setIsUser} />
      ) : (
        <Signup setIsUser={setIsUser} />
      )}
    </AuroraBackground>
  );
}
