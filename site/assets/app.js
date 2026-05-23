/* IBKR Dashboard — pure local, fetches ./data/dashboard.json. */

/* ─────────────────────────── i18n ─────────────────────────── */
const I18N = {
  zh: {
    "app.title": "IBKR 仪表盘",
    "app.nlv": "净清算价值",
    "app.lastPulled": "上次拉取",
    "app.built": "构建于",
    "ctrl.lang": "中 / EN",
    "tab.equity": "权益",
    "tab.daily": "每日盈亏",
    "tab.positions": "持仓",
    "tab.trades": "成交",
    "tab.bySymbol": "按标的",
    "tab.notes": "口径说明",
    "equity.curve": "权益曲线",
    "equity.drawdown": "回撤",
    "equity.stats": "绩效指标",
    "kpi.nlv": "当前净清算价值",
    "kpi.todayPnl": "今日盈亏",
    "kpi.ytdReturn": "年初至今累计收益率",
    "stat.tradingDays": "交易日数",
    "stat.navStart": "本金",
    "stat.navEnd": "当前 NAV",
    "stat.cumPnl": "累计盈亏",
    "stat.cumPnlPct": "累计收益率",
    "stat.maxDD": "最大回撤",
    "stat.sharpe": "年化夏普",
    "stat.realized": "已实现盈亏",
    "stat.commission": "总佣金",
    "stat.winRate": "胜率",
    "stat.tradeCount": "成交笔数",
    "stat.currencies": "交易币种",
    "winRate.hint": "胜率 = 盈利的平仓成交 ÷ 平仓总笔数。开仓成交不算（还没实现盈亏）。",
    "tradeCount.hint": "所有拉取到的成交，含开仓和平仓。",
    "closing.hint": "平仓成交（openCloseIndicator='C'）：减少或全部平掉已有仓位的成交，对应有非零的 fifoPnlRealized。胜率/平均盈亏的分母就是这个数。开仓成交（'O'）建立新仓位，本身没有已实现盈亏。",
    "daily.barTitle": "柱状图",
    "daily.calendarTitle": "日历视图",
    "daily.gran.day": "日",
    "daily.gran.week": "周",
    "daily.gran.month": "月",
    "daily.summary.total": "区间合计",
    "daily.summary.best": "最佳",
    "daily.summary.worst": "最差",
    "daily.summary.posDays": "盈利",
    "daily.legend.loss": "亏",
    "daily.legend.gain": "盈",
    "positions.title": "当前持仓",
    "positions.asOf": "数据截至 ",
    "positions.symbol": "标的",
    "positions.cat": "类别",
    "positions.qty": "数量",
    "positions.cost": "成本价",
    "positions.mark": "现价",
    "positions.change": "变动",
    "positions.dayPnl": "当日盈亏",
    "positions.unrealized": "浮动盈亏",
    "positions.pctNav": "占 NAV %",
    "positions.currency": "币种",
    "positions.kpi.nlv": "总净清算价值",
    "positions.kpi.marketValue": "总市值",
    "positions.kpi.cash": "现金",
    "positions.kpi.positionPct": "持仓占比",
    "positions.kpi.cashPct": "现金占比",
    "positions.kpi.ofNav": "of NAV",
    "positions.allocation": "持仓分布",
    "positions.allocByPos": "按持仓",
    "positions.allocBySector": "按板块",
    "positions.sector": "板块",
    "positions.tickers": "标的",
    "positions.valueBase": "市值",
    "positions.cash": "现金",
    "positions.marginNote": "保证金负余额（融资）:",
    "trades.title": "成交",
    "trades.recent": "最近成交",
    "trades.time": "时间",
    "trades.symbol": "标的",
    "trades.cat": "类别",
    "trades.side": "方向",
    "trades.qty": "数量",
    "trades.price": "成交价",
    "trades.commission": "佣金（本币）",
    "trades.realized": "已实现盈亏（基础货币）",
    "trades.currency": "币种",
    "trades.rangeLabel": "时间范围",
    "trades.range.1d": "最近一天",
    "trades.range.1w": "最近一周",
    "trades.range.1m": "最近一月",
    "trades.range.3m": "最近三月",
    "trades.range.ytd": "年初至今",
    "trades.cat.all": "全部",
    "trades.cat.stk": "股票",
    "trades.cat.opt": "期权",
    "bySymbol.stocks": "股票",
    "bySymbol.options": "期权",
    "bySymbol.topN": "条数",
    "bySymbol.all": "全部",
    "bySymbol.divergingHint": "盈利向右 · 亏损向左",
    "bySymbol.tableTitle": "全部标的",
    "bySymbol.symbol": "标的",
    "bySymbol.cat": "类别",
    "bySymbol.trades": "笔数",
    "bySymbol.realizedNative": "已实现盈亏（本币）",
    "bySymbol.realizedBase": "已实现盈亏（基础货币）",
    "bySymbol.commission": "佣金（本币）",
    "bySymbol.currency": "币种",
    "notes.title": "口径说明",
    "footer.source": "数据来源：IBKR Flex Web Service。",
    "footer.local": "模板设计：Yixuan Wang。",
    "empty.noData": "暂无数据",
    "empty.dashboard": "尚未生成 dashboard.json。先跑 ./run_daily.sh。",
    "weekday.short": ["一", "二", "三", "四", "五", "六", "日"],
    "month.full": ["1 月","2 月","3 月","4 月","5 月","6 月","7 月","8 月","9 月","10 月","11 月","12 月"],
  },
  en: {
    "app.title": "IBKR Dashboard",
    "app.nlv": "Net Liquidation Value",
    "app.lastPulled": "Last pulled",
    "app.built": "Built",
    "ctrl.lang": "EN / 中",
    "tab.equity": "Equity",
    "tab.daily": "Daily P&L",
    "tab.positions": "Positions",
    "tab.trades": "Trades",
    "tab.bySymbol": "By Symbol",
    "tab.notes": "Notes",
    "equity.curve": "Equity Curve",
    "equity.drawdown": "Drawdown",
    "equity.stats": "Performance Statistics",
    "kpi.nlv": "Current Net Liquidation Value",
    "kpi.todayPnl": "Today's P&L",
    "kpi.ytdReturn": "Cumulative Return YTD",
    "stat.tradingDays": "Trading days",
    "stat.navStart": "Principal",
    "stat.navEnd": "Current NAV",
    "stat.cumPnl": "Cumulative P&L",
    "stat.cumPnlPct": "Cumulative return",
    "stat.maxDD": "Max drawdown",
    "stat.sharpe": "Annualized Sharpe",
    "stat.realized": "Realized P&L",
    "stat.commission": "Total commission",
    "stat.winRate": "Win rate",
    "stat.tradeCount": "Trade count",
    "stat.currencies": "Currencies traded",
    "winRate.hint": "Win rate = winning closing trades ÷ closing trade count. Opening trades aren't counted (they don't have realized P&L yet).",
    "tradeCount.hint": "All trades pulled — includes both opening and closing.",
    "closing.hint": "Closing trades (openCloseIndicator='C') reduce or flatten an existing position; they carry a non-zero fifoPnlRealized. This is the denominator for win rate / average win / average loss. Opening trades ('O') establish new positions and have no realized P&L of their own.",
    "daily.barTitle": "Bar Chart",
    "daily.calendarTitle": "Calendar View",
    "daily.gran.day": "Day",
    "daily.gran.week": "Week",
    "daily.gran.month": "Month",
    "daily.summary.total": "Period total",
    "daily.summary.best": "Best",
    "daily.summary.worst": "Worst",
    "daily.summary.posDays": "Winning",
    "daily.legend.loss": "Loss",
    "daily.legend.gain": "Gain",
    "positions.title": "Current Positions",
    "positions.asOf": "As of ",
    "positions.symbol": "Symbol",
    "positions.cat": "Category",
    "positions.qty": "Quantity",
    "positions.cost": "Cost Price",
    "positions.mark": "Market Price",
    "positions.change": "Change",
    "positions.dayPnl": "Today's P&L",
    "positions.unrealized": "Unrealized P&L",
    "positions.pctNav": "% of NAV",
    "positions.currency": "Ccy",
    "positions.kpi.nlv": "Total Net Liquidation",
    "positions.kpi.marketValue": "Total Market Value",
    "positions.kpi.cash": "Cash",
    "positions.kpi.positionPct": "Position % of NAV",
    "positions.kpi.cashPct": "Cash:",
    "positions.kpi.ofNav": "of NAV",
    "positions.allocation": "Allocation",
    "positions.allocByPos": "By Position",
    "positions.allocBySector": "By Sector",
    "positions.sector": "Sector",
    "positions.tickers": "Tickers",
    "positions.valueBase": "Value",
    "positions.cash": "Cash",
    "positions.marginNote": "Negative cash (margin debt):",
    "trades.title": "Trades",
    "trades.recent": "Recent Trades",
    "trades.time": "Time",
    "trades.symbol": "Symbol",
    "trades.cat": "Type",
    "trades.side": "Side",
    "trades.qty": "Quantity",
    "trades.price": "Price",
    "trades.commission": "Commission (Native)",
    "trades.realized": "Realized P&L (Base)",
    "trades.currency": "Ccy",
    "trades.rangeLabel": "Range",
    "trades.range.1d": "Last Day",
    "trades.range.1w": "Last Week",
    "trades.range.1m": "Last Month",
    "trades.range.3m": "Last 3 Months",
    "trades.range.ytd": "YTD",
    "trades.cat.all": "All",
    "trades.cat.stk": "Stocks",
    "trades.cat.opt": "Options",
    "bySymbol.stocks": "Stocks",
    "bySymbol.options": "Options",
    "bySymbol.topN": "Show",
    "bySymbol.all": "All",
    "bySymbol.divergingHint": "Gain →   · ←  Loss",
    "bySymbol.tableTitle": "All Symbols",
    "bySymbol.symbol": "Symbol",
    "bySymbol.cat": "Category",
    "bySymbol.trades": "Trades",
    "bySymbol.realizedNative": "Realized (Native)",
    "bySymbol.realizedBase": "Realized (Base)",
    "bySymbol.commission": "Commission (Native)",
    "bySymbol.currency": "Ccy",
    "notes.title": "Methodology Notes",
    "footer.source": "Data from IBKR Flex Web Service.",
    "footer.local": "Template by Yixuan Wang.",
    "empty.noData": "No data",
    "empty.dashboard": "dashboard.json not generated yet. Run ./run_daily.sh first.",
    "weekday.short": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "month.full": ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
};

function t(key) {
  const d = I18N[state.lang] || I18N.en;
  return d[key] !== undefined ? d[key] : key;
}

/* ─────────────────────────── state ─────────────────────────── */
const state = {
  lang: localStorage.getItem("ibkr.lang") || "zh",
  theme: localStorage.getItem("ibkr.theme") || "light",
  tab: localStorage.getItem("ibkr.tab") || "equity",
  granularity: "day",      // day | week | month
  tradeRange: "1w",            // 1d | 1w | 1m | 3m | ytd
  tradeCategory: "all",        // all | STK | OPT
  bySymbolType: "STK",         // STK | OPT — 哪一类显示在 diverging chart
  bySymbolTopN: "all",         // 5 | 10 | all
  bySymbolTableCat: "all",     // all | STK | OPT — All Symbols 表的筛选
  data: null,
};

let charts = {};

/* ─────────────────────────── formatting ─────────────────────────── */
const fmtMoney = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return sign + "$" + abs.toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
};

