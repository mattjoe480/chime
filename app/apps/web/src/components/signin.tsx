"use client";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { IconBrandGoogle } from "@tabler/icons-react";
import { signIn } from "next-auth/react";
import React, { useState } from "react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { logger, loginLoadingStates } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { Turnstile } from "next-turnstile";
import { CircleX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { checkUserRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface SignInProps {
  setIsUser?: (value: ((prevState: boolean) => boolean) | boolean) => void;
}
export default function SignIn({ setIsUser }: SignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [turnstileStatus, setTurnstileStatus] = useState<
    "success" | "error" | "expired" | "required"
  >("required");

  async function loginWithGoogle() {
    try {
      setIsGoogleLoading(true);
      await signIn("google", { redirect: true });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "An error occurred during sign in. Please try again.",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const token = formData.get("cf-turnstile-response")?.toString();

    if (!token) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Verification Required",
        description: "Please complete the security check.",
      });
      return;
    }

    try {
      await signIn("credentials", {
        email,
        password,
        token,
        redirect: true,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "An error occurred during sign in. Please try again.",
      });
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-xl relative z-10">
          <CardHeader className="space-y-2 pb-8">
            <CardTitle className="text-center text-2xl">
              Welcome to Chime
            </CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to Chime to access all the features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultiStepLoader
              loadingStates={loginLoadingStates}
              loading={isLoading}
              duration={300}
              loop={false}
            />

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={loginWithGoogle}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <IconBrandGoogle className="mr-2 h-4 w-4" />
                )}
                {isGoogleLoading ? "Signing in..." : "Google"}
              </Button>

              <Turnstile
                className="flex justify-center"
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                retry="auto"
                refreshExpired="auto"
                sandbox={process.env.NODE_ENV === "development"}
                onError={() => {
                  setTurnstileStatus("error");
                  toast({
                    variant: "destructive",
                    title: "Verification Failed",
                    description: "Security check failed. Please try again.",
                  });
                }}
                onExpire={() => {
                  setTurnstileStatus("expired");
                  toast({
                    variant: "destructive",
                    title: "Verification Expired",
                    description: "Security check expired. Please verify again.",
                  });
                }}
                onLoad={() => {
                  setTurnstileStatus("required");
                }}
                onVerify={() => {
                  setTurnstileStatus("success");
                }}
              />

              <div className="text-sm text-center">
                <span className="text-muted-foreground">New to Chime? </span>
                <Button
                  variant="link"
                  className="p-0"
                  disabled={isLoading}
                  onClick={() => setIsUser?.(false)}
                >
                  Register
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
