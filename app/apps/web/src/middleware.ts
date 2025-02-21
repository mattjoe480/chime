import {NextResponse} from "next/server";
import {auth} from "@/auth";
import { logger } from "@/next-logger.config";
export async function middleware(request: Request) {
  const session = await auth();
  const pathname = new URL(request.url).pathname;
  if (pathname.startsWith("/auth/signin")) {
    if (session?.user) {
      logger.info(session.user)
      const role = session.user.role?.toLowerCase() || "none";
      const redirectPath = role === "none" ? "/onboarding" : `/${role}/dashboard`;
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const role = session.user.role?.toLowerCase();
  
  // Handle role-based access
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (pathname.startsWith("/doctor") && role !== "doctor") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (pathname.startsWith("/patient") && role !== "patient") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  if (pathname.startsWith("/onboarding") && role !== "none") {
    return NextResponse.redirect(new URL(`/${role}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/signin",
    "/admin/:path*",
    "/doctor/:path*",
    "/patient/:path*",
    "/onboarding/:path*",
  ],
};