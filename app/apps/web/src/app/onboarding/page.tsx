"use client";
import { OnboardingClient } from "./onboarding-client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface OnboardingFormData {
  userType: "patient" | "doctor";
  dateOfBirth?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  currentMedications?: string;
  medicalLicense?: string;
  specialization?: string;
  yearsOfExperience?: string;
  hospitalAffiliation?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: OnboardingFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Profile created successfully",
        });

        // Redirect to the appropriate dashboard
        router.push(result.redirectTo);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Something went wrong",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete onboarding",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <OnboardingClient />;
}
