# IBKR Dashboard

A **local-only** dashboard for Interactive Brokers (IBKR) accounts. Pulls account
activity via IBKR's **Flex Web Service** (no TWS / IB Gateway required) and renders
it as an interactive dashboard served on `localhost`.

Everything — data, analysis, dashboard — stays on your machine.

![tabs: Equity · Daily P&L · Positions · Trades · By Symbol · Notes]

## Features

- **Equity tab** — NLV / Today's P&L / YTD return KPI cards, equity curve, drawdown,
  full performance stats list
- **Daily P&L tab** — bar chart + traditional calendar heatmap, switchable between
  day / week / month granularity (weekends hidden in day view)
- **Positions tab** — 4 KPI cards (NLV / Market Value / Cash / Position %), per-position
  table with today's price change + day P&L + unrealized P&L (all multi-currency aware),
  two allocation doughnuts (by position with ticker labels in-ring + by sector merged)
- **Trades tab** — recent trades with time-window filter (Last Day / Week / Month /
  3 Months / YTD) and category filter (Stocks / Options / All)
- **By Symbol tab** — diverging Top-N chart for stocks vs options, plus full table
- **i18n** — English / 中文 toggle, dark / light themes, all preferences persisted
- **Multi-currency aware** — JPY / HKD / USD trades normalized to base currency via
  per-trade `fxRateToBase`; positions show native + base
- **Multi-account** — sums NLV / P&L / drawdown across accounts by date

## Requirements

- Python 3.8+ (standard library only — no `pip install` needed)
- An Interactive Brokers account
- A modern browser

## Setup

### 1. Create an Activity Flex Query in IBKR

1. Log into **Client Portal** → menu → **Performance & Reports → Flex Queries**
2. Next to **Activity Flex Query**, click **+** to create a new one
3. Name it (e.g., `daily_activity`) and enable these **Sections** with the listed fields:

   | Section | Required fields |
   |---|---|
   | **Trades** | Execution-level. Include `Symbol, Asset Class, Trade Date/Time, Buy/Sell, Quantity, Trade Price, IB Commission, Net Cash, FX Rate To Base`, and **`Realized P/L`** (FIFO P/L Realized) |
   | **Cash Report / Equity Summary** | Enable **Equity Summary by Report Date** |
   | **Change in NAV** | `Starting/Ending Value, Realized, MTM, Deposits & Withdrawals` |
   | **Open Positions** | `Symbol, Position, Mark Price, Cost Basis Price, Position Value, FIFO P/L Unrealized, FX Rate To Base, Percent Of NAV` |

4. **Date Period**: pick `Year to Date` (or `Last 30 Days` for ongoing pulls).
   *Last Business Day* only gives one day per pull, which makes the dashboard
   start sparse — pick something longer so dedup can do its job.
5. **Format**: XML
6. Save and copy the **Query ID** (a number, usually 7 digits)

### 2. Generate a Flex Web Service token

1. Client Portal → **Settings → Account Settings**
2. Find **Flex Web Service**, enable it, generate a token
3. Copy the token (a long number). Tokens expire (max ~1 year) — re-generate when needed

### 3. Configure locally

```bash
git clone git@github.com:Michaelwyx/IBKR-dashboard.git
cd IBKR-dashboard
cp config.example.json config.json
```

Edit `config.json`:

```json
{
  "token": "<your_token>",
  "queries": { "activity": "<your_query_id>" },
  "output_dir": "./data"
}
```

> The token is **read-only** — it can pull statements but cannot trade or transfer
> funds. Still, treat it as a secret; `config.json` is in `.gitignore` so it
> won't be accidentally pushed.

Alternatively use an env var (safer): set `"token": "env:IBKR_FLEX_TOKEN"` in
config and `export IBKR_FLEX_TOKEN=...` in your shell.

### 4. Customize sectors (optional)

`sectors.json` maps tickers to sectors used in the Positions allocation pie.
The default mapping is one person's portfolio — **edit it for yours**. Tickers
not listed fall into "其他" (Other). Option symbols (OCC format) auto-resolve
to their underlying.

### 5. Run

```bash
./run_daily.sh        # pull from IBKR → compute metrics → build dashboard
./serve.sh start      # start a local-only server on http://localhost:8765
```

The dashboard opens in your browser automatically.

After the first run, just `./run_daily.sh` daily (or whenever); the server stays
up and serves no-cache, so a normal browser refresh shows new data immediately.

## Daily / scheduled runs

No scheduler is registered by default. Add cron / launchd / Task Scheduler if you want:

**cron** (Linux/macOS):
```cron
0 8 * * 1-5  /path/to/IBKR-dashboard/run_daily.sh >> /path/to/IBKR-dashboard/logs/cron.log 2>&1
```

