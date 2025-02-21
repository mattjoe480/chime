"use client";

import {NavBar} from "@/components/nav-bar";
import {Footer} from "@/components/footer";

// Move all the component code here
export function AboutPageClient() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-background">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute -left-1/4 -top-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-b from-[#020404] via-[#01476e] to-[#006caa] blur-[128px]" />
          <div className="absolute -right-1/4 top-1/4 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-b from-[#020404] via-[#01476e] to-[#006caa] blur-[128px]" />
          <div className="absolute -bottom-1/4 -left-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-b from-[#020404] via-[#01476e] to-[#006caa] blur-[128px]" />

        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-24">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-center text-4xl font-bold">About Chime</h1>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              Revolutionizing healthcare through technology and innovation
            </p>

            {/* Mission Section */}
            <section className="mb-16">
              <h2 className="mb-6 text-2xl font-semibold">Our Mission</h2>
              <p className="text-muted-foreground">
                At Chime, we&apos;re on a mission to make healthcare more
                accessible, efficient, and personalized through innovative
                technology solutions. We believe everyone deserves seamless
                access to quality healthcare services.
              </p>
            </section>

            {/* Vision Section */}
            <section className="mb-16">
              <h2 className="mb-6 text-2xl font-semibold">Our Vision</h2>
              <p className="text-muted-foreground">
                We envision a future where healthcare is truly patient-centric,
                powered by AI and technology, yet deeply human in its approach.
                Chime aims to be at the forefront of this healthcare revolution.
              </p>
            </section>

            {/* Values Section */}
            <section className="mb-16">
              <h2 className="mb-6 text-2xl font-semibold">Our Values</h2>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-lg border p-6">
                  <h3 className="mb-3 font-semibold">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    Continuously pushing boundaries to improve healthcare
                    delivery through technology.
                  </p>
                </div>
                <div className="rounded-lg border p-6">
                  <h3 className="mb-3 font-semibold">Accessibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Making quality healthcare available to everyone, anywhere,
                    anytime.
                  </p>
                </div>
                <div className="rounded-lg border p-6">
                  <h3 className="mb-3 font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Maintaining the highest standards of data protection and
                    patient privacy.
                  </p>
                </div>
                <div className="rounded-lg border p-6">
                  <h3 className="mb-3 font-semibold">Empathy</h3>
                  <p className="text-sm text-muted-foreground">
                    Putting patients first and understanding their unique
                    healthcare needs.
                  </p>
                </div>
              </div>
            </section>

            {/* Team Section */}
            <section className="mb-16">
              <h2 className="mb-6 text-2xl font-semibold">Our Team</h2>
              <p className="text-muted-foreground">
                Chime is powered by a dedicated team of healthcare
                professionals, technologists, and innovators committed to
                transforming the healthcare experience.
              </p>
            </section>

            {/* Contact Section */}
            <section className="text-center">
              <h2 className="mb-4 text-2xl font-semibold">Get in Touch</h2>
              <p className="mb-8 text-muted-foreground">
                Want to learn more about Chime? We&apos;d love to hear from you.
              </p>
              <div className="flex justify-center gap-4">
                <a
                  href="mailto:contact@chimeup.in"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <span>contact@chimeup.in</span>
                </a>
                <span className="text-muted-foreground">|</span>
                <a
                  href="tel:1-800-HEALTH"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <span>1-800-HEALTH</span>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
