"use client";

import { useState } from "react";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function OnboardingClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [userType, setUserType] = useState<"patient" | "doctor">("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        userType,
        dateOfBirth: formData.get("dateOfBirth"),
        emergencyContactName: formData.get("emergencyContactName"),
        emergencyContactPhone: formData.get("emergencyContactPhone"),
        medicalConditions: formData.get("medicalConditions"),
        currentMedications: formData.get("currentMedications"),
        medicalLicense: formData.get("medicalLicense"),
        specialization: formData.get("specialization"),
        yearsOfExperience: formData.get("yearsOfExperience"),
        hospitalAffiliation: formData.get("hospitalAffiliation"),
      };

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully completed.",
      });

      // Redirect based on user type
      if (userType === "patient") {
        router.push("/patient/dashboard");
      } else {
        router.push("/doctor/dashboard");
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <NavBar />

      {/* Gradient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-blue-500/30 blur-[130px]" />
        <div className="absolute -right-1/4 top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-500/30 blur-[130px]" />
        <div className="absolute -bottom-1/4 -left-1/4 h-[700px] w-[700px] animate-pulse rounded-full bg-cyan-500/30 blur-[130px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-24 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl"
        >
          <Card className="min-h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-center">
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-center">
                Help us personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <form className="space-y-6 flex-grow flex flex-col" onSubmit={handleSubmit}>
                <div className="flex-grow">
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-lg font-semibold">I am a...</h2>
                      </div>
                      <Select
                        value={userType}
                        onValueChange={(value: "patient" | "doctor") =>
                          setUserType(value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient">Patient</SelectItem>
                          <SelectItem value="doctor">
                            Healthcare Provider
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="pt-4">
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="w-full"
                        >
                          Continue
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && userType === "patient" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label>Date of Birth</Label>
                        <Input name="dateOfBirth" type="date" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Emergency Contact</Label>
                        <Input
                          name="emergencyContactName"
                          placeholder="Contact Name"
                          required
                        />
                        <Input
                          name="emergencyContactPhone"
                          placeholder="Contact Phone"
                          required
                        />
                      </div>
                      <div>
                        <Label>Medical Conditions (if any)</Label>
                        <Textarea
                          name="medicalConditions"
                          placeholder="List any existing medical conditions"
                        />
                      </div>
                      <div>
                        <Label>Current Medications</Label>
                        <Textarea
                          name="currentMedications"
                          placeholder="List any medications you're currently taking"
                        />
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && userType === "doctor" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label>Medical License Number</Label>
                        <Input name="medicalLicense" required />
                      </div>
                      <div>
                        <Label>Specialization</Label>
                        <Select name="specialization">
                          <SelectTrigger>
                            <SelectValue placeholder="Select your specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">
                              General Medicine
                            </SelectItem>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="pediatrics">Pediatrics</SelectItem>
                            <SelectItem value="orthopedics">
                              Orthopedics
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Years of Experience</Label>
                        <Input
                          name="yearsOfExperience"
                          type="number"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label>Hospital/Clinic Affiliation</Label>
                        <Input name="hospitalAffiliation" required />
                      </div>
                    </motion.div>
                  )}
                </div>

                {step === 2 && (
                  <div className="flex gap-4 mt-auto pt-4">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="w-full"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Complete Profile"
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
