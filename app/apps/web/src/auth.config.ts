import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import {ZodError} from "zod";

export default { providers: [

        Google,
        Credentials({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type: "email", placeholder: "Email"},
                password: {label: "Password", type: "password"}
            },

            // @ts-ignore
            authorize: async (credentials) => {
                try {
                    const {email, password} =credentials
                    const response = await fetch("http://localhost:3000/api/login", {
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({email, password}),
                        method: "POST"
                    });
                    if (!response.ok) return null
                    const user = await response.json();
                    if (!user) return null
                    if (user.status === 0) return {
                        id: user.uid,
                        email: user.email
                    };
                    return null;
                } catch (error) {
                    if (error instanceof ZodError) {
                        return null
                    }
                }
            }
        })
    ],
    trustHost: true,
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "auth/signin",
    },
} satisfies NextAuthConfig