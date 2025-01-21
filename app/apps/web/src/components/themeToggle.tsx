"use client"

import * as React from "react"
import {Monitor, Moon, MoonIcon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
    const { setTheme } = useTheme()
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="select-none backdrop-blur-sm dark:text-white" variant="ghost" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex flex-row gap-2" onClick={() => setTheme("light")}>
                    <Sun/>
                    <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-row gap-2" onClick={() => setTheme("dark")}>
                    <Moon/>
                    <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-row gap-2" onClick={() => setTheme("system")}>
                    <Monitor/>System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
