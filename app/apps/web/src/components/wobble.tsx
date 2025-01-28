"use client";
import Image from "next/image";
import React from "react";
import { WobbleCard } from "@/components/ui/wobble-card";

export function Wobble() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full pb-16">
      <WobbleCard containerClassName="col-span-1 min-h-[300px]">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          General Practitioner (GP)
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          GPs can view your medical history, help you book appointments, offer
          video or phone consultations, send prescriptions to pharmacies, and
          refer you to specialists when needed.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-blue-900">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Pediatrician
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Pediatricians track your child&apos;s growth and milestones, send
          vaccination reminders, offer parenting tips, and provide virtual care
          when needed..
        </p>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-orange-700">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Surgeons
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Surgeons track your surgical history, guide you with pre- and post-op
          care, share information about procedures, and help manage recovery.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-teal-900">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Endocrinologists
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Endocrinologists help manage chronic conditions like diabetes or
          thyroid issues, remind you about medications, suggest lifestyle
          changes, and provide easy access to lab results.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-purple-900">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Dentists
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Dentists track your oral health, help you book cleanings and checkups,
          give personalized treatment advice, and offer virtual consultations
          for dental concerns.
        </p>
      </WobbleCard>
      <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gray-900">
        <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
          Physiotherapists
        </h2>
        <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
          Physiotherapists create customized rehab exercises for you, track your
          progress, help with pain management, and offer virtual therapy
          sessions.
        </p>
      </WobbleCard>
    </div>
  );
}

