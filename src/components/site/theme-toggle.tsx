"use client";

import { useTheme } from "next-themes";
import { Moon, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Toggles between the two premium themes:
 *  - "dark"   : near-black + silver glow
 *  - "silver" : light silver + white luxury
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isSilver = theme === "silver";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isSilver ? "dark" : "silver")}
      className={cn(
        "group relative inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card/60 px-1 backdrop-blur transition-colors hover:border-primary/50",
        className,
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-all",
          !isSilver && "bg-primary text-primary-foreground shadow-glow",
        )}
      >
        <Moon className="h-4 w-4" />
      </span>
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full transition-all",
          isSilver && "bg-primary text-primary-foreground shadow",
        )}
      >
        <Sparkles className="h-4 w-4" />
      </span>
      {!mounted && <span className="sr-only">Loading theme</span>}
    </button>
  );
}
