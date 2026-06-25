import type { Deal } from "@/lib/types";
import { placeName } from "@/lib/places";
import { formatPrice, formatDate, stops } from "@/lib/format";

export function DealCard({ deal }: { deal: Deal }) {
  const flagged = deal.reasons.length > 0;
  const showBaseline = deal.baseline != null && deal.dropPct != null && deal.dropPct > 0.01;

  return (
    <a
      href={deal.bookingUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative flex flex-col rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-black/20 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20"
    >
      {flagged && (
        <span className="absolute right-4 top-4 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          DEAL
        </span>
      )}

      <div className="text-sm text-black/50 dark:text-white/50">
        {placeName(deal.origin)} ({deal.origin})
      </div>
      <div className="mt-0.5 text-xl font-semibold leading-tight">
        {placeName(deal.destination)}
        <span className="ml-1.5 font-normal text-black/40 dark:text-white/40">{deal.destination}</span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight">{formatPrice(deal.price, deal.currency)}</span>
        {showBaseline && (
          <span className="text-sm text-black/40 line-through dark:text-white/40">
            {formatPrice(deal.baseline as number, deal.currency)}
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-black/60 dark:text-white/60">
        {deal.oneWay ? "One-way" : "Round-trip"}
        {deal.departureAt ? ` · ${formatDate(deal.departureAt)}` : ""}
        {deal.returnAt ? ` to ${formatDate(deal.returnAt)}` : ""}
      </div>
      {(deal.airline || stops(deal.transfers)) && (
        <div className="mt-0.5 text-sm text-black/50 dark:text-white/50">
          {[deal.airline, stops(deal.transfers)].filter(Boolean).join(" · ")}
        </div>
      )}

      {flagged && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {deal.reasons.map((r) => (
            <span
              key={r}
              className="rounded-full bg-black/[0.06] px-2 py-0.5 text-xs text-black/70 dark:bg-white/10 dark:text-white/70"
            >
              {r}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm font-medium text-emerald-600 group-hover:underline dark:text-emerald-400">
        Book on Aviasales &rarr;
      </div>
    </a>
  );
}
