"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

/**
 * Client-side providers: theme management (dark / silver) + toast portal.
 * `silver` is registered as a custom theme value; `dark` is the default.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemes
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["dark", "silver"]}
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          classNames: {
            toast:
              "glass-strong !rounded-2xl !border-border !text-foreground !shadow-float",
          },
        }}
      />
    </NextThemes>
  );
}
