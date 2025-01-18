"use client"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { motion } from "framer-motion"
import Hero from "@/components/Hero";
import {useRouter} from "next/navigation";
import {useSession} from "next-auth/react";
import { Dock } from "@/components/Dock";


// @ts-ignore
export default function Home() {
    const { data: session, status } = useSession();
    if (status === "loading") {
        console.log("Login loading");
    }
    else if(status === "unauthenticated") {
        console.log("Login unauthenticated");
    }
    else{
        console.log("Login authenticated");
        console.log(session)
    }
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
    )
}