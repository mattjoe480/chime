"use client"
import React from 'react';
import {TypewriterEffectSmooth} from "@/components/ui/typewriter-effect";
import {HeroHighlight} from "@/components/ui/hero-highlight";
import { motion } from 'framer-motion';
import { LampContainer } from './ui/lamp';

const words = [
    {
        text: "Chime",
    },
    {
        text: "world's",
    },
    {
        text: "first",
    },
    {
        text: "ai",
    },
    {
        text: "health",
    },
    {
        text: "app",
    }
    ]

function Hero() {
    return (
        <div className="flex flex-col justify-center items-center">
            <TypewriterEffectSmooth words={words} />
        </div>
    );
}

export default Hero;