import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDashboardUrl(role?: string): string {
  const normalizedRole = role?.toLowerCase();
  switch (normalizedRole) {
    case "admin":
      return "/admin/dashboard";
    case "doctor":
      return "/doctor/dashboard";
    case "patient":
      return "/patient/dashboard";
    default:
      return "/onboarding";
  }
}
