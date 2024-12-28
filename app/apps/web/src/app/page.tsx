"use client"
import Hero from "@/components/Hero";
import {AuroraBackground} from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import {Dock} from "@/components/Dock";

export default function Home() {
    return (
        <AuroraBackground className="h-screen w-full absolute top-0 left-0 flex
            items-center justify-center">
            <motion.div
                initial={{opacity: 0.0, y: 40}}
                whileInView={{opacity: 1, y: 0}}
                transition={{
                    delay: 0.3,
                    duration: 0.8,
                    ease: "easeInOut",
                }}
                className="max-w-7xl w-full"
            >
                <Hero/>
            </motion.div>
            <Dock/>
        </AuroraBackground>
  );
}
