import { Link } from "react-router-dom";
import {
  InfoIcon,
  LoaderCircleIcon,
  MinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  Trash2Icon,
} from "lucide-react";

import type { WatchlistEntity } from "@/auth/UserSessionContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/ui/popover";
import type { WatchlistOverviewRow, WatchlistWindow } from "@/features/watchlist/useWatchlistOverview";

type Props = {
  followed: WatchlistEntity[];
  rows: WatchlistOverviewRow[];
  windowHours: WatchlistWindow;
  loading: boolean;
  actionsDisabled: boolean;
  removingId: number | null;
  onRemove: (entity: WatchlistEntity) => void;
};

type MetricKey = "articles" | "sentiment" | "distribution" | "latest";

const METRIC_INFO: Record<MetricKey, { title: string; description: string; detail?: string }> = {
  articles: {
    title: "Article coverage",
    description: "The number of articles mentioning this entity in the selected time window.",
    detail: "The percentage compares article volume with the preceding window of equal length. Sources counts distinct news sources.",
  },
  sentiment: {
    title: "Average sentiment",
    description: "The average sentiment score of analyzed articles mentioning this entity, from -1 (negative) to +1 (positive).",
    detail: "This measures sentiment of the whole article, not necessarily sentiment toward the entity. The change is the difference from the preceding window. A dash means no score is available.",
  },
  distribution: {
    title: "Sentiment distribution",
    description: "The breakdown of analyzed articles into positive, neutral, and negative sentiment.",
    detail: "The bar shows proportions, and the labels show article counts. Articles without a sentiment result are excluded.",
  },
  latest: {
    title: "Latest article",
    description: "The most recently published article mentioning this entity during the selected time window.",
    detail: "Open the headline to read the original article on the publisher's website.",
  },
};

function MetricInfo({ metric, label }: { metric: MetricKey; label: string }) {
  const info = METRIC_INFO[metric];

  return (
    <span className="inline-flex max-w-full items-center gap-0.5 whitespace-nowrap">
      <span>{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`About ${label.toLowerCase()}`}
            className="-my-1 inline-flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
          >
            <InfoIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="w-72 max-w-[calc(100vw-1.5rem)] space-y-2 p-4 text-left text-sm leading-relaxed text-slate-600"
        >
          <p className="font-semibold text-slate-900">{info.title}</p>
          <p>{info.description}</p>
          {info.detail && <p className="text-xs text-slate-500">{info.detail}</p>}
        </PopoverContent>
      </Popover>
    </span>
  );
}

