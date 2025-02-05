import {CredentialsSignin, type NextAuthConfig} from "next-auth"
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import {logger} from "@/lib/constants";
import {validateTurnstileToken} from "next-turnstile";
import {v4} from "uuid";
import {jwtDecode} from "jwt-decode";

async function refreshToken(token: string) {
  const response = await fetch(`${process.env.URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({refresh_token: token})
  });
  return response.json();
}

export default {
  providers: [
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: {label: "Email", type: "email", placeholder: "Email"},
        password: {label: "Password", type: "password"},
        token: {label: "cf-turnstile-response", type: "text"}
      },

      // @ts-ignore
      authorize: async (credentials) => {
        const {email, password, token} = credentials;
        console.debug(email, password, token);
        if (token === undefined || token === null || typeof token !== 'string') {
          return null;
        }
        const validationResponse = await validateTurnstileToken({
          token: token,
          secretKey: process.env.TURNSTILE_SECRET_KEY!,
          idempotencyKey: v4(),
          sandbox: process.env.NODE_ENV === "development",
        });

        if (!validationResponse.success) {
          throw new CredentialsSignin("Please verify that you are a human");
        }
        const url = process.env.URL + '/api/login/credentials';
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({email, password}),
          method: "POST"
        });
        if (!response.ok) {
          const error = await response.text()
          console.log(`Login failed: ${error || "Internal server error"}`);
          throw new CredentialsSignin("Cannot connect to the server");
        }
        const user = await response.json();
        console.log(user);
        if (!user || typeof user !== 'object') {
          console.log("Invalid response from server");
          throw new CredentialsSignin("Invalid response from server");
        }
        if (user.status === 0 && user.error_message === '') return {
          id: user.uid,
          email: user.email,
          access_token: user.access_token,
          refresh_token: user.refresh_token
        };
        throw new CredentialsSignin("InvalidCredentials Username/Password");
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
  callbacks: {
    async jwt({token, user, account}) {
      // Initial sign in with Google
      if (account?.provider === "google" && user) {
        const { access_token, expires_in, expires_at, provider, providerAccountId } = account;
        const url = process.env.URL + '/api/login/google';
        
        try {
          const response = await fetch(url, {
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              oauth_token: access_token,
              expires_in,
              expires_at,
              providerAccountId,
              provider
            }),
            method: "POST"
          });

          if (response.ok) {
            const data = await response.json();
            if (!data.error) {
              token.chime_access_token = data.access_token;
              token.chime_refresh_token = data.refresh_token;
              token.id = data.uid;
              
              // Check role
              const roleResponse = await fetch(
                `${process.env.URL}/api/role?email=${encodeURIComponent(user.email!)}`
              );
              const roleData = await roleResponse.json();
              console.log("Role data:", roleData);
              token.role = roleData.role;
            }
          }
        } catch (error) {
          console.error("Error in Google auth:", error);
        }
      }

      // Initial sign in with credentials
      if (user && account?.provider === "credentials") {
        token.id = user.id;
        token.email = user.email;
        // @ts-ignore
        token.chime_access_token = user.access_token;
        // @ts-ignore
        token.chime_refresh_token = user.refresh_token;
        
        try {
          const roleResponse = await fetch(
            `${process.env.URL}/api/role?email=${encodeURIComponent(user.email!)}`
          );
          const roleData = await roleResponse.json();
          console.log("Role data:", roleData);
          token.role = roleData.role;
        } catch (error) {
          console.error("Error checking role:", error);
        }
      }

      console.log("JWT token:", token);
      return token;
    },

    async session({session, token}) {
      if (token) {
        // @ts-ignore
        session.user.id = token.id;
        // @ts-ignore
        session.user.email = token.email;
        // @ts-ignore
        session.user.chime_access_token = token.chime_access_token;
        // @ts-ignore
        session.user.chime_refresh_token = token.chime_refresh_token;
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.error = token.error;

        console.log("Session user ID:", session.user.id);
      }
      console.log("Session:", session);
      return session;
    },

    async redirect({ url, baseUrl }) {
      return `${baseUrl}/auth/signin`;
    }
  },
  debug: false
} satisfies NextAuthConfig