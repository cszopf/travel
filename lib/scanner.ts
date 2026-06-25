// The scanner: pull fares for everything on the watchlist, compare each route
// against its recent price history, and decide what counts as a deal.

import { watchlist, dealRules } from "../config/watchlist";
import { cheapestFromCity, pricesForDates, bookingLink, currency } from "./travelpayouts";
import type { Fare, Deal, HistoryFile, DealsFile } from "./types";

const routeKey = (f: { origin: string; destination: string }) => `${f.origin}-${f.destination}`;

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Hit the API for every watchlist entry. A failure on one entry is logged, not fatal. */
export async function collectFares(): Promise<Fare[]> {
  const all: Fare[] = [];
  for (const w of watchlist) {
    try {
      if (w.destinations === "anywhere") {
        all.push(...(await cheapestFromCity(w.origin)));
      } else {
        for (const dest of w.destinations) {
          all.push(...(await pricesForDates({ origin: w.origin, destination: dest, departureAt: w.month })));
        }
      }
    } catch (err) {
      console.error(`! scan failed for ${w.origin} -> ${JSON.stringify(w.destinations)}: ${(err as Error).message}`);
    }
  }
  return all;
}

/** Keep only the single cheapest valid fare per origin-destination route. */
function cheapestPerRoute(fares: Fare[]): Fare[] {
  const best = new Map<string, Fare>();
  for (const f of fares) {
    if (!f.origin || !f.destination || !Number.isFinite(f.price) || f.price <= 0) continue;
    const k = routeKey(f);
    const cur = best.get(k);
    if (!cur || f.price < cur.price) best.set(k, f);
  }
  return [...best.values()];
}

/** Turn a fare into a Deal by comparing it against the route's price history. */
function enrich(f: Fare, history: HistoryFile): Deal {
  const prices = (history.routes[routeKey(f)] ?? []).map((h) => h.price).slice(-dealRules.baselineWindow);
  const baseline = prices.length >= 3 ? median(prices) : null;
  const prevMin = prices.length ? Math.min(...prices) : null;
  const dropPct = baseline ? (baseline - f.price) / baseline : null;
  const isNewLow = prevMin != null && f.price < prevMin;

  const reasons: string[] = [];
  if (dropPct != null && dropPct >= dealRules.dropThreshold) reasons.push(`${Math.round(dropPct * 100)}% below usual`);
  if (f.price <= dealRules.absoluteSteal) reasons.push(`under ${dealRules.absoluteSteal} ${f.currency.toUpperCase()}`);
  if (isNewLow) reasons.push("lowest we've tracked");

  const score =
    (dropPct ?? 0) * 100 + Math.max(0, dealRules.absoluteSteal - f.price) / 10 + (isNewLow ? 15 : 0);

  return { ...f, bookingUrl: bookingLink(f), baseline, dropPct, isNewLow, reasons, score };
}

/** Drop history points older than the TTL so the file does not grow forever. */
function pruneHistory(history: HistoryFile): HistoryFile["routes"] {
  const cutoff = Date.now() - dealRules.historyTtlDays * 86_400_000;
  const routes: HistoryFile["routes"] = {};
  for (const [k, points] of Object.entries(history.routes)) {
    const kept = points.filter((p) => new Date(p.ts).getTime() >= cutoff);
    if (kept.length) routes[k] = kept;
  }
  return routes;
}

/** Pure scan: given prior history and freshly collected fares, produce the feed + next history. */
export function runScan(history: HistoryFile, fares: Fare[]): { deals: DealsFile; history: HistoryFile } {
  const now = new Date().toISOString();
  const cheapest = cheapestPerRoute(fares);

  const enriched = cheapest.map((f) => enrich(f, history));
  const deals = enriched
    .filter((d) => d.reasons.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, dealRules.maxDeals);
  const cheapestFeed = [...enriched].sort((a, b) => a.price - b.price).slice(0, dealRules.cheapestCount);

  // Append this scan's observations to the pruned history.
  const routes = pruneHistory(history);
  for (const f of cheapest) (routes[routeKey(f)] ??= []).push({ ts: now, price: f.price });
  const nextHistory: HistoryFile = { lastScan: now, routes };

  const origins = [...new Set(cheapest.map((f) => f.origin))].sort();
  const dealsFile: DealsFile = {
    generatedAt: now,
    currency: currency(),
    origins,
    stats: { faresSeen: fares.length, routesTracked: Object.keys(routes).length, dealCount: deals.length },
    deals,
    cheapest: cheapestFeed,
  };
  return { deals: dealsFile, history: nextHistory };
}