function numberLabel(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

function scoreLabel(value: number | null): string {
  if (value === null) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

function scoreColor(value: number | null): string {
  if (value === null) return "text-slate-400";
  if (value >= 0.05) return "text-emerald-700";
  if (value <= -0.05) return "text-rose-700";
  return "text-slate-700";
}

function changeColor(change: number): string {
  if (change > 0) return "text-emerald-700";
  if (change < 0) return "text-rose-700";
  return "text-slate-500";
}

function safeArticleUrl(link: string | null): string | null {
  if (!link) return null;
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:" ? link : null;
  } catch {
    return null;
  }
}

function formatArticleDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function volumeDelta(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "New coverage" : "No coverage";
  const pct = Math.round(((current - previous) / previous) * 100);
  return `${pct > 0 ? "+" : ""}${pct}% vs previous`;
}

function dashboardUrl(item: WatchlistEntity, windowHours: WatchlistWindow): string {
  const params = new URLSearchParams({
    q: item.entity_name,
    entity_id: String(item.entity_id),
    timewindow: String(windowHours),
  });
  return `/dashboard?${params.toString()}`;
}

function Coverage({ row, loading }: { row?: WatchlistOverviewRow; loading: boolean }) {
  if (!row) return <span className="text-sm text-slate-400">{loading ? "Loading…" : "—"}</span>;

  return (
    <div>
      <div className="text-xl font-semibold leading-tight tabular-nums text-slate-900 lg:text-base">{numberLabel(row.article_count)}</div>
      <div className="mt-0.5 text-xs text-slate-500">{volumeDelta(row.article_count, row.previous_article_count)}</div>
      <div className="mt-0.5 text-xs text-slate-400">
        {row.source_count} {row.source_count === 1 ? "source" : "sources"}
      </div>
    </div>
  );
}

function Sentiment({ row, loading }: { row?: WatchlistOverviewRow; loading: boolean }) {
  if (!row) return <span className="text-sm text-slate-400">{loading ? "Loading…" : "—"}</span>;

  const change = row.sentiment_change;
  return (
    <div>
      <div className={`text-xl font-semibold leading-tight tabular-nums lg:text-base ${scoreColor(row.avg_sentiment)}`}>
        {scoreLabel(row.avg_sentiment)}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs leading-snug">
        {change === null ? (
          <span className="text-slate-400">No comparison</span>
        ) : (
          <span className={`inline-flex items-center gap-1 ${changeColor(change)}`}>
            {change > 0 ? (
              <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" />
            ) : change < 0 ? (
              <TrendingDownIcon className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <MinusIcon className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="tabular-nums">{scoreLabel(change)} vs previous</span>
          </span>
        )}
      </div>
      {row.article_count > row.analyzed_count && (
        <div className="mt-0.5 text-xs text-slate-400">
          {row.analyzed_count}/{row.article_count} analyzed
        </div>
      )}
    </div>
  );
}

function Distribution({ row, loading }: { row?: WatchlistOverviewRow; loading: boolean }) {
  if (!row) return <span className="text-sm text-slate-400">{loading ? "Loading…" : "—"}</span>;

  const total = row.positive_count + row.neutral_count + row.negative_count;
  if (total === 0) return <span className="text-xs text-slate-400">No analyzed articles</span>;

  const segments = [
    { name: "Positive", count: row.positive_count, color: "bg-emerald-500" },
    { name: "Neutral", count: row.neutral_count, color: "bg-slate-300" },
    { name: "Negative", count: row.negative_count, color: "bg-rose-500" },
  ];

  return (
    <div
      role="img"
      aria-label={`Positive: ${row.positive_count}, neutral: ${row.neutral_count}, negative: ${row.negative_count}`}
      className="w-full min-w-0 lg:max-w-48"
    >
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map((segment) => (
          <span
            key={segment.name}
            className={segment.color}
            style={{ width: `${(segment.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div
        className="mt-2 flex flex-wrap justify-between gap-x-2 gap-y-1 text-[11px] tabular-nums text-slate-500"
        aria-hidden="true"
      >
        <span className="text-emerald-700">{row.positive_count} pos</span>
        <span>{row.neutral_count} neu</span>
        <span className="text-rose-700">{row.negative_count} neg</span>
      </div>
    </div>
  );
}

function LatestArticle({ row, loading }: { row?: WatchlistOverviewRow; loading: boolean }) {
  if (!row) return <span className="text-xs text-slate-400">{loading ? "Loading…" : "—"}</span>;
  if (!row.latest_title) return <span className="text-xs text-slate-400">No recent articles</span>;

  const articleUrl = safeArticleUrl(row.latest_link);
  const publishedAt = formatArticleDate(row.latest_published_at);

  return (
    <div className="min-w-0">
      {articleUrl ? (
        <a
          href={articleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block min-h-11 py-1.5 text-sm leading-5 text-slate-700 hover:text-teal-700 hover:underline lg:line-clamp-2 lg:min-h-0 lg:py-0"
        >
          {row.latest_title}
        </a>
      ) : (
        <p className="text-sm leading-5 text-slate-700 lg:line-clamp-2">{row.latest_title}</p>
      )}
      {publishedAt && (
        <time dateTime={row.latest_published_at ?? undefined} className="mt-1 block break-words text-xs text-slate-400">
          {publishedAt}
        </time>
      )}
    </div>
  );
}

function RemoveButton({
  entity,
  disabled,
  removing,
  onRemove,
}: {
  entity: WatchlistEntity;
  disabled: boolean;
  removing: boolean;
  onRemove: (entity: WatchlistEntity) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onRemove(entity)}
      disabled={disabled}
      aria-label={`Remove ${entity.entity_name} from watchlist`}
      title="Remove from watchlist"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-50"
    >
      {removing ? (
        <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2Icon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

export default function WatchlistOverviewTable({
  followed,
  rows,
  windowHours,
  loading,
  actionsDisabled,
  removingId,
  onRemove,
}: Props) {
  const metricsById = new Map(rows.map((row) => [row.entity_id, row]));

  return (
    <>
      {/* Phones: one card per entity. Tablets: two cards per row. */}
      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden" aria-label="Watchlist overview">
        {followed.map((item) => {
          const row = metricsById.get(item.entity_id);
          const type = item.entity_type?.replace(/_/g, " ") || "Entity";

          return (
            <article
              key={item.entity_id}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4"
            >
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <Link
                    to={dashboardUrl(item, windowHours)}
                    className="block break-words text-base font-semibold leading-snug text-slate-900 hover:text-teal-700 [overflow-wrap:anywhere]"
                  >
                    {item.entity_name}
                  </Link>
                  <p className="mt-1 text-xs capitalize text-slate-500">{type}</p>
                </div>
                <RemoveButton
                  entity={item}
                  disabled={actionsDisabled}
                  removing={removingId === item.entity_id}
                  onRemove={onRemove}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2.5 max-[359px]:grid-cols-1">
                <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="mb-2 text-xs font-medium text-slate-600">
                    <MetricInfo metric="articles" label="Articles" />
                  </div>
                  <Coverage row={row} loading={loading} />
                </div>
                <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5">
                  <div className="mb-2 text-xs font-medium text-slate-600">
                    <MetricInfo metric="sentiment" label="Sentiment" />
                  </div>
                  <Sentiment row={row} loading={loading} />
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="mb-2 text-xs font-medium text-slate-600">
                  <MetricInfo metric="distribution" label="Sentiment distribution" />
                </div>
                <Distribution row={row} loading={loading} />
              </div>

              <div className="mt-3 border-t border-slate-100 pt-3">
                <div className="mb-1 text-xs font-medium text-slate-600">
                  <MetricInfo metric="latest" label="Latest article" />
                </div>
                <LatestArticle row={row} loading={loading} />
              </div>
            </article>
          );
        })}
      </div>

      {/* Large screens: retain the compact table layout. */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
        <table className="w-full table-fixed text-left text-sm">
          <caption className="sr-only">Coverage and sentiment for your followed entities</caption>
          <colgroup>
            <col style={{ width: "19%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "5%" }} />
          </colgroup>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-medium">Entity</th>
              <th scope="col" className="px-3 py-3 font-medium">
                <MetricInfo metric="articles" label="Articles" />
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                <MetricInfo metric="sentiment" label="Avg. sentiment" />
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                <MetricInfo metric="distribution" label="Distribution" />
              </th>
              <th scope="col" className="px-3 py-3 font-medium">
                <MetricInfo metric="latest" label="Latest article" />
              </th>
              <th scope="col" className="px-2 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {followed.map((item) => {
              const row = metricsById.get(item.entity_id);
              const type = item.entity_type?.replace(/_/g, " ") || "Entity";

              return (
                <tr key={item.entity_id} className="align-top transition-colors hover:bg-slate-50/70">
                  <td className="min-w-0 px-5 py-4">
                    <Link
                      to={dashboardUrl(item, windowHours)}
                      className="block truncate font-semibold text-slate-900 hover:text-teal-700"
                      title={item.entity_name}
                    >
                      {item.entity_name}
                    </Link>
                    <span className="mt-1 block text-xs capitalize text-slate-500">{type}</span>
                  </td>
                  <td className="px-3 py-4"><Coverage row={row} loading={loading} /></td>
                  <td className="px-3 py-4"><Sentiment row={row} loading={loading} /></td>
                  <td className="px-3 py-4"><Distribution row={row} loading={loading} /></td>
                  <td className="min-w-0 px-3 py-4"><LatestArticle row={row} loading={loading} /></td>
                  <td className="px-1 py-2">
                    <RemoveButton
                      entity={item}
                      disabled={actionsDisabled}
                      removing={removingId === item.entity_id}
                      onRemove={onRemove}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