**launchd** (macOS) — `~/Library/LaunchAgents/com.user.ibkr-daily.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.user.ibkr-daily</string>
  <key>ProgramArguments</key>
  <array><string>/path/to/IBKR-dashboard/run_daily.sh</string></array>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>8</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>/path/to/IBKR-dashboard/logs/launchd.out.log</string>
  <key>StandardErrorPath</key><string>/path/to/IBKR-dashboard/logs/launchd.err.log</string>
</dict>
</plist>
```
Load: `launchctl load ~/Library/LaunchAgents/com.user.ibkr-daily.plist`

## Repo layout

```
IBKR-dashboard/
├── ibkr_flex_pull.py        # pulls Flex statement, archives raw XML, parses sections
├── analytics.py             # computes metrics + KPIs from the pulled CSVs
├── build_site.py            # bundles metrics into site/data/dashboard.json
├── run_daily.sh             # orchestrator: pull → analyze → build
├── serve.py / serve.sh      # localhost-only static server with no-cache headers
├── reset_cumulative.sh      # nuke accumulated CSVs (for re-pull after schema change)
├── config.example.json      # template — copy to config.json
├── sectors.json             # ticker → sector mapping (edit for your portfolio)
└── site/                    # static dashboard (HTML/CSS/JS, Chart.js via CDN)
    ├── index.html
    └── assets/{app.js, style.css}
```

Generated at runtime (gitignored):
```
├── config.json              # your token + query ID
├── data/                    # raw XML, per-section CSVs, accumulated CSVs, metrics.json
├── site/data/dashboard.json # what the dashboard fetches
└── logs/                    # daily pipeline logs
```

## Command reference

| Command | What it does |
|---|---|
| `./run_daily.sh` | Pull → analyze → build (one-shot full refresh) |
| `./run_daily.sh --no-pull` | Re-analyze + rebuild without hitting IBKR (debugging UI) |
| `./serve.sh start` | Start dashboard server (localhost:8765), open browser |
| `./serve.sh stop` | Stop the server |
| `./serve.sh restart` | Restart |
| `./serve.sh status` | Check server state |
| `./serve.sh fg` | Run server in foreground (Ctrl+C to quit) |
| `./reset_cumulative.sh` | Delete accumulated CSVs and prompt for re-pull (use after changing Flex Query date range) |
| `python3 ibkr_flex_pull.py` | Just pull |
| `python3 analytics.py -c config.json` | Just compute metrics |
| `python3 build_site.py` | Just rebuild `site/data/dashboard.json` |

## How history works

IBKR's Flex Web Service has no date-range parameter — the date window is baked
into the Flex Query at save time. So:

- Setting Date Period to `Last Business Day` → 1 day per pull
- Setting it to `Last 30 Days` → 30 days per pull (with dedup, this is what you want)
- Setting it to `Year to Date` → entire YTD per pull (good for backfill)

The pull script's dedup key for accumulated tables is `(accountId, reportDate)` for
NAV and `(accountId, toDate)` for ChangeInNAV, so re-pulling overlapping windows
doesn't duplicate rows; trades are dedup'd by `tradeID`.

If you change the Query's Date Period after pulling once, run
`./reset_cumulative.sh && ./run_daily.sh` to rebuild from scratch.

## Methodology notes (the short version)

- **Realized P&L / commission / win rate**: aggregated in base currency via each
  trade's `fxRateToBase`. The dashboard's Notes tab also shows this in the UI.
- **Win rate / avg win / avg loss**: based on closing trades (trades that carry
  a non-zero realized P&L); opening trades don't have a P&L yet, so they don't
  count toward the denominator.
- **Drawdown / Sharpe**: based on the NAV time series (sum across accounts).
  Includes deposits/withdrawals — if you have large transfers, prefer the trading
  P&L decomposition from `ChangeInNAV`.
- **Today's P&L** (per position): `(mark_today − mark_yesterday) × position × fx`.
  Computed from two consecutive `OpenPositions` snapshots, so requires Date Period
  with at least 2 days of history.

## Common pitfalls

| Symptom | Likely cause |
|---|---|
| `ErrorCode=1003` | Token invalid or expired |
| `ErrorCode=1006` | Wrong Query ID, or query not saved |
| `ErrorCode=1019` repeating | IBKR is generating the statement — script will retry |
| Dashboard says "no positions" | Open Positions section not enabled in Flex Query |
| Multi-currency totals look wrong | `FX Rate To Base` field missing — add it to your Trades section |
| Positions show duplicates | Pulled an old version of the code — re-pull with `./reset_cumulative.sh` |

## Privacy

This dashboard is intentionally **local-only**: the server binds to `127.0.0.1`,
nothing leaves your machine. Chart.js is loaded from a CDN — if you want fully
offline operation, download `chart.umd.min.js` and `chartjs-plugin-datalabels.min.js`
into `site/assets/` and update the `<script>` tags in `index.html`.

## Credits

Template by Yixuan Wang. Data flows are 100% IBKR Flex Web Service.
