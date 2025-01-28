"use client";

import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQPageClient() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 blur-[128px]" />
          <div className="absolute -right-1/4 top-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-purple-500/20 blur-[128px]" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-cyan-500/20 blur-[128px]" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-24">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-center text-4xl font-bold">
              Frequently Asked Questions
            </h1>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              Find answers to common questions about Chime&apos;s healthcare
              platform and services.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              {/* General Questions */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">General</h2>
                <Accordion type="single" collapsible>
                  <AccordionItem value="what-is-chime">
                    <AccordionTrigger>
                      What is Chime Healthcare?
                    </AccordionTrigger>
                    <AccordionContent>
                      Chime is a comprehensive digital healthcare platform that
                      connects patients with healthcare providers, manages
                      medical records, and provides AI-powered health
                      assistance, all in one harmonious ecosystem.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="how-get-started">
                    <AccordionTrigger>How do I get started?</AccordionTrigger>
                    <AccordionContent>
                      Simply sign up using your email or Google account,
                      complete your health profile, and you can immediately
                      start booking appointments, accessing health records, and
                      using our services.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cost">
                    <AccordionTrigger>What does it cost?</AccordionTrigger>
                    <AccordionContent>
                      Basic services are free. Premium features are available
                      through subscription plans or may be covered by your
                      insurance provider. Contact us for detailed pricing
                      information.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Appointments & Services */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Appointments & Services
                </h2>
                <Accordion type="single" collapsible>
                  <AccordionItem value="schedule-appointment">
                    <AccordionTrigger>
                      How do I schedule an appointment?
                    </AccordionTrigger>
                    <AccordionContent>
                      Log in to your account, browse available healthcare
                      providers, select your preferred time slot, and confirm
                      your appointment. You&apos;ll receive an email
                      confirmation immediately.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cancel-reschedule">
                    <AccordionTrigger>
                      Can I cancel or reschedule appointments?
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes, you can cancel or reschedule appointments up to 24
                      hours before the scheduled time without any penalty. Use
                      the appointments section in your dashboard.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="virtual-visits">
                    <AccordionTrigger>
                      How do virtual visits work?
                    </AccordionTrigger>
                    <AccordionContent>
                      Virtual visits are conducted through our secure video
                      platform. You&apos;ll receive a link before your
                      appointment, and can join from any device with a camera
                      and internet connection.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Health Records & Privacy */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Health Records & Privacy
                </h2>
                <Accordion type="single" collapsible>
                  <AccordionItem value="data-security">
                    <AccordionTrigger>
                      How secure is my health data?
                    </AccordionTrigger>
                    <AccordionContent>
                      We employ enterprise-grade security measures and are fully
                      HIPAA compliant. Your data is encrypted both in transit
                      and at rest, with regular security audits and updates.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="access-records">
                    <AccordionTrigger>
                      How can I access my health records?
                    </AccordionTrigger>
                    <AccordionContent>
                      Your health records are available 24/7 through your secure
                      patient portal. You can view, download, and share records
                      with healthcare providers as needed.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="share-records">
                    <AccordionTrigger>
                      Can I share my records with other providers?
                    </AccordionTrigger>
                    <AccordionContent>
                      Yes, you can securely share your records with any
                      healthcare provider through our platform. You control who
                      has access to your information and for how long.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Insurance & Billing */}
              <div>
                <h2 className="mb-4 text-2xl font-semibold">
                  Insurance & Billing
                </h2>
                <Accordion type="single" collapsible>
                  <AccordionItem value="insurance-accepted">
                    <AccordionTrigger>
                      What insurance plans do you accept?
                    </AccordionTrigger>
                    <AccordionContent>
                      We work with most major insurance providers. You can
                      verify your coverage during registration or contact our
                      support team for specific insurance-related questions.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="billing-process">
                    <AccordionTrigger>How does billing work?</AccordionTrigger>
                    <AccordionContent>
                      We handle insurance claims directly and provide
                      transparent cost estimates before appointments. You can
                      view and pay bills through your patient portal.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="payment-options">
                    <AccordionTrigger>
                      What payment options are available?
                    </AccordionTrigger>
                    <AccordionContent>
                      We accept all major credit cards, HSA/FSA cards, and offer
                      flexible payment plans. Contact our billing department to
                      discuss payment options.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>

            {/* Contact Section */}
            <div className="mt-16 text-center">
              <h2 className="mb-4 text-2xl font-semibold">
                Still have questions?
              </h2>
              <p className="mb-8 text-muted-foreground">
                Our support team is here to help you 24/7.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="mailto:support@chimeup.in"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <span>support@chimeup.in</span>
                </a>
                <span className="text-muted-foreground">|</span>
                <a
                  href="tel:1-800-HEALTH"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <span>1-800-HEALTH</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
