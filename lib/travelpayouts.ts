// Thin client for the Travelpayouts / Aviasales flight-data API.
// Docs: https://support.travelpayouts.com/hc/en-us/articles/203956163-Aviasales-Data-API
//
// Auth: pass your API token in the `X-Access-Token` header. Get one (free) at
// https://www.travelpayouts.com -> Profile -> "API tokens".
// Monetization: set TRAVELPAYOUTS_MARKER to your affiliate marker so booking
// links carry your partner id and you earn commission on bookings.

import type { Fare } from "./types";

const API_HOST = "https://api.travelpayouts.com";

function token(): string {
  const t = process.env.TRAVELPAYOUTS_TOKEN;
  if (!t) {
    throw new Error(
      "TRAVELPAYOUTS_TOKEN is not set. Get one at https://www.travelpayouts.com (Profile -> API tokens) " +
        "and add it to .env.local (local) and the repo's GitHub Actions secrets (CI).",
    );
  }
  return t;
}

export function currency(): string {
  return (process.env.TRAVELPAYOUTS_CURRENCY || "usd").toLowerCase();
}

function marker(): string | undefined {
  return process.env.TRAVELPAYOUTS_MARKER || undefined;
}

async function get<T = unknown>(
  path: string,
  params: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(API_HOST + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    headers: { "X-Access-Token": token(), Accept: "application/json" },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Travelpayouts ${path} HTTP ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as { success?: boolean; error?: string | null } & T;
  if (json && json.success === false) {
    throw new Error(`Travelpayouts ${path} error: ${json.error ?? "unknown"}`);
  }
  return json;
}

function ddmm(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${day}${month}`;
}

/** Build an Aviasales booking link, carrying the affiliate marker when configured. */
export function bookingLink(fare: Pick<Fare, "origin" | "destination" | "departureAt" | "returnAt" | "link">): string {
  const m = marker();
  // The v3 prices_for_dates endpoint hands back a ready-made relative search link.
  if (fare.link) {
    const url = `https://www.aviasales.com${fare.link}`;
    return m ? `${url}${fare.link.includes("?") ? "&" : "?"}marker=${m}` : url;
  }
  // Otherwise build the standard Aviasales search slug: ORIG DDMM DEST [DDMM] <#passengers>.
  const dep = ddmm(fare.departureAt);
  const ret = fare.returnAt ? ddmm(fare.returnAt) : "";
  const slug = `${fare.origin}${dep}${fare.destination}${ret}1`;
  const url = `https://www.aviasales.com/search/${slug}`;
  return m ? `${url}?marker=${m}` : url;
}

function normalize(d: Record<string, unknown>, foundAt: string): Fare {
  const cur = currency();
  const returnAt = (d.return_at as string) || null;
  const origin = (d.origin as string) ?? (d.origin_airport as string);
  const destination = (d.destination as string) ?? (d.destination_airport as string);
  const flightNumber = d.flight_number;
  return {
    origin,
    destination,
    price: Number(d.price),
    currency: cur,
    airline: (d.airline as string) ?? null,
    flightNumber: flightNumber != null ? String(flightNumber) : null,
    departureAt: d.departure_at as string,
    returnAt,
    transfers: typeof d.transfers === "number" ? d.transfers : null,
    oneWay: !returnAt,
    link: (d.link as string) ?? null,
    foundAt,
  };
}

/** Cheapest fares from one origin to every destination Aviasales has data for. */
export async function cheapestFromCity(origin: string): Promise<Fare[]> {
  const json = await get<{ data?: Record<string, Record<string, unknown>> }>("/v1/city-directions", {
    origin,
    currency: currency(),
  });
  const data = json.data ?? {};
  const now = new Date().toISOString();
  return Object.values(data).map((d) => normalize(d, now));
}

/** Cheapest fares for a specific origin (and optional destination) over a date range. */
export async function pricesForDates(opts: {
  origin: string;
  destination?: string;
  /** YYYY-MM or YYYY-MM-DD; omit for "whenever is cheapest". */
  departureAt?: string;
  returnAt?: string;
  oneWay?: boolean;
  limit?: number;
}): Promise<Fare[]> {
  const json = await get<{ data?: Record<string, unknown>[] }>("/aviasales/v3/prices_for_dates", {
    origin: opts.origin,
    destination: opts.destination,
    departure_at: opts.departureAt,
    return_at: opts.returnAt,
    currency: currency(),
    sorting: "price",
    direct: false,
    one_way: opts.oneWay ?? false,
    unique: true,
    limit: opts.limit ?? 30,
    page: 1,
  });
  const data = json.data ?? [];
  const now = new Date().toISOString();
  return data.map((d) => normalize(d, now));
}
