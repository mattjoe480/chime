"use client"
import { AuroraBackground } from "@/components/ui/aurora-background"
import {Hero} from "@/components/Hero";
import {useSession} from "next-auth/react";
import Image from "next/image";
import Logo from "@/app/icons/brand.svg";
import {ThemeToggle} from "@/components/themeToggle";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {logirent} from "@/lib/constants";
import dynamic from "next/dynamic";
import {HeroGrid} from "@/components/hero-grid";
import ScrollProgress from "@/components/ui/scroll-progress";
const WorldMap =  dynamic(() => import('@/components/map'), {
    loading: () => <p>Loading...</p>,
    ssr: false,
})



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
        <>
        <AuroraBackground className="min-h-screen min-w-full absolute top-0 left-0 border-grid flex flex-1 flex-col
            items-center justify-center overflow-hidden">
            <NavigationMenu className="sm:flex flex-row grow select-none top-0 items-center justify-between fixed md:h-[3rem] h-[4rem] z-50 min-w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <NavigationMenuList className="justify-start">
                    <NavigationMenuItem className="hidden md:flex flex-row">
                        <Image
                            priority
                            src={Logo}
                            alt="Chime"
                            className="flex h-[40px] lg:h-[90px] pr-20"
                            draggable={false}
                        />
                    </NavigationMenuItem>
                    <p className={`fixed left-[45%] pt-2 justify-center items-center ${logirent.className} antialiased text-3xl select-none text-black dark:text-white`}>
                        ChimeUp
                    </p>
                </NavigationMenuList>
               <NavigationMenuList className="flex flex-1 items-center justify-between gap-2 md:justify-end mr-4">
                   <ThemeToggle/>
               </NavigationMenuList>
            </NavigationMenu>
            <ScrollProgress className="md:top-[3rem] -[4rem]" />

        </AuroraBackground>
            <div className="flex flex-col justify-start p-8 items-start w-full min-h-screen overflow-hidden">
                <Hero/>
            </div>
            <div className="z-50 flex flex-col items-center justify-center dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2]  min-h-full min-w-full overflow-y:scroll">
                <div className="items-center justify-center max-h-[70%] max-w-[70%]  pt-[10%]">
                    <HeroGrid/>
                </div>
            </div>
            <div className="z-50 dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2]  min-h-full min-w-full items-center overflow-y:scroll">
                <WorldMap/>
            </div>
            </>
    )
}