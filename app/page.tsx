import dealsData from "@/data/deals.json";
import type { DealsFile, Deal } from "@/lib/types";
import { DealCard } from "@/components/DealCard";
import { formatDateTime } from "@/lib/format";

const data = dealsData as unknown as DealsFile;

export default function Home() {
  const hasScan = Boolean(data.generatedAt);
  const noFares = hasScan && data.cheapest.length === 0;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-16">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-black/60 dark:border-white/15 dark:text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Updated {formatDateTime(data.generatedAt)}
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Travel Radar</h1>
        <p className="mt-3 max-w-2xl text-lg text-black/60 dark:text-white/60">
          A personal flight-deal scanner. It watches my favorite routes and flags fares that drop below their usual
          price.
        </p>
        {hasScan && (
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-black/50 dark:text-white/50">
            <Stat value={data.origins.length} label="origins" />
            <Stat value={data.stats.routesTracked} label="routes tracked" />
            <Stat value={data.stats.dealCount} label="live deals" />
          </div>
        )}
      </header>

      {!hasScan ? (
        <EmptyState />
      ) : noFares ? (
        <NoFares />
      ) : (
        <div className="space-y-12">
          {data.deals.length > 0 && (
            <Section title="Deals right now" hint="Priced below their usual baseline">
              {data.deals.map((d) => (
                <DealCard key={cardKey(d)} deal={d} />
              ))}
            </Section>
          )}
          <Section title="Cheapest fares right now" hint="Lowest live prices across your watchlist">
            {data.cheapest.map((d) => (
              <DealCard key={cardKey(d)} deal={d} />
            ))}
          </Section>
        </div>
      )}

      <footer className="mt-16 border-t border-black/10 pt-6 text-sm text-black/45 dark:border-white/10 dark:text-white/45">
        <p>
          Fares from the Travelpayouts / Aviasales data API, refreshed on a schedule. Prices are indicative and change
          fast. Booking links may be affiliate links.
        </p>
      </footer>
    </main>
  );
}

function cardKey(d: Deal): string {
  return `${d.origin}-${d.destination}-${d.departureAt}`;
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <strong className="text-black/80 dark:text-white/80">{value}</strong> {label}
    </span>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {hint && <span className="text-sm text-black/45 dark:text-white/45">{hint}</span>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 p-8 dark:border-white/15">
      <h2 className="text-lg font-semibold">No scans yet</h2>
      <p className="mt-2 max-w-xl text-black/60 dark:text-white/60">
        Once the scanner runs, deals and the cheapest live fares will show up here. To get the first scan:
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-black/70 dark:text-white/70">
        <li>
          Add a{" "}
          <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-sm dark:bg-white/10">TRAVELPAYOUTS_TOKEN</code>{" "}
          repository secret (Settings &rarr; Secrets and variables &rarr; Actions).
        </li>
        <li>
          Edit{" "}
          <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-sm dark:bg-white/10">config/watchlist.ts</code>{" "}
          with your home airport(s) and dream destinations.
        </li>
        <li>
          Trigger it from the Actions tab (&ldquo;Scan flight deals&rdquo; &rarr; Run workflow), or wait for the next
          scheduled run.
        </li>
      </ol>
    </div>
  );
}

function NoFares() {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 p-8 dark:border-white/15">
      <h2 className="text-lg font-semibold">The last scan found no fares</h2>
      <p className="mt-2 max-w-xl text-black/60 dark:text-white/60">
        That usually means the API token is missing or invalid, or the watchlist origins have no current data. Check the
        latest run in the Actions tab, then confirm your token and{" "}
        <code className="rounded bg-black/[0.06] px-1.5 py-0.5 text-sm dark:bg-white/10">config/watchlist.ts</code>.
      </p>
    </div>
  );
}
