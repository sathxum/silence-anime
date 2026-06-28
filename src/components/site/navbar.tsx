"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SearchBar } from "@/components/site/search-bar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/80 backdrop-blur-xl shadow-float"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
            <Play className="h-4 w-4 fill-current" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Silence<span className="text-primary"> Anime</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {[
            { href: "/#trending", label: "Trending" },
            { href: "/#latest", label: "Latest" },
            { href: "/#recent", label: "Recently Added" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex flex-1 items-center justify-end gap-3">
          <SearchBar className="hidden flex-1 sm:block" />
          <ThemeToggle />
        </div>
      </div>
      <div className="container pb-3 sm:hidden">
        <SearchBar />
      </div>
    </motion.header>
  );
}
