"use client"
import React from 'react';

import BoxReveal from "@/components/ui/box-reveal";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {useTheme} from "next-themes";
import {logirent} from "@/lib/constants";



const words = [
    {
        text: "Site",
    },
    {
        text: "Is",
    },
    {
        text: "Under",
    },
    {
        text: "Construction",
    },
    {
        text: "Thank",
    },
    {
        text: "You",
    },
    {
        text: "For",
    },
    {
        text: "Your"
    },
    {
        text: "Patience"
    }
]

export function Hero() {
    "use client"
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    let boxColor = "#6C6EE6";
    return (
        <div className="size-full max-w-lg items-center justify-center overflow-hidden pt-8">
            <BoxReveal boxColor={boxColor} duration={0.5}>
                <p className={`text-[5.5rem] font-semibold dark:text-white ${logirent.className} antialiased`}>
                    ChimeUp<span className="text-[#5046e6]">.</span>
                </p>
            </BoxReveal>

            <BoxReveal boxColor={boxColor} duration={0.5}>
                <h2 className="mt-[.5rem] text-[1.6rem] dark:text-white">
                    A complete solution for doctors to manage {" "}
                    <span className="text-[#5046e6] dark:text-[#6C6EE6]"> patient care, treatments, and digital prescriptions.</span>
                </h2>
            </BoxReveal>

            <BoxReveal boxColor={boxColor} duration={0.5}>
                <div className="mt-6 text-[1.2rem]">

                </div>
            </BoxReveal>

            <BoxReveal boxColor={boxColor} duration={0.5}>
                <Button className="mt-[1.6rem] text-white bg-[#5046e6] dark:bg-[#6C6EE6]"
                        onClick={() => router.push("auth/signin")}>Get Started</Button>
            </BoxReveal>
        </div>
    );
}

export default Hero;