// 带正负号的金额：用在 KPI 卡片这种「方向重要」的位置
const fmtMoneySigned = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : (n < 0 ? "-" : "");
  const abs = Math.abs(n);
  return sign + "$" + abs.toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
};

const fmtMoneyCcy = (n, ccy) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return sign + abs.toLocaleString("en-US", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }) + (ccy ? ` ${ccy}` : "");
};

const fmtMoneyCompact = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const abs = Math.abs(n);
  let s;
  if (abs >= 1e6) s = (n / 1e6).toFixed(1) + "M";
  else if (abs >= 1e3) s = (n / 1e3).toFixed(1) + "k";
  else s = n.toFixed(0);
  return s;
};

// 日历/紧凑视图统一用 k 单位（含正负号、含极小值），如 +1.5k / -0.3k / 0.0k
const fmtPnlK = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : (n < 0 ? "-" : "");
  return sign + (Math.abs(n) / 1000).toFixed(1) + "k";
};

const fmtPct = (n, d = 2) => (n == null || Number.isNaN(n)) ? "—" : n.toFixed(d) + "%";
const fmtRate = (n) => (n == null) ? "—" : (n * 100).toFixed(1) + "%";
const fmtNum = (n, d = 2) => (n == null || Number.isNaN(n)) ? "—"
  : Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

const signClass = (n) => n == null ? "" : n > 0 ? "pnl-pos" : n < 0 ? "pnl-neg" : "";

/* ─────────────────────────── i18n DOM walk ─────────────────────────── */
function applyI18n() {
  document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  document.title = t("app.title");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
}

/* ─────────────────────────── theme ─────────────────────────── */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  document.getElementById("themeIcon").textContent = state.theme === "light" ? "☀" : "🌙";
}

/* ─────────────────────────── tab routing ─────────────────────────── */
function applyTab() {
  document.querySelectorAll(".tab").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === state.tab);
  });
  document.querySelectorAll(".tab-panel").forEach(p => {
    p.classList.toggle("hidden", p.id !== `panel-${state.tab}`);
  });
}

/* ─────────────────────────── chart defaults ─────────────────────────── */
function chartTheme() {
  const css = getComputedStyle(document.documentElement);
  return {
    text: css.getPropertyValue("--text-muted").trim() || "#888",
    grid: css.getPropertyValue("--border").trim() || "#ddd",
    accent: css.getPropertyValue("--accent").trim() || "#4f8cff",
    green: css.getPropertyValue("--green").trim() || "#18a957",
    red: css.getPropertyValue("--red").trim() || "#d83a3a",
    chartLine: css.getPropertyValue("--chart-line").trim() || "#7596b7",
    chartArea: css.getPropertyValue("--chart-area").trim() || "rgba(117,150,183,0.14)",
    chartDdLine: css.getPropertyValue("--chart-dd-line").trim() || "#b78686",
    chartDdArea: css.getPropertyValue("--chart-dd-area").trim() || "rgba(183,134,134,0.14)",
  };
}

let datalabelsReady = false;
function applyChartDefaults() {
  const th = chartTheme();
  Chart.defaults.color = th.text;
  Chart.defaults.borderColor = th.grid;
  Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  // datalabels 是 UMD 插件——CDN 加载后**必须手动注册**才能在图上画 label。
  // 注册后默认会对所有图启用，所以再用 defaults 一刀切关掉，需要的图自己 opt-in。
  if (!datalabelsReady && typeof ChartDataLabels !== "undefined") {
    Chart.register(ChartDataLabels);
    datalabelsReady = true;
  }
  if (Chart.defaults.plugins) {
    Chart.defaults.plugins.datalabels = { display: false };
  }
}

