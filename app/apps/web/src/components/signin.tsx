"use client";
import { cn } from "@/lib/utils";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { motion } from "framer-motion";
import {IconBrandGoogle} from "@tabler/icons-react";
import { signIn } from "next-auth/react"
import {loginGrpc} from "@/app/actions";

interface SignInProps{
    setIsUser?: (value: (((prevState: boolean) => boolean) | boolean)) => void
}
export default function SignIn({setIsUser}: SignInProps) {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        let formData = new FormData(e.currentTarget);
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();
        try {
            await signIn("credentials", {
                email,
                password,
                redirect: true,
            })
        } catch (error) {
            console.log(error)
        }

        }
  return (
    <div className="pt-44 sm:pt-4 lg:pt-10 z-10 max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black min-h-lvh sm:min-h-72 md:min-h-64 lg:min-h-64">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 text-center">
        Welcome to Chime
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 text-center">
        Sign in to Chime to access all the features
      </p>

        <form className="my-8"  onSubmit={handleSubmit}>
            <LabelInputContainer className="mb-4">
                <Label htmlFor="email">Email Address</Label>
                <Input name="email" id="email" type="email" autoComplete="email"/>
            </LabelInputContainer>
            <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input name="password" id="password" placeholder="••••••••" type="password"/>
            </LabelInputContainer>
            <motion.button
                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                type="submit"
                whileHover={{scale: 1.1}}
                whileTap={{scale: 0.90}}
            >
                Sign in &rarr;
                <BottomGradient/>
            </motion.button>
            <div
                className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full"/>

            <div className="flex flex-col space-y-4">
                <motion.button
                    className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
                    type="submit"
                    whileHover={{scale: 1.1}}
                    whileTap={{scale: 0.90}}
                    onClick={() => signIn("google")}
                >
                    <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300"/>
                    <span className="text-neutral-700 dark:text-white text-sm">
                        Google
                    </span>
                    <BottomGradient/>
                </motion.button>
                <div className="flex flex-row text-sm left-0 space-x-2 ml-4">
                    <h2 className="dark:text-gray-200">
                        New to Chime?
                    </h2>
                    <button
                        onClick={ () => {
                            if (setIsUser) {
                                setIsUser(false)
                            }}}
                        className="dark:text-cyan-400 text-cyan-600">
                        Register
                    </button>
                </div>
            </div>
        </form>
    </div>
);
}

const BottomGradient = () => {
    return (
        <>
            <span
                className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"/>
            <span
                className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"/>
        </>
    );
};

const LabelInputContainer = ({
                                 children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
