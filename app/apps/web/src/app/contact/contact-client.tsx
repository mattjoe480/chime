"use client";

import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TbMail, TbPhone, TbMapPin, TbClock } from "react-icons/tb";

export function ContactPageClient() {
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
          <div className="mx-auto max-w-5xl">
            <h1 className="mb-8 text-center text-4xl font-bold">Contact Us</h1>
            <p className="mb-12 text-center text-lg text-muted-foreground">
              Have questions? We&apos;d love to hear from you. Send us a message
              and we&apos;ll respond as soon as possible.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Contact Form */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className="mb-6 text-2xl font-semibold">Send a Message</h2>
                <form className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Your Name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email Address"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Input
                      type="text"
                      placeholder="Subject"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Your Message"
                      className="min-h-[150px] w-full"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="mb-6 text-2xl font-semibold">Get in Touch</h2>
                  <p className="text-muted-foreground">
                    Have questions about our services? Reach out to us through
                    any of these channels.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <TbMail className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        <a
                          href="mailto:support@chimeup.in"
                          className="hover:text-primary"
                        >
                          support@chimeup.in
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <TbPhone className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p className="text-sm text-muted-foreground">
                        <a
                          href="tel:1-800-HEALTH"
                          className="hover:text-primary"
                        >
                          1-800-HEALTH
                        </a>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Available 24/7 for urgent matters
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <TbMapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Location</h3>
                      <p className="text-sm text-muted-foreground">
                        123 Medical Center Dr.
                        <br />
                        San Francisco, CA 94143
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <TbClock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Business Hours</h3>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
