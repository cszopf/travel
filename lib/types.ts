// Shared types for the travel deal scanner.

/** A single fare returned by the Travelpayouts / Aviasales data API. */
export type Fare = {
  origin: string;
  destination: string;
  /** Price in `currency` whole units (e.g. dollars, not cents). */
  price: number;
  currency: string;
  airline: string | null;
  flightNumber: string | null;
  departureAt: string;
  /** Null for one-way fares. */
  returnAt: string | null;
  /** Number of stops on the outbound leg, when known. */
  transfers: number | null;
  oneWay: boolean;
  /** Relative Aviasales search link from the v3 API, when present. */
  link: string | null;
  /** ISO timestamp this fare was observed. */
  foundAt: string;
};

/** A fare enriched with deal analysis and a booking link. */
export type Deal = Fare & {
  bookingUrl: string;
  /** Median of recent observations for this route, or null if too little history. */
  baseline: number | null;
  /** Fraction below baseline, e.g. 0.25 means 25% cheaper than usual. Null without a baseline. */
  dropPct: number | null;
  /** True when this is the cheapest we've ever tracked for the route. */
  isNewLow: boolean;
  /** Human-readable reasons this fare is flagged (empty for plain "cheapest" listings). */
  reasons: string[];
  /** Ranking score; higher is a better deal. */
  score: number;
};

export type HistoryPoint = { ts: string; price: number };

/** Persisted rolling price history, keyed by `${origin}-${destination}`. */
export type HistoryFile = {
  lastScan: string | null;
  routes: Record<string, HistoryPoint[]>;
};

/** Published feed the website reads. */
export type DealsFile = {
  /** ISO timestamp of the last scan, or null if it has never run. */
  generatedAt: string | null;
  currency: string;
  origins: string[];
  stats: { faresSeen: number; routesTracked: number; dealCount: number };
  /** Fares flagged as deals, best first. */
  deals: Deal[];
  /** Cheapest fares right now regardless of deal status, cheapest first. */
  cheapest: Deal[];
};
