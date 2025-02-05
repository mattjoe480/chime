"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { IconBrandGoogle } from "@tabler/icons-react";
import { signIn } from "next-auth/react";
import { registerGrpc } from "@/app/actions";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { registerLoadingStates } from "@/lib/constants";
import { SignInResponse } from "@/lib/types";
import { Turnstile } from "next-turnstile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleX } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SignupProps {
  setIsUser?: (value: ((prevState: boolean) => boolean) | boolean) => void;
}

export default function Signup({ setIsUser }: SignupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [turnstileStatus, setTurnstileStatus] = useState<
    "success" | "error" | "expired" | "required"
  >("required");
  const [error, setError] = useState<string | null>(null);

  async function handleError(signinError: SignInResponse) {
    console.log(signinError);
    if (
      signinError.fields &&
      signinError.fields.length > 0 &&
      !signinError.isServerError
    ) {
      for (let i = 0; i < signinError.fields.length; i++) {
        switch (signinError.fields[i]) {
          case "name":
            // @ts-ignore
            setNameError(signinError.error[i]);
            break;
          case "email":
            // @ts-ignore
            setEmailError(signinError.error[i]);
            break;
          case "password":
            // @ts-ignore
            setPasswordError(signinError.error[i]);
            break;
        }
      }
    }
    if (signinError.isServerError) {
      let err = signinError.fields!.at(0) as string;
      err = err.replace("_", " ").toLowerCase();
      setServerError(err.charAt(0).toUpperCase() + err.slice(1));
    }
  }
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setServerError("");
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    let token = formData.get("cf-turnstile-response")?.toString();
    if (token === undefined || token === "") {
      setIsLoading(false);
      setServerError("Please complete the security check");
      return;
    }
    await registerGrpc(formData)
      .then((response) => {
        if (!response.isError && !response.isServerError) {
          setTimeout(() => {
            setIsLoading(false);
            if (setIsUser) setIsUser(true);
          }, 2500);
        } else {
          setIsLoading(false);
          handleError(response);
        }
      })
      .catch((_error) => {
        setIsLoading(false);
        alert("Please contact the developer!");
      });
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
              Sign up to Chime to access all the features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MultiStepLoader
              loadingStates={registerLoadingStates}
              loading={isLoading}
              duration={300}
              loop={false}
            />

            <form className="space-y-4" onSubmit={handleSubmit}>
              {serverError !== "" && (
                <Alert variant="destructive">
                  <CircleX className="h-4 w-4" />
                  <AlertTitle>Cannot register</AlertTitle>
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input name="name" id="name" type="text" autoComplete="name" />
                {nameError !== "" && (
                  <span className="text-sm text-destructive">{nameError}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  autoComplete="email"
                />
                {emailError !== "" && (
                  <span className="text-sm text-destructive">{emailError}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                />
                {passwordError !== "" && (
                  <span className="text-sm text-destructive">
                    {passwordError}
                  </span>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing up...
                  </>
                ) : (
                  "Sign up"
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
                onClick={() => signIn("google")}
              >
                <IconBrandGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>

              <Turnstile
                className="flex justify-center"
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                retry="auto"
                refreshExpired="auto"
                sandbox={process.env.NODE_ENV === "development"}
                onError={() => {
                  setTurnstileStatus("error");
                  setServerError("Security check failed. Please try again.");
                }}
                onExpire={() => {
                  setTurnstileStatus("expired");
                  setServerError(
                    "Security check expired. Please verify again."
                  );
                }}
                onLoad={() => {
                  setTurnstileStatus("required");
                  setError(null);
                }}
                onVerify={() => {
                  setTurnstileStatus("success");
                  setError(null);
                }}
              />

              <div className="text-sm text-center">
                <span className="text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <Button
                  variant="link"
                  className="p-0"
                  disabled={isLoading}
                  onClick={() => setIsUser?.(true)}
                >
                  Login
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
