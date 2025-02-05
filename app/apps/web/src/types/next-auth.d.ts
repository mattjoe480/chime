import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    chime_access_token: string;
    chime_refresh_token: string;
    role?: string;
  }

  interface Session {
    user: User;
    error?: "RefreshAccessTokenError";
    redirectPath?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    chime_access_token: string;
    chime_refresh_token: string;
    error?: "RefreshAccessTokenError";
    role?: string;
    redirectPath?: string;
  }
} 