function destroyChart(id) {
  if (charts[id]) { charts[id].destroy(); delete charts[id]; }
}

/* ─────────────────────────── Equity tab ─────────────────────────── */
function renderEquityChart(daily) {
  destroyChart("equity");
  if (!daily || !daily.length) return;
  const th = chartTheme();
  charts.equity = new Chart(document.getElementById("equityChart"), {
    type: "line",
    data: {
      labels: daily.map(d => d.date),
      datasets: [{
        label: t("app.nlv"),
        data: daily.map(d => d.total),
        borderColor: th.chartLine,
        backgroundColor: th.chartArea,
        fill: true,
        tension: 0.2,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 1.6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: th.grid }, ticks: { maxTicksLimit: 10 } },
        y: { grid: { color: th.grid }, ticks: { callback: v => "$" + fmtMoneyCompact(v) } },
      },
    },
  });
}

function renderDrawdownChart(daily) {
  destroyChart("drawdown");
  if (!daily || !daily.length) return;
  const totals = daily.map(d => d.total);
  let peak = -Infinity;
  const dd = totals.map(v => {
    if (v == null) return null;
    if (v > peak) peak = v;
    return peak > 0 ? ((v - peak) / peak) * 100 : 0;
  });
  const th = chartTheme();
  charts.drawdown = new Chart(document.getElementById("drawdownChart"), {
    type: "line",
    data: {
      labels: daily.map(d => d.date),
      datasets: [{
        label: t("equity.drawdown"),
        data: dd,
        borderColor: th.chartDdLine,
        backgroundColor: th.chartDdArea,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 1.6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: th.grid }, ticks: { maxTicksLimit: 10 } },
        y: { grid: { color: th.grid }, ticks: { callback: v => v.toFixed(1) + "%" }, max: 0 },
      },
    },
  });
}

function ytdAnchor(daily) {
  // 找最近一笔所在年份的第一个数据点（date 格式 "20260101" 或 "2026-01-01"）
  if (!daily || !daily.length) return null;
  const latest = daily[daily.length - 1];
  const yr = (latest.date || "").slice(0, 4);
  if (!yr) return null;
  return daily.find(d => (d.date || "").startsWith(yr)) || null;
}

function renderEquityKpis(o, daily) {
  const root = document.getElementById("equityKpis");
  if (!root) return;
  const cumPnl = o.cumulativePnlFromEquity;
  const cumPnlPct = (cumPnl != null && o.navStart) ? (cumPnl / o.navStart) * 100 : null;

  // 今日盈亏：daily 序列最后一笔
  const latest = (daily && daily.length) ? daily[daily.length - 1] : null;
  const todayPnl = latest ? latest.dayPnl : null;
  const todayPct = latest ? latest.dayReturnPct : null;
  const todayDate = latest ? latest.date : null;

  // YTD return：基于最近一笔所在年份第一个数据点
  const ytdStart = ytdAnchor(daily);
  let ytdPct = null, ytdDollar = null;
  if (ytdStart && latest && ytdStart.total) {
    ytdDollar = latest.total - ytdStart.total;
    ytdPct = (latest.total / ytdStart.total - 1) * 100;
  }

  const cards = [
    {
      label: t("kpi.nlv"),
      value: fmtMoney(o.navEnd),
      sub: "",
    },
    {
      label: t("kpi.todayPnl"),
      value: fmtMoneySigned(todayPnl),
      valueClass: signClass(todayPnl),
      sub: todayPct != null ? `${todayPct >= 0 ? "+" : ""}${todayPct.toFixed(2)}%` : "",
      subClass: signClass(todayPct),
    },
    {
      label: t("kpi.ytdReturn"),
      value: ytdPct != null ? `${ytdPct >= 0 ? "+" : ""}${ytdPct.toFixed(2)}%` : "—",
      valueClass: signClass(ytdPct),
      sub: ytdDollar != null ? fmtMoneySigned(ytdDollar) : "",
      subClass: signClass(ytdDollar),
    },
  ];

  root.innerHTML = cards.map(c => `
    <div class="kpi-card">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value ${c.valueClass || ""}">${c.value}</div>
      ${c.sub ? `<div class="kpi-sub ${c.subClass || ""}">${c.sub}</div>` : ""}
    </div>
  `).join("");
}

function renderEquityStats(o) {
  const cumPnl = o.cumulativePnlFromEquity;
  const cumPnlPct = (cumPnl != null && o.navStart) ? (cumPnl / o.navStart) * 100 : null;

  const rows = [
    ["stat.navStart",     fmtMoney(o.navStart), ""],
    ["stat.navEnd",       fmtMoney(o.navEnd), ""],
    ["stat.cumPnl",       fmtMoney(cumPnl), signClass(cumPnl)],
    ["stat.cumPnlPct",    cumPnlPct != null ? `${cumPnlPct >= 0 ? "+" : ""}${cumPnlPct.toFixed(2)}%` : "—",
                          signClass(cumPnl)],
    ["stat.tradingDays",  o.tradingDays != null ? o.tradingDays : "—", ""],
    ["stat.tradeCount",   o.tradeCount != null ? o.tradeCount.toLocaleString() : "—", "", "tradeCount.hint"],
    ["stat.currencies",   (o.currenciesTraded || []).join(", ") || "—", ""],
    ["stat.maxDD",        fmtPct(o.maxDrawdownPct) + (o.maxDrawdown != null ? ` (${fmtMoney(o.maxDrawdown)})` : ""), "pnl-neg"],
    ["stat.sharpe",       o.sharpeAnnualized != null ? o.sharpeAnnualized.toFixed(2) : "—", ""],
    ["stat.winRate",      fmtRate(o.winRate), "", "winRate.hint"],
    ["stat.realized",     fmtMoney(o.realizedPnl), signClass(o.realizedPnl)],
    ["stat.commission",   fmtMoney(o.totalCommission), signClass(o.totalCommission)],
  ];

  document.getElementById("equityStats").innerHTML = rows.map(([k, v, cls, hintKey]) => {
    const hintMark = hintKey ? ` <span class="hint-mark" title="${t(hintKey)}">ⓘ</span>` : "";
    return `<tr><td>${t(k)}${hintMark}</td><td class="${cls || ""}">${v}</td></tr>`;
  }).join("");
}

/* ─────────────────────────── Daily P&L tab ─────────────────────────── */
function parseISODate(s) {
  // accepts "2026-05-21" or "20260521"
  if (!s) return null;
  if (/^\d{8}$/.test(s)) return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return new Date(s + "T00:00:00Z");
  return new Date(s);
}

function formatISODate(d) {
  const y = d.getUTCFullYear(), m = String(d.getUTCMonth()+1).padStart(2,"0"), day = String(d.getUTCDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

function isoWeekKey(d) {
  // ISO week date — Monday is day 1.
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2,"0")}`;
}

function monthKey(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}`;
}

