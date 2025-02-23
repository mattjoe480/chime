"use client";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger,} from "@/components/ui/accordion";
import {
  TbBellRinging,
  TbCalendar,
  TbCalendarStats,
  TbDeviceMobile,
  TbMessageChatbot,
  TbMessages,
  TbReportAnalytics,
  TbShieldLock,
  TbStethoscope,
  TbUserCircle,
} from "react-icons/tb";
import {NavBar} from "@/components/nav-bar";
import {Footer} from "@/components/footer";
import {StatsSection} from "@/components/counter-stats";
import {TestimonialsSection} from "@/components/testimonials";
import Script from "next/script";
import {useRouter} from "next/navigation";
import ScrollProgress from "@/components/ui/scroll-progress";
import {ShineBorder} from "@/components/ui/shine-border";

const FAQSection = () => {
  return (
    <div className="relative py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-48 w-48 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-8 text-3xl font-bold">Common Questions</h2>
        <Accordion type="single" collapsible className="text-left">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              How do I schedule an appointment?
            </AccordionTrigger>
            <AccordionContent>
              Simply log in to your account, browse available healthcare
              providers, select your preferred time slot, and confirm your
              appointment. You&apos;ll receive an email confirmation
              immediately.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Is my medical data secure?</AccordionTrigger>
            <AccordionContent>
              Yes, we take data security seriously. All medical records are
              encrypted and stored securely following HIPAA guidelines. We use
              industry-leading security measures to protect your information.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-8">
          <a
            href="/faq"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <span>View all FAQs</span>
            <i className="fas fa-arrow-right" />
          </a>
        </div>
      </div>
    </div>
  );
};

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      icon: TbStethoscope,
      title: "Connect with Healthcare Providers",
      description:
        "Browse through our network of qualified healthcare professionals and find the perfect match for your needs.",
      detail: [
        "Search by specialty, location, or availability",
        "Read patient reviews and ratings",
        "View detailed provider profiles and credentials",
        "Compare different healthcare providers",
      ],
    },
    {
      icon: TbCalendarStats,
      title: "Schedule Your Care",
      description:
        "Book appointments instantly and manage your healthcare schedule with ease.",
      detail: [
        "Real-time availability checking",
        "Instant appointment confirmation",
        "Automated reminders and notifications",
        "Easy rescheduling options",
      ],
    },
    {
      icon: TbMessages,
      title: "Communicate Securely",
      description:
        "Stay connected with your healthcare team through our secure messaging platform.",
      detail: [
        "HIPAA-compliant messaging",
        "Share documents and test results",
        "Video consultation options",
        "Direct access to your care team",
      ],
    },
    {
      icon: TbReportAnalytics,
      title: "Track Your Progress",
      description:
        "Monitor your health journey with comprehensive tracking and analytics.",
      detail: [
        "Personal health dashboard",
        "Progress tracking and insights",
        "Medication reminders",
        "Health goal monitoring",
      ],
    },
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [steps.length]);
  return (
    <div className="relative py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/4 h-64 w-64 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-1/3 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="container px-4">
        <h2 className="mb-16 text-center text-4xl font-bold">
          How Chime Works
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  key={index}
                  className={`group w-full rounded-lg border p-4 text-left transition-all duration-300 ${
                    activeStep === index
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-full p-2 transition-colors ${
                        activeStep === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/20"
                      }`}
                    >
                      <div className="h-6 w-6">
                        <Icon size="100%" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
            <div className="relative">
              {steps[activeStep].detail.map((item, index) => (
                <div
                  key={index}
                  className="mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-500"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const router = useRouter();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ChimeUp Healthcare",
    url: "https://chimeup.in",
    logo: "https://chimeup.in/logo.png",
    sameAs: [
      "https://twitter.com/chimeup",
      "https://facebook.com/chimeup",
      "https://linkedin.com/company/chimeup",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "1-800-HEALTH",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };

  return (
    <div className="relative">
      <ScrollProgress />
      <NavBar />
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 overflow-hidden bg-background">
          <div className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-b from-[#020404] via-[#01476e] to-[#006caa] blur-[128px]" />
            <div className="absolute -right-1/4 top-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-b from-[#020404] via-[#01476e] to-[#006caa] blur-[128px]" />
            <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-b from-[#020404] via-[#01476e] to-[#006caa] blur-[128px]" />
          </div>

          <main className="relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="py-16 sm:py-24">
                <div className="relative mb-20 text-center">
                  <div className="absolute inset-0 -z-10">
                    <div className="absolute left-1/4 top-0 h-72 w-72 animate-pulse rounded-full bg-blue-500/20 blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 h-72 w-72 animate-pulse rounded-full bg-purple-500/20 blur-3xl" />
                  </div>

                  <h1 className="relative mb-6 text-6xl font-bold tracking-tight sm:text-7xl">
                    <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      Healthcare
                    </span>{" "}
                    <br />
                    in Perfect Harmony
                  </h1>
                  <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                  Experience AI-powered healthcare tailored to your life.
                   Chime uses smart technology to simplify appointments, connect you with experts, and manage your health effortlessly.
                  </p>
                </div>

                <section className="mb-24">
                  <StatsSection />
                </section>

                <section className="mb-24">
                  <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <ShineBorder
                      className="pointer-events-none bg-gradient-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent p-[1px]"
                      color={["#3B82F6", "#10B981", "#8B5CF6"]}
                    >
                      <Card className="h-full w-full group relative overflow-hidden border-muted/40 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <CardHeader className="relative backdrop-blur-sm">
                          <CardTitle className="flex items-center gap-2">
                            <div className="h-5 w-5 text-primary">
                              <TbCalendar size="100%" />
                            </div>
                            Gene Based Analysis
                          </CardTitle>
                          <CardDescription>
                          Genetic Insights: AI-powered analysis predicting health risks based on your unique DNA.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </ShineBorder>

                    <ShineBorder
                      className="pointer-events-none bg-gradient-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent p-[1px]"
                      color={["#06B6D4", "#8B5CF6", "#F59E0B"]}
                    >
                      <Card className="h-full w-full group relative overflow-hidden border-muted/40 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <CardHeader className="relative backdrop-blur-sm">
                          <CardTitle className="flex items-center gap-2">
                            <div className="h-5 w-5 text-primary">
                              <TbMessageChatbot size="100%" />
                            </div>
                            AI Health Assistant
                          </CardTitle>
                          <CardDescription>
                            Get instant answers to health queries and
                            preliminary assessments through our AI chat system.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </ShineBorder>

                    <ShineBorder
                      className="pointer-events-none bg-gradient-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent p-[1px]"
                      color={["#8B5CF6", "#F59E0B", "#3B82F6"]}
                    >
                      <Card className="h-full w-full group relative overflow-hidden border-muted/40 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <CardHeader className="relative backdrop-blur-sm">
                          <CardTitle className="flex items-center gap-2">
                            <div className="h-5 w-5 text-primary">
                              <TbDeviceMobile size="100%" />
                            </div>
                            Digital Health Records
                          </CardTitle>
                          <CardDescription>
                            Access your medical history and track your health
                            progress anytime, anywhere.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </ShineBorder>

                    <ShineBorder
                      className="pointer-events-none bg-gradient-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent p-[1px]"
                      color={["#10B981", "#3B82F6", "#EC4899"]}
                    >
                      <Card className="h-full w-full group relative overflow-hidden border-muted/40 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <CardHeader className="relative backdrop-blur-sm">
                          <CardTitle className="flex items-center gap-2">
                            <div className="h-5 w-5 text-primary">
                              <TbBellRinging size="100%" />
                            </div>
                            Smart Notifications
                          </CardTitle>
                          <CardDescription>
                            Receive timely reminders for appointments,
                            medications, and health check-ups.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </ShineBorder>

                    <ShineBorder
                      className="pointer-events-none bg-gradient-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent p-[1px]"
                      color={["#F59E0B", "#06B6D4", "#8B5CF6"]}
                    >
                      <Card className="h-full w-full group relative overflow-hidden border-muted/40 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <CardHeader className="relative backdrop-blur-sm">
                          <CardTitle className="flex items-center gap-2">
                            <div className="h-5 w-5 text-primary">
                              <TbUserCircle size="100%" />
                            </div>
                            Expert Care
                          </CardTitle>
                          <CardDescription>
                            Connect with qualified healthcare professionals
                            specialized in various fields.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </ShineBorder>

                    <ShineBorder
                      className="pointer-events-none bg-gradient-to-b from-primary/80 to-primary/20 bg-clip-text text-transparent p-[1px]"
                      color={["#EC4899", "#8B5CF6", "#10B981"]}
                    >
                      <Card className="h-full w-full group relative overflow-hidden border-muted/40 transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <CardHeader className="relative backdrop-blur-sm">
                          <CardTitle className="flex items-center gap-2">
                            <div className="h-5 w-5 text-primary">
                              <TbShieldLock size="100%" />
                            </div>
                            Secure & Private
                          </CardTitle>
                          <CardDescription>
                            Your health data is protected with enterprise-grade
                            security and HIPAA compliance.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </ShineBorder>
                  </div>
                </section>

                <section className="mb-24">
                  <HowItWorks />
                </section>

                <section className="mb-24">
                  <div className="relative rounded-2xl bg-gradient-to-b from-background/80 to-background p-8 text-center backdrop-blur-sm">
                    <div className="absolute inset-0 -z-10">
                      <div className="absolute left-1/3 top-0 h-40 w-40 animate-pulse rounded-full bg-cyan-500/20 blur-2xl" />
                      <div className="absolute bottom-0 right-1/3 h-40 w-40 animate-pulse rounded-full bg-blue-500/20 blur-2xl" />
                    </div>

                    <h2 className="mb-6 text-4xl font-bold">
                      Ready to take control of your health?
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                      Join thousands of people who trust us with their
                      healthcare needs.
                    </p>
                    <Button
                      size="lg"
                      className="bg-primary/90 px-8 hover:bg-primary"
                      onClick={() => router.push("/auth/signin")}
                    >
                      Get Started Now
                    </Button>
                  </div>
                </section>

                <section className="mb-24">
                  <FAQSection />
                </section>

                <section className="mb-24">
                  <TestimonialsSection />
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Footer />
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default Home;
