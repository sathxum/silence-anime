import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 text-primary">
        <Ghost className="h-10 w-10" />
      </div>
      <div>
        <h1 className="font-display text-4xl font-bold">404</h1>
        <p className="mt-2 max-w-sm text-muted-foreground">
          This page wandered off into another dimension. Let&apos;s get you back home.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-glow transition hover:scale-[1.03]"
      >
        Back to home
      </Link>
    </div>
  );
}
