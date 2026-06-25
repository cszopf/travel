// ────────────────────────────────────────────────────────────────────────────
// EDIT THIS FILE to track the trips you care about.
// Codes are 3-letter IATA airport/city codes:
//   JFK / EWR / LGA = New York   LAX = Los Angeles   ORD = Chicago
//   LHR = London     CDG = Paris  NRT = Tokyo         CUN = Cancun
//   LIS = Lisbon     BCN = Barcelona  MEX = Mexico City  CMH = Columbus OH
// Use a city code (e.g. NYC, LON) to cover all airports in that city at once.
// ────────────────────────────────────────────────────────────────────────────

export type Watch = {
  /** Where you'd fly out of (IATA airport or city code). */
  origin: string;
  /**
   * Specific destinations to track, or "anywhere" to scan the cheapest fares
   * from this origin to every destination Aviasales has data for.
   */
  destinations: string[] | "anywhere";
  /** Optional month to bias the search toward, as "YYYY-MM". Omit for "whenever is cheapest". */
  month?: string;
};

// ⬇️⬇️⬇️ REPLACE THESE EXAMPLES with your real home airport(s) and dream trips. ⬇️⬇️⬇️
export const watchlist: Watch[] = [
  // "anywhere" mode: surfaces wherever is cheap right now from your home airport.
  { origin: "JFK", destinations: "anywhere" },
  { origin: "LAX", destinations: "anywhere" },

  // Targeted mode: track specific routes you actually want to fly.
  { origin: "JFK", destinations: ["LIS", "BCN", "CUN", "NRT", "MEX"] },
];

// How aggressive is "a deal"?
export const dealRules = {
  /** Flag a fare at least this fraction below its recent baseline. 0.20 = 20% off. */
  dropThreshold: 0.2,
  /** Always flag any fare at or below this absolute price (in TRAVELPAYOUTS_CURRENCY). */
  absoluteSteal: 250,
  /** How many recent observations define a route's "usual" price. */
  baselineWindow: 12,
  /** Forget a route after this many days without a new observation. */
  historyTtlDays: 60,
  /** Cap the number of deals published to the site. */
  maxDeals: 60,
  /** How many "cheapest right now" fares to show regardless of deal status. */
  cheapestCount: 12,
};
