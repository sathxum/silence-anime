import Link from "next/link";
import Image from "next/image";
import { Clapperboard, Layers, MousePointerClick, PlusCircle, ArrowUpRight, BarChart3 } from "lucide-react";
import { getDashboardStats, getAnimeClickStats } from "@/services/stats.service";
import { formatNumber, timeAgo } from "@/lib/utils";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, animeStats] = await Promise.all([
    getDashboardStats(),
    getAnimeClickStats(),
  ]);

  const topAnime = animeStats.slice(0, 5);

  const cards = [
    { label: "Total Anime", value: stats.totalAnime, icon: Clapperboard, tint: "from-sky-500/20 to-sky-500/5 text-sky-400" },
    { label: "Total Episodes", value: stats.totalEpisodes, icon: Layers, tint: "from-violet-500/20 to-violet-500/5 text-violet-400" },
    { label: "Total Link Clicks", value: stats.totalClicks, icon: MousePointerClick, tint: "from-emerald-500/20 to-emerald-500/5 text-emerald-400" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Overview of your library and link performance.</p>
        </div>
        <Link
          href="/admin/anime/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
        >
          <PlusCircle className="h-4 w-4" /> Add Anime
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${c.tint} p-5 shadow-float`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 font-display text-4xl font-bold text-foreground">{formatNumber(c.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently added */}
        <section className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Clapperboard className="h-4 w-4 text-primary" /> Recently Added
          </h2>
          {stats.recentAnime.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No anime yet. Add your first title.</p>
          ) : (
            <ul className="space-y-2">
              {stats.recentAnime.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/anime/${a.id}`}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-background"
                  >
                    <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.poster_url} alt={a.title} className="h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(a.created_at)}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Top performing */}
        <section className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <BarChart3 className="h-4 w-4 text-primary" /> Most Clicked Anime
          </h2>
          {topAnime.length === 0 || topAnime.every((a) => a.totalClicks === 0) ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No clicks tracked yet.</p>
          ) : (
            <ul className="space-y-3">
              {topAnime.map((a, i) => {
                const max = topAnime[0]?.totalClicks || 1;
                const pct = Math.max(4, Math.round((a.totalClicks / max) * 100));
                return (
                  <li key={a.id}>
                    <Link href={`/admin/anime/${a.id}`} className="block rounded-lg p-1.5 hover:bg-background">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 truncate">
                          <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                          <span className="truncate font-medium">{a.title}</span>
                        </span>
                        <span className="shrink-0 font-semibold text-primary">{formatNumber(a.totalClicks)}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
