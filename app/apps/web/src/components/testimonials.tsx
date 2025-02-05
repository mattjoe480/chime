"use client";

import { useState, useEffect } from "react";
import { TbQuote, TbChevronLeft, TbChevronRight } from "react-icons/tb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    content:
      "Chime has transformed how I manage my healthcare. The ease of scheduling appointments and accessing my records is incredible.",
  },
  {
    name: "Dr. Michael Chen",
    role: "Healthcare Provider",
    content:
      "As a healthcare provider, Chime helps me stay connected with my patients and manage my practice more efficiently.",
  },
  {
    name: "Emily Rodriguez",
    role: "Patient",
    content:
      "The AI health assistant is like having a knowledgeable friend available 24/7. It's helped me make better health decisions.",
  },
];

export const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [intervalId, setIntervalId] =
    useState<ReturnType<typeof setInterval>>();

  const next = () => setCurrent((c) => (c + 1) % testimonials.length);
  const prev = () =>
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const id = setInterval(next, 5000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, []);

  const handleNavigation = (callback: () => void) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    callback();
  };

  return (
    <div className="relative py-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/3 top-1/4 h-64 w-64 animate-pulse rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute right-1/3 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="container px-4">
        <h2 className="mb-16 text-center text-4xl font-bold">
          What People Say
        </h2>

        <div className="relative mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8">
            <div className="absolute -right-6 -top-6 z-0 text-primary/10">
              <div className="h-32 w-32 rotate-12">
                <TbQuote size="100%" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="animate-in fade-in slide-in-from-right duration-500">
                <p className="mb-6 text-lg leading-relaxed">
                  {testimonials[current].content}
                </p>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {testimonials[current].name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {testimonials[current].name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[current].role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => handleNavigation(prev)}
              className="rounded-full border bg-background/80 p-2 text-muted-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background hover:text-primary"
            >
              <div className="h-6 w-6">
                <TbChevronLeft size="100%" />
              </div>
            </button>
          </div>

          <div className="absolute -right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => handleNavigation(next)}
              className="rounded-full border bg-background/80 p-2 text-muted-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-background hover:text-primary"
            >
              <div className="h-6 w-6">
                <TbChevronRight size="100%" />
              </div>
            </button>
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => handleNavigation(() => setCurrent(i))}
                className={`h-2 rounded-full transition-all hover:bg-primary/70 ${
                  i === current
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary/20 hover:w-4"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
