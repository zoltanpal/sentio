import {
  FileTextIcon,
  InfoIcon,
  SearchCheckIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";
import type { LiveQueryResponse } from "@/hooks/useDashboardData";

type DashboardSummaryCardProps = {
  data: LiveQueryResponse;
  sourceCount: number;
};

type SentimentDirection = "improving" | "worsening" | "stable";

const trendStyles = {
  improving: {
    color: "#16a34a",
    points:
      "0,26 8,24 16,25 24,22 32,23 40,19 48,21 56,17 64,19 72,15 80,17 88,12 96,14 104,10 112,11 120,7 128,5",
    endpoint: 5,
  },
  worsening: {
    color: "#dc2626",
    points:
      "0,7 8,10 16,9 24,13 32,11 40,15 48,13 56,17 64,15 72,19 80,17 88,22 96,20 104,25 112,23 120,28 128,30",
    endpoint: 30,
  },
  stable: {
    color: "#d97706",
    points:
      "0,17 8,14 16,18 24,16 32,19 40,15 48,17 56,14 64,17 72,19 80,15 88,18 96,16 104,19 112,15 120,17 128,16",
    endpoint: 16,
  },
} satisfies Record<
  SentimentDirection,
  { color: string; points: string; endpoint: number }
>;

function SummaryLabel({
  children,
  description,
}: {
  children: ReactNode;
  description: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-500">
      <span>{children}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="-my-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={`What does ${String(children)} mean?`}
          >
            <InfoIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-72 rounded-xl border-slate-200 p-4 shadow-lg"
        >
          <p className="text-sm font-semibold normal-case tracking-normal text-slate-950">
            {children}
          </p>
          <p className="mt-1.5 text-sm font-normal normal-case leading-6 tracking-normal text-slate-600">
            {description}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DirectionSparkline({ direction }: { direction: SentimentDirection }) {
  const trend = trendStyles[direction];
  const areaPoints = `${trend.points} 128,32 0,32`;

  return (
    <svg
      viewBox="0 0 128 32"
      className="h-8 w-full"
      role="img"
      aria-label={`${direction} direction indicator`}
      preserveAspectRatio="none"
    >
      <polygon fill={trend.color} fillOpacity="0.08" points={areaPoints} />
      <polyline
        fill="none"
        stroke={trend.color}
        strokeWidth="2"
        points={trend.points}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx="128" cy={trend.endpoint} r="2.75" fill={trend.color} />
    </svg>
  );
}

export default function DashboardSummaryCard({
  data,
  sourceCount,
}: DashboardSummaryCardProps) {
  const { aggregated, change } = data;
  const isImproving = change?.direction === "improving";
  const isWorsening = change?.direction === "worsening";
  const direction = isImproving
    ? "Improving"
    : isWorsening
      ? "Worsening"
      : "Stable";
  const trendDirection: SentimentDirection = isImproving
    ? "improving"
    : isWorsening
      ? "worsening"
      : "stable";
  const directionClass = isImproving
    ? "text-emerald-600"
    : isWorsening
      ? "text-red-600"
      : "text-amber-600";
  const changeClass =
    change && change.delta > 0
      ? "text-emerald-600"
      : change && change.delta < 0
        ? "text-red-600"
        : "text-slate-600";
  const currentClass =
    aggregated.distribution.positive_pct >
    aggregated.distribution.negative_pct
      ? "text-emerald-600"
      : aggregated.distribution.negative_pct >
          aggregated.distribution.positive_pct
        ? "text-red-600"
        : "text-slate-900";
  const total = Math.max(aggregated.article_count, 1);
  const reason = data.what_driving?.[0]?.representative_title ?? null;

  return (
    <section
      className="overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40"
      aria-label="Sentiment summary"
    >
      <div className="grid grid-cols-2 md:grid-cols-6 xl:grid-cols-12">
        <div className="order-1 col-span-1 border-b border-r border-slate-100 p-4 sm:p-5 md:col-span-2 xl:col-span-2 xl:border-b-0">
          <SummaryLabel description="How the overall news tone is moving compared with the previous equivalent time window.">
            Trend
          </SummaryLabel>
          <div
            className={`mt-3 flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl ${directionClass}`}
          >
            <span>{direction}</span>
            {isImproving ? (
              <TrendingUpIcon className="h-5 w-5 shrink-0" />
            ) : isWorsening ? (
              <TrendingDownIcon className="h-5 w-5 shrink-0" />
            ) : null}
          </div>
          <div className="mt-5 max-w-40">
            <DirectionSparkline direction={trendDirection} />
          </div>
        </div>

        <div className="order-3 col-span-2 border-b border-slate-100 p-4 sm:p-5 md:order-2 md:col-span-2 md:border-r xl:col-span-3 xl:border-b-0">
          <SummaryLabel description="The current balance of positive, neutral, and negative articles in the selected period.">
            Current
          </SummaryLabel>
          <p
            className={`mt-3 text-xl font-bold capitalize tracking-tight sm:text-2xl ${currentClass}`}
          >
            {aggregated.summary.label.replace(/_/g, " ")}
          </p>
          <div
            className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-slate-100"
            aria-label={`${aggregated.distribution.positive_pct}% positive, ${aggregated.distribution.neutral_pct}% neutral, ${aggregated.distribution.negative_pct}% negative`}
          >
            <span
              className="bg-emerald-500"
              style={{
                width: `${(aggregated.distribution.positive_count / total) * 100}%`,
              }}
            />
            <span
              className="bg-amber-400"
              style={{
                width: `${(aggregated.distribution.neutral_count / total) * 100}%`,
              }}
            />
            <span
              className="bg-red-500"
              style={{
                width: `${(aggregated.distribution.negative_count / total) * 100}%`,
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem] font-medium">
            <span className="text-emerald-600">
              {aggregated.distribution.positive_pct}% positive
            </span>
            <span className="text-slate-500">
              {aggregated.distribution.neutral_pct}% neutral
            </span>
            <span className="text-red-600">
              {aggregated.distribution.negative_pct}% negative
            </span>
          </div>
        </div>

        <div className="order-2 col-span-1 border-b border-slate-100 p-4 sm:p-5 md:order-3 md:col-span-2 xl:col-span-2 xl:border-b-0 xl:border-r">
          <SummaryLabel description="The difference between the current average sentiment score and the previous equivalent period. Scores range from −1 to +1.">
            Change
          </SummaryLabel>
          <p
            className={`mt-5 text-3xl font-bold tracking-tight sm:text-4xl ${changeClass}`}
          >
            {change
              ? `${change.delta > 0 ? "+" : ""}${change.delta.toFixed(2)}`
              : "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            vs previous {data.window_hours}h
          </p>
        </div>

        <div className="order-4 col-span-2 border-b border-slate-100 p-4 sm:p-5 md:col-span-4 md:border-r xl:col-span-3 xl:border-b-0">
          <SummaryLabel description="The most prominent story currently contributing to the sentiment movement.">
            Main reason
          </SummaryLabel>
          <div className="mt-4 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100">
              <SearchCheckIcon className="h-5 w-5" />
            </span>
            <p className="line-clamp-4 text-sm font-semibold leading-6 text-slate-800 sm:text-base">
              {reason ?? "No dominant story identified yet"}
            </p>
          </div>
        </div>

        <div className="order-5 col-span-2 p-4 sm:p-5 md:col-span-2 xl:col-span-2">
          <SummaryLabel description="The number of matching articles and distinct news sources found in the selected period.">
            Coverage
          </SummaryLabel>
          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <FileTextIcon className="h-5 w-5" />
            </span>
            <p className="text-sm leading-5 text-slate-500">
              <span className="block text-3xl font-bold tracking-tight text-blue-600">
                {aggregated.article_count}
              </span>
              articles from {sourceCount} sources
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