function aggregateDaily(daily, granularity) {
  // daily: [{date, dayPnl, total}]
  const items = daily.filter(d => d.dayPnl != null).map(d => ({
    dateObj: parseISODate(d.date),
    date: d.date,
    pnl: d.dayPnl,
  }));
  if (granularity === "day") {
    return items.map(it => ({ key: formatISODate(it.dateObj), label: formatISODate(it.dateObj), dateObj: it.dateObj, pnl: it.pnl }));
  }
  const grouped = new Map();
  for (const it of items) {
    const key = granularity === "week" ? isoWeekKey(it.dateObj) : monthKey(it.dateObj);
    if (!grouped.has(key)) grouped.set(key, { key, dateObj: it.dateObj, pnl: 0 });
    grouped.get(key).pnl += it.pnl;
  }
  return [...grouped.values()].sort((a, b) => a.dateObj - b.dateObj).map(g => ({
    ...g,
    label: granularity === "week"
      ? g.key
      : `${g.dateObj.getUTCFullYear()}-${String(g.dateObj.getUTCMonth()+1).padStart(2,"0")}`,
  }));
}

function renderDailyBar(items) {
  destroyChart("dailyPnl");
  if (!items.length) return;
  const th = chartTheme();
  charts.dailyPnl = new Chart(document.getElementById("dailyPnlChart"), {
    type: "bar",
    data: {
      labels: items.map(i => i.label),
      datasets: [{
        label: t("tab.daily"),
        data: items.map(i => i.pnl),
        backgroundColor: items.map(i => i.pnl >= 0 ? th.green : th.red),
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 14 } },
        y: { grid: { color: th.grid }, ticks: { callback: v => "$" + fmtMoneyCompact(v) } },
      },
    },
  });
}

