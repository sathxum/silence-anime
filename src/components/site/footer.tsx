import Link from "next/link";
import { Play, Heart } from "lucide-react";
import type { Disclaimer } from "@/types";

export function Footer({ disclaimers = [] }: { disclaimers?: Disclaimer[] }) {
  return (
    <footer className="mt-24 border-t border-border bg-card/40">
      <div className="container py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
                <Play className="h-4 w-4 fill-current" />
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight">
                Silence<span className="text-primary"> Anime</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              A premium anime experience. Curated titles, instant search, and a
              luxurious interface across every device.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Browse"
              links={[
                { href: "/#trending", label: "Trending" },
                { href: "/#latest", label: "Latest" },
                { href: "/#browse", label: "Recently Added" },
              ]}
            />
            <FooterCol
              title="Discover"
              links={[{ href: "/", label: "Home" }]}
            />
            <FooterCol
              title="More"
              links={[{ href: "/admin", label: "Admin" }]}
            />
          </div>
        </div>

        {disclaimers.length > 0 && (
          <div className="mt-10 space-y-3 border-t border-border pt-6">
            {disclaimers.map((d) => (
              <div key={d.id} className="text-xs leading-relaxed text-muted-foreground">
                {d.title && (
                  <span className="font-semibold text-foreground/80">{d.title}: </span>
                )}
                <span className="whitespace-pre-line">{d.body}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Silence Anime. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> by{" "}
            <a
              href="https://x.com/sinket-X"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              @sinket-X (sahu)
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
