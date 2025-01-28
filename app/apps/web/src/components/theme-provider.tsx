"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="theme-transition">{children}</div>;
  }

  return (
    <NextThemesProvider {...props}>
      <div className="theme-transition animate-theme-glow">{children}</div>
    </NextThemesProvider>
  );
}
