// CLI entry point for the scheduled scan. Run locally with: npm run scan
// In CI it is run by .github/workflows/scan.yml, which commits the updated
// data/ files back to the repo (that push triggers a fresh Vercel deploy).

import { promises as fs } from "node:fs";
import path from "node:path";
import { collectFares, runScan } from "../lib/scanner";
import type { HistoryFile } from "../lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DEALS_FILE = path.join(DATA_DIR, "deals.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function main() {
  const history = await readJson<HistoryFile>(HISTORY_FILE, { lastScan: null, routes: {} });

  console.log("Scanning watchlist...");
  const fares = await collectFares();
  console.log(`Collected ${fares.length} fares.`);

  const { deals, history: nextHistory } = runScan(history, fares);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DEALS_FILE, JSON.stringify(deals, null, 2) + "\n");
  await fs.writeFile(HISTORY_FILE, JSON.stringify(nextHistory, null, 2) + "\n");

  console.log(
    `Done: ${deals.deals.length} deals, ${deals.cheapest.length} cheapest fares, ` +
      `${deals.stats.routesTracked} routes tracked across ${deals.origins.length} origins.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
