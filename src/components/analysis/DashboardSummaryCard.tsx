import { FileTextIcon, SearchCheckIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

type DashboardSummaryCardProps = {
  data: any;
  sourceCount: number;
};

type SentimentDirection = "improving" | "worsening" | "stable";

function DirectionSparkline({
  direction,
}: {
  direction: SentimentDirection;
}) {
  const trend = {
    improving: {
      color: "#16a34a",
      points: "0,32 6,28 13,30 20,26 27,29 35,24 43,26 51,20 59,23 67,18 75,20 83,15 91,17 100,12 109,14 118,9 128,11 138,7 149,9 160,4",
      endpoint: "4",
    },
    worsening: {
      color: "#dc2626",
      points: "0,7 6,11 13,9 20,14 27,11 35,16 43,14 51,20 59,17 67,23 75,20 83,26 91,23 100,29 109,26 118,32 128,29 138,35 149,32 160,36",
      endpoint: "36",
    },
    stable: {
      color: "#d97706",
      points: "0,20 6,17 13,21 20,19 27,23 35,18 43,21 51,17 59,20 67,22 75,18 83,21 91,19 100,23 109,18 118,20 128,17 138,21 149,19 160,20",
      endpoint: "20",
    },
  }[direction];
  const areaPoints = `${trend.points} 160,40 0,40`;

  return (
    <svg viewBox="0 0 160 40" className="mt-4 h-10 w-full" role="img" aria-label={`${direction} sentiment trend`}>
      <polygon fill={trend.color} fillOpacity="0.12" points={areaPoints} />
      <polyline fill="none" stroke={trend.color} strokeWidth="2.25" points={trend.points} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="160" cy={trend.endpoint} r="3.25" fill={trend.color} />
    </svg>
  );
}

export default function DashboardSummaryCard({ data, sourceCount }: DashboardSummaryCardProps) {
  const { aggregated, change, drivers } = data;
  const isImproving = change?.direction === "improving";
  const isWorsening = change?.direction === "worsening";
  const direction = isImproving ? "Improving" : isWorsening ? "Worsening" : "Stable";
  const trendDirection: SentimentDirection = isImproving
    ? "improving"
    : isWorsening
      ? "worsening"
      : "stable";
  const directionClass = isImproving ? "text-emerald-600" : isWorsening ? "text-red-600" : "text-amber-600";
  const changeColor =
    change?.delta && change.delta > 0
      ? "#16a34a"
      : change?.delta && change.delta < 0
        ? "#dc2626"
        : "#64748b";
  const total = Math.max(aggregated.article_count, 1);
  // const reason =
  //   typeof data.what_driving === "string" && data.what_driving.trim()
  //     ? data.what_driving
  //     : getDriverTitle(drivers);
  const reason = null; // Temporarily disable the reason until we have a better way to determine it

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-5">
        <div className="p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Sentiment</p>
          <div className={`mt-3 flex items-center gap-2 text-2xl font-bold ${directionClass}`}>
            {direction}
            {isImproving ? <TrendingUpIcon className="h-5 w-5" /> : isWorsening ? <TrendingDownIcon className="h-5 w-5" /> : null}
          </div>
          <DirectionSparkline direction={trendDirection} />
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current</p>
          <p className="mt-3 text-xl font-bold capitalize text-slate-900">{aggregated.summary.label.replace(/_/g, " ")}</p>
          <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-slate-100">
            <span className="bg-emerald-400" style={{ width: `${(aggregated.distribution.positive_count / total) * 100}%` }} />
            <span className="bg-amber-400" style={{ width: `${(aggregated.distribution.neutral_count / total) * 100}%` }} />
            <span className="bg-red-400" style={{ width: `${(aggregated.distribution.negative_count / total) * 100}%` }} />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            <span className="text-emerald-600">{aggregated.distribution.positive_pct}% positive</span>
            <span className="mx-2">•</span>
            <span>{aggregated.distribution.neutral_pct}% neutral</span>
            <span className="mx-2">•</span>
            <span className="text-red-500">{aggregated.distribution.negative_pct}% negative</span>
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Change</p>
          <p className="mt-5 text-3xl font-bold" style={{ color: changeColor }}>
            {change ? `${change.delta > 0 ? "+" : ""}${change.delta.toFixed(2)}` : "—"}
          </p>
          <p className="mt-2 text-sm text-slate-500">vs previous {data.window_hours}h</p>
        </div>

        <div className="p-4 sm:p-5 xl:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Main reason</p>
          <div className="mt-4 flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500"><SearchCheckIcon className="h-5 w-5" /></span>
            <p className="text-sm font-semibold leading-5 text-slate-800">
              {reason ?? "No primary reason available"}
              
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Coverage</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600"><FileTextIcon className="h-5 w-5" /></span>
            <p className="text-sm leading-5 text-slate-500"><span className="block text-2xl font-bold text-blue-600">{aggregated.article_count}</span>articles from {sourceCount} sources</p>
          </div>
        </div>
      </div>
    </section>
  );
}