// 日历单元格底色：base 用稍深的红/略柔的绿；强度低 → 与背景叠加成「蛋壳红 / 浅薄荷绿」
// 强度高 → 接近 base 的「深红 / 实绿」。整体饱和度比纯红纯绿降了一档。
function colorForPnl(value, maxAbs) {
  if (!value || !maxAbs) return null;
  const intensity = Math.min(1, Math.sqrt(Math.abs(value) / maxAbs)); // sqrt → 中段更显
  const alpha = 0.16 + intensity * 0.84;
  return value > 0
    ? `rgba(58, 145, 96, ${alpha.toFixed(3)})`    // 柔绿
    : `rgba(170, 50, 50, ${alpha.toFixed(3)})`;   // 深红（低 alpha 时呈蛋壳红）
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

function maxAbsForScale(items) {
  // Use 90th-percentile of |pnl| so outliers don't wash out the gradient
  const abs = items.filter(i => i.pnl).map(i => Math.abs(i.pnl));
  if (!abs.length) return 0;
  return percentile(abs, 90) || Math.max(...abs);
}

function renderCalendar(items, granularity) {
  const wrap = document.getElementById("dailyCalendarWrap");
  wrap.innerHTML = "";
  if (!items.length) {
    wrap.innerHTML = `<div class="empty">${t("empty.noData")}</div>`;
    return;
  }
  const maxAbs = maxAbsForScale(items);

  // legend 放在日历视图最上方
  const legend = document.createElement("div");
  legend.className = "calendar-legend calendar-legend-top";
  legend.innerHTML = `
    <span>${t("daily.legend.loss")}</span>
    <span class="swatch" style="background: rgba(170, 50, 50, 1)"></span>
    <span class="swatch" style="background: rgba(170, 50, 50, 0.55)"></span>
    <span class="swatch" style="background: rgba(170, 50, 50, 0.22)"></span>
    <span class="swatch" style="background: var(--bg-elev)"></span>
    <span class="swatch" style="background: rgba(58, 145, 96, 0.22)"></span>
    <span class="swatch" style="background: rgba(58, 145, 96, 0.55)"></span>
    <span class="swatch" style="background: rgba(58, 145, 96, 1)"></span>
    <span>${t("daily.legend.gain")}</span>
  `;
  wrap.appendChild(legend);

  if (granularity === "day") {
    renderDayCalendar(wrap, items, maxAbs);
  } else if (granularity === "week") {
    renderWeekCalendar(wrap, items, maxAbs);
  } else {
    renderMonthCalendar(wrap, items, maxAbs);
  }
}

function groupByMonth(items) {
  const m = new Map();
  for (const it of items) {
    const ym = `${it.dateObj.getUTCFullYear()}-${String(it.dateObj.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!m.has(ym)) m.set(ym, []);
    m.get(ym).push(it);
  }
  return m;
}

function buildMonthSection(yr, mo) {
  const section = document.createElement("div");
  section.className = "cal-month-section";
  const title = document.createElement("div");
  title.className = "cal-month-title";
  title.textContent = `${yr} · ${t("month.full")[mo]}`;
  section.appendChild(title);
  return section;
}

function renderDayCalendar(wrap, items, maxAbs) {
  // 多月在一行：用 auto-fill 网格包裹各月份；每月内 5 列（Mon-Fri，去掉周末）
  const container = document.createElement("div");
  container.className = "cal-day-months";

  const byMonth = groupByMonth(items);
  for (const ym of [...byMonth.keys()].sort()) {
    const [yr, mo] = ym.split("-").map(Number);
    const monthIdx = mo - 1;
    const section = buildMonthSection(yr, monthIdx);

    // 5 列星期表头（仅 Mon-Fri）
    const header = document.createElement("div");
    header.className = "cal-weekday-header cal-weekday-header-5";
    for (const wd of t("weekday.short").slice(0, 5)) {
      const c = document.createElement("div");
      c.className = "cal-weekday-cell";
      c.textContent = wd;
      header.appendChild(c);
    }
    section.appendChild(header);

    // 月初星期几（Mon=0..Sun=6）。周末不画格子。
    const firstDow = (new Date(Date.UTC(yr, monthIdx, 1)).getUTCDay() + 6) % 7;
    const numDays = new Date(Date.UTC(yr, monthIdx + 1, 0)).getUTCDate();

    const grid = document.createElement("div");
    grid.className = "cal-grid cal-grid-5";

    // 月初前的空白：仅按工作日 padding（Sat/Sun 不算空格）
    const leadPad = firstDow <= 4 ? firstDow : 0;
    for (let i = 0; i < leadPad; i++) {
      const empty = document.createElement("div");
      empty.className = "cal-cell empty";
      grid.appendChild(empty);
    }

    const itemByDay = new Map();
    for (const it of byMonth.get(ym)) {
      itemByDay.set(it.dateObj.getUTCDate(), it);
    }

    for (let d = 1; d <= numDays; d++) {
      const dow = (new Date(Date.UTC(yr, monthIdx, d)).getUTCDay() + 6) % 7;
      if (dow > 4) continue;   // 跳过 Sat/Sun

      const cell = document.createElement("div");
      cell.className = "cal-cell";
      const item = itemByDay.get(d);
      if (item) {
        cell.classList.add("has-data", item.pnl >= 0 ? "pos" : "neg");
        const bg = colorForPnl(item.pnl, maxAbs);
        if (bg) cell.style.background = bg;
        cell.innerHTML = `
          <span class="cal-cell-date">${d}</span>
          <span class="cal-cell-value">${fmtPnlK(item.pnl)}</span>
        `;
        cell.title = `${formatISODate(item.dateObj)}: ${fmtMoney(item.pnl)}`;
      } else {
        cell.innerHTML = `<span class="cal-cell-date">${d}</span>`;
      }
      grid.appendChild(cell);
    }
    section.appendChild(grid);
    container.appendChild(section);
  }
  wrap.appendChild(container);
}

function renderWeekCalendar(wrap, items, maxAbs) {
  // 按月分组（用 week 起始日所在月份），每月一行 week cells
  const byMonth = groupByMonth(items);
  for (const ym of [...byMonth.keys()].sort()) {
    const [yr, mo] = ym.split("-").map(Number);
    const section = buildMonthSection(yr, mo - 1);

    const row = document.createElement("div");
    row.className = "cal-week-row";
    for (const it of byMonth.get(ym)) {
      const cell = document.createElement("div");
      cell.className = `cal-cell cal-cell-week has-data ${it.pnl >= 0 ? "pos" : "neg"}`;
      const bg = colorForPnl(it.pnl, maxAbs);
      if (bg) cell.style.background = bg;
      cell.innerHTML = `
        <span class="cal-cell-date">${it.label}</span>
        <span class="cal-cell-value">${fmtPnlK(it.pnl)}</span>
      `;
      cell.title = `${it.label}: ${fmtMoney(it.pnl)}`;
      row.appendChild(cell);
    }
    section.appendChild(row);
    wrap.appendChild(section);
  }
}

function renderMonthCalendar(wrap, items, maxAbs) {
  // 按年分组，每年 12 个月格（无数据的月份留空格但显示月份名）
  const byYear = new Map();
  for (const it of items) {
    const y = it.dateObj.getUTCFullYear();
    if (!byYear.has(y)) byYear.set(y, new Map());
    byYear.get(y).set(it.dateObj.getUTCMonth(), it);
  }
  for (const yr of [...byYear.keys()].sort()) {
    const section = document.createElement("div");
    section.className = "cal-month-section";
    const title = document.createElement("div");
    title.className = "cal-month-title";
    title.textContent = String(yr);
    section.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "cal-year-grid";
    for (let m = 0; m < 12; m++) {
      const item = byYear.get(yr).get(m);
      const cell = document.createElement("div");
      cell.className = "cal-cell cal-cell-month";
      if (item) {
        cell.classList.add("has-data", item.pnl >= 0 ? "pos" : "neg");
        const bg = colorForPnl(item.pnl, maxAbs);
        if (bg) cell.style.background = bg;
        cell.innerHTML = `
          <span class="cal-cell-date">${t("month.full")[m]}</span>
          <span class="cal-cell-value">${fmtPnlK(item.pnl)}</span>
        `;
        cell.title = `${yr}-${String(m + 1).padStart(2, "0")}: ${fmtMoney(item.pnl)}`;
      } else {
        cell.innerHTML = `<span class="cal-cell-date">${t("month.full")[m]}</span>`;
      }
      grid.appendChild(cell);
    }
    section.appendChild(grid);
    wrap.appendChild(section);
  }
}

function renderDailyPnlSummary(items) {
  const s = document.getElementById("pnlSummary");
  if (!items.length) { s.innerHTML = ""; return; }
  const total = items.reduce((a, b) => a + b.pnl, 0);
  const best = items.reduce((a, b) => b.pnl > a.pnl ? b : a, items[0]);
  const worst = items.reduce((a, b) => b.pnl < a.pnl ? b : a, items[0]);
  const winDays = items.filter(i => i.pnl > 0).length;
  s.innerHTML = `
    <span>${t("daily.summary.total")} <strong class="${signClass(total)}">${fmtMoney(total)}</strong></span>
    &nbsp; · &nbsp;
    <span>${t("daily.summary.best")} <strong class="pnl-pos">${fmtMoney(best.pnl)}</strong></span>
    &nbsp; · &nbsp;
    <span>${t("daily.summary.worst")} <strong class="pnl-neg">${fmtMoney(worst.pnl)}</strong></span>
    &nbsp; · &nbsp;
    <span>${t("daily.summary.posDays")} <strong>${winDays}/${items.length}</strong></span>
  `;
}

function renderDaily() {
  const daily = (state.data && state.data.metrics && state.data.metrics.daily) || [];
  const items = aggregateDaily(daily, state.granularity);
  renderDailyPnlSummary(items);
  renderDailyBar(items);
  renderCalendar(items, state.granularity);
}

/* ─────────────────────────── Positions tab ─────────────────────────── */
function renderPositionsKpis(summary) {
  const root = document.getElementById("positionsKpis");
  if (!root) return;
  if (!summary) { root.innerHTML = ""; return; }
  const cards = [
    {
      label: t("positions.kpi.nlv"),
      value: fmtMoney(summary.totalNlv),
      sub: summary.asOf ? `${t("positions.asOf")}${summary.asOf}` : "",
    },
    {
      label: t("positions.kpi.marketValue"),
      value: fmtMoney(summary.totalMarketValue),
      sub: summary.positionPctOfNav != null ? `${summary.positionPctOfNav.toFixed(2)}% ${t("positions.kpi.ofNav")}` : "",
    },
    {
      label: t("positions.kpi.cash"),
      value: fmtMoney(summary.totalCash),
      sub: summary.cashPctOfNav != null ? `${summary.cashPctOfNav.toFixed(2)}% ${t("positions.kpi.ofNav")}` : "",
    },
    {
      label: t("positions.kpi.positionPct"),
      value: summary.positionPctOfNav != null ? `${summary.positionPctOfNav.toFixed(2)}%` : "—",
      sub: summary.cashPctOfNav != null ? `${t("positions.kpi.cashPct")} ${summary.cashPctOfNav.toFixed(2)}%` : "",
    },
  ];
  root.innerHTML = cards.map(c => `
    <div class="kpi-card">
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value">${c.value}</div>
      ${c.sub ? `<div class="kpi-sub">${c.sub}</div>` : ""}
    </div>
  `).join("");
}

// "Change" 列：当日单价变化（mark_today - mark_prev_day）+ 括号里当日百分比变化
function changeCellHtml(p) {
  if (p.dayChange == null) return "—";
  const sign = p.dayChange > 0 ? "+" : "";
  const cls = signClass(p.dayChange);
  const pctStr = p.dayChangePct != null
    ? ` (${p.dayChangePct >= 0 ? "+" : ""}${p.dayChangePct.toFixed(2)}%)`
    : "";
  return `<span class="${cls}">${sign}${fmtNum(p.dayChange, 2)}${pctStr}</span>`;
}

// "Unrealized P&L"（USD，括号里写相对成本基础的百分比）
function unrealizedCellHtml(p) {
  if (p.unrealizedPnlInBase == null) return "—";
  const cls = signClass(p.unrealizedPnlInBase);
  const base = fmtMoneySigned(p.unrealizedPnlInBase);
  // 百分比口径：相对成本基础（与 Change% 同口径，方便对照）
  let pctStr = "";
  if (p.markPrice != null && p.costBasisPrice) {
    const pct = (p.markPrice / p.costBasisPrice - 1) * 100;
    const sign = pct > 0 ? "+" : "";
    pctStr = ` (${sign}${pct.toFixed(2)}%)`;
  }
  return `<span class="${cls}">${base}${pctStr}</span>`;
}

// "Today's P&L"（USD，只有绝对值，无百分比）
function dayPnlCellHtml(p) {
  if (p.dayPnlInBase == null) return "—";
  return `<span class="${signClass(p.dayPnlInBase)}">${fmtMoneySigned(p.dayPnlInBase)}</span>`;
}

// sector 名字的 i18n 翻译（仅 default 集合；自定义 sector 显示原样）
const SECTOR_I18N = {
  en: { "半导体": "Semis", "存储": "Memory", "CPO": "CPO", "太空": "Space", "其他": "Other", "贵金属": "Precious Metals" },
  zh: { "半导体": "半导体", "存储": "存储", "CPO": "CPO", "太空": "太空", "其他": "其他", "贵金属": "贵金属" },
};
function tSector(s) {
  const m = SECTOR_I18N[state.lang] || {};
  return m[s] || s;
}

function positionRowHtml(p) {
  return `
    <tr>
      <td><strong>${p.symbol || "—"}</strong></td>
      <td><span class="ccy-badge">${p.assetCategory || ""}</span></td>
      <td class="num">${fmtNum(p.position, 0)}</td>
      <td class="num">${fmtMoneyCcy(p.costBasisPrice, "")}</td>
      <td class="num">${fmtMoneyCcy(p.markPrice, "")}</td>
      <td class="num">${changeCellHtml(p)}</td>
      <td class="num">${dayPnlCellHtml(p)}</td>
      <td class="num">${unrealizedCellHtml(p)}</td>
      <td class="num">${p.percentOfNAV != null ? p.percentOfNAV.toFixed(2) + "%" : "—"}</td>
      <td><span class="ccy-badge">${p.currency || ""}</span></td>
    </tr>
  `;
}

// 板块基色（按 sectorBreakdown 顺序循环使用）
const SECTOR_PALETTE = [
  "#7596b7",  // 蓝
  "#a08bba",  // 紫
  "#7eb6b6",  // 青绿
  "#b8a37e",  // 米褐
  "#c98c8c",  // 玫瑰
  "#9ab87a",  // 橄榄
  "#8bb0c4",  // 天蓝
  "#bfa0b9",  // 淡紫
];
const CASH_COLOR = "#8a93a6";

// 同板块内的个股用基色不同 alpha：最大持仓最深，越小越浅
function shadeOf(hex, idx, total) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const alpha = total <= 1 ? 1.0 : (1.0 - (idx / (total - 1)) * 0.5);
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

function emptyDoughnut(ctx, key) {
  const th = chartTheme();
  charts[key] = new Chart(ctx, {
    type: "doughnut",
    data: { labels: [t("empty.noData")], datasets: [{ data: [1], backgroundColor: [th.grid] }] },
    options: { plugins: { legend: { display: false }, tooltip: { enabled: false } } },
  });
}

function makeDoughnut(ctx, key, labels, data, colors, tipFmt) {
  const cssBg = getComputedStyle(document.documentElement).getPropertyValue("--bg-card").trim() || "#fff";
  charts[key] = new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: cssBg, borderWidth: 2 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "58%",
      plugins: {
        legend: { position: "right", labels: { boxWidth: 11, padding: 8, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: c => {
              const total = c.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? (c.parsed / total * 100).toFixed(1) : "—";
              return tipFmt
                ? tipFmt(c, pct)
                : `${c.label}: ${fmtMoney(c.parsed)} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}

function renderBySectorPie(breakdown, summary) {
  const ctx = document.getElementById("sectorPieChart");
  if (!ctx) return;
  destroyChart("sectorPie");
  const cash = (summary && summary.totalCash) || 0;
  const labels = [];
  const data = [];
  const colors = [];
  (breakdown || []).forEach((s, i) => {
    labels.push(tSector(s.sector));
    data.push(s.valueInBase);
    colors.push(SECTOR_PALETTE[i % SECTOR_PALETTE.length]);
  });
  if (cash > 0) { labels.push(t("positions.cash")); data.push(cash); colors.push(CASH_COLOR); }
  if (!data.length) return emptyDoughnut(ctx, "sectorPie");

  const cssBg = getComputedStyle(document.documentElement).getPropertyValue("--bg-card").trim() || "#fff";
  const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#222";
  charts.sectorPie = new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: cssBg, borderWidth: 2 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: { position: "right", labels: { boxWidth: 11, padding: 8, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: c => {
              const total = c.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? (c.parsed / total * 100).toFixed(1) : "—";
              return `${c.label}: ${fmtMoney(c.parsed)} (${pct}%)`;
            },
          },
        },
        datalabels: {
          display: "auto",
          color: textColor,
          font: { size: 12, weight: "600" },
          textStrokeColor: cssBg,
          textStrokeWidth: 3,
          formatter: (_v, ctxArg) => ctxArg.chart.data.labels[ctxArg.dataIndex],
        },
      },
    },
  });
}

