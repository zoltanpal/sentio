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
import type { LiveQueryResponse } from "@/features/dashboard/types";

import { formatWindow } from "@/lib/utils";

type DashboardSummaryCardProps = {
  data: LiveQueryResponse;
  sourceCount: number;
};

type SentimentDirection = "improving" | "worsening" | "stable";



const trendStyles = {
  improving: {
    color: "#16a34a",
    points:
      "0,21 4,20 8,23 12,21 16,24 20,22 24,23 28,21 32,22 36,18 40,20 44,19 48,21 52,18 56,20 60,19 64,22 68,18 72,20 76,17 80,19 84,18 88,20 92,17 96,18 100,16 104,17 108,13 112,14 116,10 120,9 124,5 128,3",
    endpoint: 3,
  },
  worsening: {
    color: "#dc2626",
    points:
      "0,11 4,12 8,15 12,14 16,17 20,16 24,18 28,17 32,13 36,14 40,12 44,13 48,10 52,12 56,14 60,13 64,15 68,14 72,10 76,13 80,11 84,14 88,12 92,15 96,13 100,15 104,14 108,18 112,17 116,21 120,22 124,27 128,30",
    endpoint: 30,
  },
  stable: {
    color: "#d97706",
    points:
      "0,16 4,14 8,15 12,18 16,17 20,19 24,16 28,17 32,13 36,15 40,14 44,16 48,12 52,14 56,15 60,13 64,16 68,18 72,15 76,14 80,17 84,15 88,13 92,16 96,18 100,17 104,14 108,16 112,15 116,17 120,14 124,16 128,15",
    endpoint: 15,
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
      className="h-12 w-full"
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


function getCoverageComparison(
  currentCount: number,
  previousCount: number,
  windowLabel: string,
) {
  if (previousCount === 0) {
    return null;
  }

  // Avoid dramatic percentages based on very small samples.
  if (currentCount < 3 || previousCount < 3) {
    return null;
  }

  const percentage =
    ((currentCount - previousCount) / previousCount) * 100;

  if (Math.abs(percentage) < 10) {
    return {
      label: `Similar to previous ${windowLabel}`,
      direction: "stable" as const,
    };
  }

  return {
    label: `${percentage > 0 ? "↑" : "↓"} ${Math.abs(
      Math.round(percentage),
    )}% vs previous ${windowLabel}`,
    direction: percentage > 0
      ? ("up" as const)
      : ("down" as const),
  };
}

export default function DashboardSummaryCard({
  data,
  sourceCount,
}: DashboardSummaryCardProps) {
  const { aggregated, change } = data;
  const isImproving = change?.direction === "improving";
  const isWorsening = change?.direction === "worsening";

  const normalizedDelta =
    change && Math.abs(change.delta) < 0.005
      ? 0
      : change?.delta;

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

  const changeClass = isImproving
    ? "text-emerald-600"
    : isWorsening
      ? "text-red-600"
      : "text-amber-600";

  const currentClass =
    aggregated.distribution.positive_pct >
    aggregated.distribution.negative_pct
      ? "text-emerald-600"
      : aggregated.distribution.negative_pct >
          aggregated.distribution.positive_pct
        ? "text-red-600"
        : "text-slate-900";
  const total = Math.max(aggregated.article_count, 1);
  const reason = data.what_driving?.main_reason ?? null;

  const coverageComparison = change
    ? getCoverageComparison(
        aggregated.article_count,
        change.previous.article_count,
        formatWindow(data.window_hours),
      )
    : null;

      return (
    <section
      className="overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white shadow-sm shadow-slate-200/40"
      aria-label="Sentiment summary"
    >
      <div className="grid grid-cols-2 md:grid-cols-6 xl:grid-cols-[2fr_3fr_1.5fr_3fr_2.5fr]">
        <div className="order-1 col-span-1 border-b border-r border-slate-100 p-4 sm:p-5 md:col-span-2 xl:col-span-1 xl:border-b-0">
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

        <div className="order-3 col-span-2 border-b border-slate-100 p-4 sm:p-5 md:order-2 md:col-span-2 md:border-r xl:col-span-1 xl:border-b-0">
          <SummaryLabel description="The current balance of positive, neutral, and negative articles in the selected period.">
            Current
          </SummaryLabel>

          <div
            className={`mt-3 text-xl font-bold capitalize tracking-tight sm:text-2xl ${currentClass}`}
          >
            {aggregated.summary.label.replace(/_/g, " ")}
          </div>

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

        <div className="order-2 col-span-1 border-b border-slate-100 p-4 sm:p-5 md:order-3 md:col-span-2 xl:col-span-1 xl:border-b-0 xl:border-r">
          <SummaryLabel description="The difference between the current average sentiment score and the previous equivalent period. Scores range from −1 to +1.">
            Change
          </SummaryLabel>

          <div
            className={`mt-5 text-3xl font-bold tracking-tight sm:text-4xl ${changeClass}`}
          >
          {normalizedDelta !== undefined
            ? `${normalizedDelta > 0 ? "+" : ""}${normalizedDelta.toFixed(2)}`
            : "—"}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            vs previous {formatWindow(data.window_hours)}
          </p>
        </div>

        <div className="order-4 col-span-2 border-b border-slate-100 p-4 sm:p-5 md:col-span-4 md:border-r xl:col-span-1 xl:border-b-0">
          <SummaryLabel description="The most prominent story currently contributing to the sentiment movement.">
            Main reason
          </SummaryLabel>

          <div className="mt-4 flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100">
              <SearchCheckIcon className="h-5 w-5" />
            </span>

            <p className="line-clamp-4 text-sm font-semibold leading-6 text-slate-800 sm:text-base">
              {reason && reason.length > 0
                ? reason
                : "No dominant story identified yet"}
            </p>
          </div>
        </div>

        <div className="order-5 col-span-2 p-4 sm:p-5 md:col-span-2 xl:col-span-1">
          <SummaryLabel description="Matching articles and news sources in the selected period. The percentage shows the change in article count compared with the previous equivalent period.">
            Coverage
          </SummaryLabel>

          <div className="mt-4 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <FileTextIcon className="h-5 w-5" />
            </span>

            <div className="min-w-0 text-sm leading-5 text-slate-500">
              <span className="block text-3xl font-bold tracking-tight text-blue-600">
                {aggregated.article_count}
              </span>

              <span className="block">
                articles from {sourceCount} sources
              </span>

              {coverageComparison && (
                <span
                  className={`mt-1 block text-xs font-semibold ${
                    coverageComparison.direction === "up"
                      ? "text-blue-600"
                      : "text-slate-500"
                  }`}
                >
                  {coverageComparison.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
