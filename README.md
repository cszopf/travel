# Travel Radar

A personal travel site that actively scans for flight deals. It watches the
routes you care about, learns each route's "usual" price over time, and flags
fares that drop below it. Built with Next.js and deployed on Vercel.

## How it works

```
GitHub Actions (every 6h)  ->  npm run scan  ->  data/deals.json + data/history.json
        (cron schedule)          (Travelpayouts API)        |
                                                             v
                                          git commit + push the data files
                                                             |
                                                             v
                                        Vercel auto-deploys the fresh site
```

- **Scanner** (`scripts/scan.ts` + `lib/`): queries the Travelpayouts / Aviasales
  data API for everything on your watchlist, keeps the cheapest fare per route,
  compares it to the route's recent price history, and writes the results to
  `data/`.
- **History as data** (`data/history.json`): price history lives in the repo as
  JSON. No database needed. Every scan appends to it, so "deal" detection gets
  smarter the longer it runs.
- **Site** (`app/`): a Next.js page that reads `data/deals.json` and renders the
  deals plus the cheapest current fares, each with a booking link.
- **Schedule** (`.github/workflows/scan.yml`): a GitHub Actions cron job runs the
  scan and commits the refreshed data back, which triggers a Vercel redeploy.
  (No Vercel Cron is used.)

## One-time setup

1. **Get a Travelpayouts token (free).** Sign up at
   [travelpayouts.com](https://www.travelpayouts.com), then Profile -> "API tokens".
   Optionally grab your **affiliate marker** from the dashboard to earn commission
   on bookings.

2. **Add it as a GitHub Actions secret.** In the repo: Settings -> Secrets and
   variables -> Actions -> New repository secret.
   - `TRAVELPAYOUTS_TOKEN` (required)
   - `TRAVELPAYOUTS_MARKER` (optional, for affiliate links)
   - Repository variable `TRAVELPAYOUTS_CURRENCY` (optional, defaults to `usd`)

3. **Pick your routes.** Edit `config/watchlist.ts` with your home airport(s) and
   destinations. Use `"anywhere"` to surface wherever is cheap right now, or list
   specific destinations to track particular trips.

4. **Run the first scan.** In the Actions tab, open "Scan flight deals" and click
   **Run workflow**. After it commits, Vercel redeploys and the site fills in.

## Local development

```bash
cp .env.example .env.local   # then paste your TRAVELPAYOUTS_TOKEN into it
npm install
npm run dev                  # http://localhost:3000

npm run scan                 # run a real scan locally; updates data/*.json
```

## Tuning

- **Scan frequency:** the `cron:` line in `.github/workflows/scan.yml`
  (default every 6 hours).
- **What counts as a deal:** `dealRules` in `config/watchlist.ts`
  (percent drop, absolute "steal" price, baseline window).
- **Currency / affiliate marker:** environment variables above.

## Notes

- Prices are indicative and move fast; always confirm on the airline/booking site.
- `.env.local` is gitignored, so your token is never committed.