function renderByPositionPie(positions, breakdown, summary) {
  const ctx = document.getElementById("posAllocChart");
  if (!ctx) return;
  destroyChart("posAlloc");
  const cash = (summary && summary.totalCash) || 0;

  // 按 breakdown 顺序确定板块染色顺序（与 sector 饼一致）
  const sectorOrder = (breakdown || []).map(b => b.sector);
  const sectorColor = {};
  sectorOrder.forEach((s, i) => { sectorColor[s] = SECTOR_PALETTE[i % SECTOR_PALETTE.length]; });

  // 把 positions 按板块（按 breakdown 顺序）→ 板块内按 value 倒序
  const bySector = new Map();
  for (const p of (positions || [])) {
    const s = p.sector || "其他";
    if (!bySector.has(s)) bySector.set(s, []);
    bySector.get(s).push(p);
  }
  for (const arr of bySector.values()) {
    arr.sort((a, b) => (b.positionValueInBase || 0) - (a.positionValueInBase || 0));
  }

  const labels = [];
  const data = [];
  const colors = [];
  // tooltip 用：每条记录的板块名，方便鼠标悬停时显示
  const sectorMeta = [];
  for (const s of sectorOrder) {
    const arr = bySector.get(s) || [];
    const base = sectorColor[s] || SECTOR_PALETTE[0];
    arr.forEach((p, i) => {
      labels.push(shortSymbol(p.symbol, p.assetCategory));
      data.push(p.positionValueInBase || 0);
      colors.push(shadeOf(base, i, arr.length));
      sectorMeta.push(s);
    });
  }
  if (cash > 0) {
    labels.push(t("positions.cash"));
    data.push(cash);
    colors.push(CASH_COLOR);
    sectorMeta.push("Cash");
  }
  if (!data.length) return emptyDoughnut(ctx, "posAlloc");
  // by-position 饼：切片内写 ticker，同时右侧也保留 legend
  const cssBg = getComputedStyle(document.documentElement).getPropertyValue("--bg-card").trim() || "#fff";
  const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#222";
  charts.posAlloc = new Chart(ctx, {
    type: "doughnut",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: cssBg, borderWidth: 2 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "55%",
      plugins: {
        legend: { position: "right", labels: { boxWidth: 11, padding: 8, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: c => {
              const total = c.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total ? (c.parsed / total * 100).toFixed(1) : "—";
              const sec = sectorMeta[c.dataIndex];
              return `${c.label} · ${tSector(sec)}: ${fmtMoney(c.parsed)} (${pct}%)`;
            },
          },
        },
        datalabels: {
          display: "auto",                          // 切片太小放不下时自动隐
          color: textColor,
          font: { size: 11, weight: "600" },
          textStrokeColor: cssBg,                   // 反差描边（在浅色切片上也清楚）
          textStrokeWidth: 3,
          formatter: (_v, ctxArg) => ctxArg.chart.data.labels[ctxArg.dataIndex],
        },
      },
    },
  });
}

