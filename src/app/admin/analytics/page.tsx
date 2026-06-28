import Link from "next/link";
import Image from "next/image";
import { BarChart3, MousePointerClick, Layers, ExternalLink, Trophy } from "lucide-react";
import { getAnimeClickStats, getDashboardStats } from "@/services/stats.service";
import { formatNumber } from "@/lib/utils";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [stats, animeStats] = await Promise.all([
    getDashboardStats(),
    getAnimeClickStats(),
  ]);

  const maxClicks = Math.max(1, ...animeStats.map((a) => a.totalClicks));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Link Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          See which anime and which episode links get the most clicks.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Layers className="h-5 w-5" />} label="Total Anime" value={formatNumber(stats.totalAnime)} />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Total Episodes" value={formatNumber(stats.totalEpisodes)} />
        <StatCard icon={<MousePointerClick className="h-5 w-5" />} label="Total Link Clicks" value={formatNumber(stats.totalClicks)} />
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-float">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Trophy className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Most-clicked anime</h2>
        </div>

        {animeStats.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No click data yet. Clicks appear here once visitors start watching episodes.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {animeStats.map((a, i) => (
              <li key={a.id} className="flex items-center gap-4 px-6 py-4">
                <span className="w-6 text-center font-display text-sm font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {a.poster_url ? (
                    <Image src={a.poster_url} alt={a.title} fill className="object-cover" sizes="40px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium">{a.title}</p>
                    <span className="shrink-0 font-display text-sm font-bold text-primary">
                      {formatNumber(a.totalClicks)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                      style={{ width: `${(a.totalClicks / maxClicks) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.episodeCount} episodes</p>
                </div>
                <Link
                  href={`/admin/anime/${a.id}`}
                  className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Open anime"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-float">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
        {icon}
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