function renderSectorTable(breakdown, summary) {
  const tbody = document.querySelector("#sectorTable tbody");
  const nlv = (summary && summary.totalNlv) || 0;
  const rows = [];
  (breakdown || []).forEach(s => {
    const pct = nlv ? (s.valueInBase / nlv * 100).toFixed(2) + "%" : "—";
    // 展示 ticker 列表（期权按 underlying 缩写，去重保留出现顺序）
    const seen = new Set();
    const tickers = (s.symbols || []).map(sym => {
      const isOpt = / /.test(sym);
      const base = isOpt ? sym.split(/\s+/)[0] : sym;
      return isOpt ? `${base}*` : base;
    }).filter(x => {
      if (seen.has(x)) return false;
      seen.add(x); return true;
    }).join(", ");
    rows.push(`
      <tr>
        <td><strong>${tSector(s.sector)}</strong></td>
        <td class="ticker-list">${tickers || "—"}</td>
        <td class="num">${fmtMoney(s.valueInBase)}</td>
        <td class="num">${pct}</td>
      </tr>
    `);
  });
  if (summary && summary.totalCash != null) {
    const cls = signClass(summary.totalCash);
    const pct = nlv ? (summary.totalCash / nlv * 100).toFixed(2) + "%" : "—";
    rows.push(`
      <tr>
        <td><strong>${t("positions.cash")}</strong></td>
        <td class="muted">—</td>
        <td class="num ${cls}">${fmtMoneySigned(summary.totalCash)}</td>
        <td class="num ${cls}">${pct}</td>
      </tr>
    `);
  }
  tbody.innerHTML = rows.join("") || `<tr><td colspan="4" class="empty">${t("empty.noData")}</td></tr>`;

  const note = document.getElementById("cashNote");
  const cash = (summary && summary.totalCash) || 0;
  if (cash < 0) {
    note.className = "muted allocation-note warn";
    note.textContent = `${t("positions.marginNote")} ${fmtMoneySigned(cash)}`;
  } else {
    note.textContent = "";
    note.className = "muted allocation-note";
  }
}

function renderAllocation(positions, breakdown, summary) {
  renderByPositionPie(positions, breakdown, summary);
  renderBySectorPie(breakdown, summary);
  renderSectorTable(breakdown, summary);
}

function renderPositions(positions) {
  const tbody = document.querySelector("#positionsTable tbody");
  if (!positions || !positions.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty">${t("empty.noData")}</td></tr>`;
    document.getElementById("positionsAsOf").textContent = "";
    return;
  }
  // "as of"
  const maxRd = positions.reduce((acc, p) => p.reportDate && p.reportDate > acc ? p.reportDate : acc, "");
  document.getElementById("positionsAsOf").textContent = maxRd ? t("positions.asOf") + maxRd : "";

  // 平铺，按 positionValueInBase 倒序（保持 analytics.py 给的顺序即可）
  const sorted = [...positions].sort((a, b) => (b.positionValueInBase || 0) - (a.positionValueInBase || 0));
  tbody.innerHTML = sorted.map(positionRowHtml).join("");
}

/* ─────────────────────────── Trades tab ─────────────────────────── */
// IBKR Flex dateTime 常见格式: "20260522 154518" / "20260522;154518" / "2026-05-22 15:45:18"
function parseTradeDT(s) {
  if (!s) return null;
  const m1 = s.match(/^(\d{4})(\d{2})(\d{2})[\s;](\d{2})(\d{2})(\d{2})/);
  if (m1) return new Date(Date.UTC(+m1[1], +m1[2]-1, +m1[3], +m1[4], +m1[5], +m1[6]));
  const m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s]?(\d{2})?:?(\d{2})?:?(\d{2})?/);
  if (m2) return new Date(Date.UTC(+m2[1], +m2[2]-1, +m2[3], +(m2[4]||0), +(m2[5]||0), +(m2[6]||0)));
  const m3 = s.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m3) return new Date(Date.UTC(+m3[1], +m3[2]-1, +m3[3]));
  return null;
}

function tradeRangeCutoff(trades, range) {
  // 锚点：数据里最近一笔的时间（不是 wall clock，因为 Flex 数据是隔夜的）
  let latest = null;
  for (const t of trades) {
    const d = parseTradeDT(t.dateTime);
    if (d && (!latest || d > latest)) latest = d;
  }
  if (!latest) return new Date(0);
  switch (range) {
    case "1d": {
      // 最近一个交易日：从最新交易日 00:00 开始
      return new Date(Date.UTC(latest.getUTCFullYear(), latest.getUTCMonth(), latest.getUTCDate()));
    }
    case "1w": { const c = new Date(latest); c.setUTCDate(c.getUTCDate() - 7); return c; }
    case "1m": { const c = new Date(latest); c.setUTCMonth(c.getUTCMonth() - 1); return c; }
    case "3m": { const c = new Date(latest); c.setUTCMonth(c.getUTCMonth() - 3); return c; }
    case "ytd": return new Date(Date.UTC(latest.getUTCFullYear(), 0, 1));
    default: return new Date(0);
  }
}

function filterTrades(trades) {
  if (!trades || !trades.length) return [];
  const cutoff = tradeRangeCutoff(trades, state.tradeRange);
  const cat = state.tradeCategory;
  return trades.filter(t => {
    if (cat !== "all" && t.assetCategory !== cat) return false;
    const dt = parseTradeDT(t.dateTime);
    return dt && dt >= cutoff;
  });
}

function renderTrades() {
  const allTrades = (state.data && state.data.metrics && state.data.metrics.recentTrades) || [];
  const filtered = filterTrades(allTrades);
  const tbody = document.querySelector("#tradesTable tbody");
  const counter = document.getElementById("tradesCount");
  counter.textContent = `${filtered.length} / ${allTrades.length}`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="empty">${t("empty.noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map(tr => `
    <tr>
      <td>${tr.dateTime || ""}</td>
      <td><strong>${shortSymbol(tr.symbol, tr.assetCategory) || ""}</strong></td>
      <td><span class="ccy-badge">${tr.assetCategory || ""}</span></td>
      <td>${tr.buySell || ""}</td>
      <td class="num">${fmtNum(tr.quantity, 0)}</td>
      <td class="num">${fmtMoneyCcy(tr.tradePrice, "")}</td>
      <td class="num">${fmtMoneyCcy(tr.ibCommission, "")}</td>
      <td class="num ${signClass(tr.realizedPnlInBase)}">${tr.realizedPnlInBase == null ? "—" : fmtMoney(tr.realizedPnlInBase)}</td>
      <td><span class="ccy-badge">${tr.currency || ""}</span></td>
    </tr>
  `).join("");
}

/* ─────────────────────────── By Symbol tab ─────────────────────────── */
// OCC 期权符号缩写：'ASTS  260618C00090000' → 'ASTS 90C 6/18'
function shortSymbol(sym, cat) {
  if (cat !== "OPT" || !sym) return sym;
  const m = sym.match(/^(\S+)\s+(\d{2})(\d{2})(\d{2})([CP])(\d{8})$/);
  if (!m) return sym;
  const [, underlying, , mm, dd, cp, strikeStr] = m;
  const strike = parseInt(strikeStr, 10) / 1000;
  return `${underlying} ${strike}${cp} ${parseInt(mm, 10)}/${parseInt(dd, 10)}`;
}

function topNDiverging(bySymbol, cat, nStr) {
  const filtered = bySymbol.filter(r => r.assetCategory === cat && r.realizedPnlInBase != null);
  if (nStr === "all") {
    return [...filtered].sort((a, b) => b.realizedPnlInBase - a.realizedPnlInBase);
  }
  const n = +nStr;
  const gains = filtered.filter(r => r.realizedPnlInBase > 0)
    .sort((a, b) => b.realizedPnlInBase - a.realizedPnlInBase).slice(0, n);
  // Top N 亏损：先按「最负」挑出 N 条，再反转排序——亏得少的在上面、亏得最多的压底
  const losses = filtered.filter(r => r.realizedPnlInBase < 0)
    .sort((a, b) => a.realizedPnlInBase - b.realizedPnlInBase)
    .slice(0, n)
    .reverse();
  return [...gains, ...losses];   // 顶部最大盈利、底部最大亏损
}

function renderBySymbol(bySymbol) {
  bySymbol = bySymbol || [];
  const rows = topNDiverging(bySymbol, state.bySymbolType, state.bySymbolTopN);
  destroyChart("bySymbol");
  const ctx = document.getElementById("bySymbolChart");
  if (!ctx) return;
  const th = chartTheme();
  if (!rows.length) {
    charts.bySymbol = new Chart(ctx, {
      type: "bar",
      data: { labels: [t("empty.noData")], datasets: [{ data: [0], backgroundColor: th.grid }] },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { grid: { display: false } } },
      },
    });
    return;
  }
  charts.bySymbol = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rows.map(r => shortSymbol(r.symbol, r.assetCategory)),
      datasets: [{
        data: rows.map(r => r.realizedPnlInBase),
        backgroundColor: rows.map(r => r.realizedPnlInBase >= 0 ? th.green : th.red),
        borderRadius: 3,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => "$" + fmtNum(ctx.parsed.x, 2) } },
      },
      scales: {
        x: {
          grid: { color: th.grid },
          ticks: { callback: v => "$" + fmtMoneyCompact(v) },
        },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

function renderBySymbolTable(bySymbol) {
  const tbody = document.querySelector("#bySymbolTable tbody");
  let rows = bySymbol || [];
  if (state.bySymbolTableCat !== "all") {
    rows = rows.filter(r => r.assetCategory === state.bySymbolTableCat);
  }
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty">${t("empty.noData")}</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><strong>${shortSymbol(r.symbol, r.assetCategory)}</strong></td>
      <td><span class="ccy-badge">${r.assetCategory || ""}</span></td>
      <td class="num">${r.tradeCount}</td>
      <td class="num">${fmtMoneyCcy(r.realizedPnl, "")}</td>
      <td class="num ${signClass(r.realizedPnlInBase)}">${fmtMoney(r.realizedPnlInBase)}</td>
      <td class="num">${fmtMoneyCcy(r.commission, "")}</td>
      <td><span class="ccy-badge">${r.currency || ""}</span></td>
    </tr>
  `).join("");
}

/* ─────────────────────────── Notes tab ─────────────────────────── */
function renderNotes(notes) {
  const ul = document.getElementById("notesList");
  if (!notes || !notes.length) {
    ul.innerHTML = `<li class="muted">${t("empty.noData")}</li>`;
    return;
  }
  ul.innerHTML = notes.map(n => {
    if (typeof n === "string") {
      return `<li>${n}</li>`;
    }
    const text = n[state.lang] || n.en || n.zh || JSON.stringify(n);
    const code = n.code ? `<span class="code-tag">${n.code}</span>` : "";
    return `<li>${code}${text}</li>`;
  }).join("");
}

/* ─────────────────────────── Header / NLV ─────────────────────────── */
// pulledAt 从 ibkr_flex_pull.py 来时是文件名安全的 "20260523T173427Z"，
// 这里把它格式化成 ISO 8601 ("2026-05-23T17:34:27Z")，跟 builtAt 一致。
function formatPulledStamp(s) {
  if (!s) return "—";
  if (/[-:]/.test(s)) return s;       // 已经是 ISO 风格的直接返回
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return s;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
}

function renderHeader(d) {
  const m = (d && d.metrics) || {};
  const built = document.getElementById("builtAt");
  if (built) built.textContent = (d && d.builtAt) || "—";
  const pulled = document.getElementById("pulledAt");
  if (pulled) pulled.textContent = formatPulledStamp(m.latestPulledAt);
}

/* ─────────────────────────── Render all ─────────────────────────── */
function renderAll() {
  applyI18n();
  applyTheme();
  applyTab();
  applyChartDefaults();
  if (!state.data) return;
  const m = state.data.metrics || {};
  renderHeader(state.data);
  renderEquityKpis(m.overall || {}, m.daily || []);
  renderEquityChart(m.daily || []);
  renderDrawdownChart(m.daily || []);
  renderEquityStats(m.overall || {});
  renderDaily();
  renderPositionsKpis(m.accountSummary);
  renderPositions(m.positions || []);
  renderAllocation(m.positions || [], m.sectorBreakdown || [], m.accountSummary || {});
  renderTrades();
  renderBySymbol(m.bySymbol || []);
  renderBySymbolTable(m.bySymbol || []);
  renderNotes(m.notes || []);
}

/* ─────────────────────────── Data loading ─────────────────────────── */
async function loadData() {
  try {
    const res = await fetch(`./data/dashboard.json?t=${Date.now()}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    state.data = await res.json();
    renderAll();
  } catch (e) {
    console.error(e);
    document.querySelector("main").innerHTML =
      `<div class="card"><div class="empty">${t("empty.dashboard")}<br/><small style="opacity:0.6">${e.message}</small></div></div>`;
  }
}

/* ─────────────────────────── Event wiring ─────────────────────────── */
function wireControls() {
  document.getElementById("langToggle").addEventListener("click", () => {
    state.lang = state.lang === "zh" ? "en" : "zh";
    localStorage.setItem("ibkr.lang", state.lang);
    renderAll();
  });
  document.getElementById("themeToggle").addEventListener("click", () => {
    state.theme = state.theme === "light" ? "dark" : "light";
    localStorage.setItem("ibkr.theme", state.theme);
    renderAll();
  });
  document.getElementById("refreshBtn").addEventListener("click", loadData);

  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      state.tab = btn.dataset.tab;
      localStorage.setItem("ibkr.tab", state.tab);
      applyTab();
    });
  });

  document.querySelectorAll(".seg-group").forEach(group => {
    const control = group.dataset.control;
    group.querySelectorAll(".seg").forEach(seg => {
      seg.addEventListener("click", () => {
        group.querySelectorAll(".seg").forEach(s => s.classList.remove("active"));
        seg.classList.add("active");
        state[control] = seg.dataset.value;
        // 路由：哪个 control 触发哪个重渲染
        if (control === "granularity") renderDaily();
        else if (control === "tradeCategory") renderTrades();
        else if (control === "bySymbolType") {
          renderBySymbol((state.data && state.data.metrics && state.data.metrics.bySymbol) || []);
        }
        else if (control === "bySymbolTableCat") {
          renderBySymbolTable((state.data && state.data.metrics && state.data.metrics.bySymbol) || []);
        }
      });
    });
  });

  // <select> 控件（toggle list）
  const tradeRangeSel = document.getElementById("tradeRangeSelect");
  if (tradeRangeSel) {
    tradeRangeSel.value = state.tradeRange;
    tradeRangeSel.addEventListener("change", () => {
      state.tradeRange = tradeRangeSel.value;
      renderTrades();
    });
  }
  const topNSel = document.getElementById("bySymbolTopNSelect");
  if (topNSel) {
    topNSel.value = state.bySymbolTopN;
    topNSel.addEventListener("change", () => {
      state.bySymbolTopN = topNSel.value;
      renderBySymbol((state.data && state.data.metrics && state.data.metrics.bySymbol) || []);
    });
  }
}

/* ─────────────────────────── Boot ─────────────────────────── */
wireControls();
loadData();
