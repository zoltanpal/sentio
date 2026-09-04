type ValidationRow = {
  status: string;
  check_name: string;
  issue_count: number;
};

type QueueValue = string | number | boolean | null;

type IngestionActivity = {
  articles_fetched_1h: number;
  articles_fetched_24h: number;
  active_sources: number;
  recently_successful_sources: number;
};

type RetentionArticle = {
  article_id: number;
  title: string;
  published_at: string | null;
  fetched_at: string;
  age: number;
};

type SourceStatusMetadata = {
  source_id: number;
  name: string;
  poll_interval_minutes: number;
  last_fetched_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
};

export type GlobalStatsData = {
  overview: {
    current_pipeline_queue: Record<string, QueueValue>[];
    ingestion_activity: IngestionActivity[];
  };
  validation: {
    system: ValidationRow[];
    ingestion_cleanup: ValidationRow[];
  };
  issues: {
    articles_past_retention_grace: RetentionArticle[];
  };
  source_metadata: {
    sources_without_success_metadata: SourceStatusMetadata[];
  };
};

type GlobalStatsComponentProps = {
  data: GlobalStatsData | null;
};

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: QueueValue): string | number {
  if (value === null) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatAge(value: number) {
  const totalSeconds = Number(value);

  if (!Number.isFinite(totalSeconds)) {
    return "—";
  }

  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor(
    (totalSeconds % 86_400) / 3_600,
  );
  const minutes = Math.floor(
    (totalSeconds % 3_600) / 60,
  );

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "ok":
    case "pass":
    case "healthy":
    case "passed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "fail":
    case "error":
    case "critical":
    case "failed":
      return "bg-red-100 text-red-700 ring-red-600/20";

    default:
      return "bg-slate-50 text-slate-700 ring-slate-600/20";
  }
}

export default function GlobalStatsComponent({
  data,
}: GlobalStatsComponentProps) {
  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6">
        <EmptyState message="Loading system health statistics..." />
      </div>
    );
  }

  const pipelineQueue =
    data.overview?.current_pipeline_queue?.[0] ?? null;

  const ingestionActivity =
    data.overview?.ingestion_activity?.[0] ?? null;

  const systemValidation =
    data.validation?.system ?? [];

  const ingestionCleanupValidation =
    data.validation?.ingestion_cleanup ?? [];

  const retentionArticles =
    data.issues?.articles_past_retention_grace ?? [];

  const sourceMetadata =
    data.source_metadata
      ?.sources_without_success_metadata ?? [];

  const pipelineQueueEntries = pipelineQueue
    ? Object.entries(pipelineQueue)
    : [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-5 sm:px-6">
      <section>
        <SectionHeader
          title="Current pipeline queue"
          description="Articles currently waiting at each processing stage."
        />

        {pipelineQueueEntries.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {pipelineQueueEntries.map(([name, value]) => {
              const hasQueue =
                typeof value === "number" && value > 0;

              return (
                <StatCard
                  key={name}
                  label={formatLabel(name)}
                  value={formatValue(value)}
                  warning={hasQueue}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState message="No pipeline queue data available." />
        )}
      </section>

      <section>
        <SectionHeader
          title="Ingestion activity"
          description="Article ingestion volume and current source count."
        />

        {ingestionActivity ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard
              label="Articles fetched — 1h"
              value={ingestionActivity.articles_fetched_1h}
            />

            <StatCard
              label="Articles fetched — 24h"
              value={ingestionActivity.articles_fetched_24h}
            />

            <StatCard
              label="Active sources"
              value={ingestionActivity.active_sources}
            />
          </div>
        ) : (
          <EmptyState message="No ingestion activity data available." />
        )}
      </section>

      <section>
        <SectionHeader
          title="System health validation"
          description="Current validation status of the processing pipeline."
        />

        <ValidationTable
          checks={systemValidation}
          emptyMessage="No system health validation data available."
        />
      </section>

      <section>
        <SectionHeader
          title="Ingestion and cleanup validation"
          description="Data consistency, retention, source, and ingestion checks."
        />

        <ValidationTable
          checks={ingestionCleanupValidation}
          emptyMessage="No ingestion and cleanup validation data available."
          metadataDependentChecks={[
            "stale_active_sources",
          ]}
        />

        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span className="font-medium">
            Metadata limitation:
          </span>{" "}
          the stale-source check uses source success columns that
          the ingestion job does not currently update. It does not
          necessarily mean those sources are unhealthy.
        </div>
      </section>

      <section>
        <SectionHeader
          title="Articles past retention grace"
          description="Articles that should already have been removed by the cleanup process."
        />

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Article ID
                  </th>

                  <th className="min-w-80 px-4 py-3 font-medium text-slate-600">
                    Title
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Published at
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Fetched at
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-600">
                    Age
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-red-100">
                {retentionArticles.map((article) => (
                  <tr
                    key={article.article_id}
                    className="bg-red-50 transition-colors hover:bg-red-100"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                      {article.article_id}
                    </td>

                    <td className="max-w-xl px-4 py-3 font-medium text-slate-800">
                      {article.title}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(article.published_at)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(article.fetched_at)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-red-700">
                      {formatAge(article.age)}
                    </td>
                  </tr>
                ))}

                {retentionArticles.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No articles are past the retention grace period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Source status metadata"
          description="Sources without recently recorded success metadata."
        />

        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This is informational data, not a confirmed list of
          unhealthy sources. The ingestion job currently does not
          update the success-related columns used by this query.
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Source ID
                  </th>

                  <th className="min-w-48 px-4 py-3 font-medium text-slate-600">
                    Source
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-600">
                    Poll interval
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Last fetched
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Last success
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Last error
                  </th>

                  <th className="min-w-64 px-4 py-3 font-medium text-slate-600">
                    Error message
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sourceMetadata.map((source) => (
                  <tr
                    key={source.source_id}
                    className="bg-amber-50/40 transition-colors hover:bg-amber-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                      {source.source_id}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800">
                      {source.name}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                      {source.poll_interval_minutes} min
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(source.last_fetched_at)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {source.last_success_at
                        ? formatDate(source.last_success_at)
                        : "Not recorded"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(source.last_error_at)}
                    </td>

                    <td className="max-w-md px-4 py-3 text-slate-700">
                      {source.last_error_message || "—"}
                    </td>
                  </tr>
                ))}

                {sourceMetadata.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No source status metadata found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

type ValidationTableProps = {
  checks: ValidationRow[];
  emptyMessage: string;
  metadataDependentChecks?: string[];
};

function ValidationTable({
  checks,
  emptyMessage,
  metadataDependentChecks = [],
}: ValidationTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-600">
                Status
              </th>

              <th className="px-4 py-3 font-medium text-slate-600">
                Check name
              </th>

              <th className="px-4 py-3 text-right font-medium text-slate-600">
                Issue count
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {checks.map((check) => {
              const hasIssue =
                check.status.toLowerCase() === "fail" ||
                check.issue_count > 0;

              const isMetadataDependent =
                metadataDependentChecks.includes(
                  check.check_name,
                );

              const rowClass = hasIssue
                ? isMetadataDependent
                  ? "bg-amber-50 hover:bg-amber-100"
                  : "bg-red-50 hover:bg-red-100"
                : "hover:bg-slate-50";

              const issueCountClass = hasIssue
                ? isMetadataDependent
                  ? "text-amber-700"
                  : "text-red-700"
                : "text-slate-600";

              return (
                <tr
                  key={check.check_name}
                  className={`transition-colors ${rowClass}`}
                >
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(
                        check.status,
                      )}`}
                    >
                      {check.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatLabel(check.check_name)}

                    {isMetadataDependent && (
                      <span className="ml-2 text-xs font-normal text-amber-700">
                        Metadata-dependent
                      </span>
                    )}
                  </td>

                  <td
                    className={`px-4 py-3 text-right font-semibold ${issueCountClass}`}
                  >
                    {check.issue_count.toLocaleString()}
                  </td>
                </tr>
              );
            })}

            {checks.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  warning?: boolean;
};

function StatCard({
  label,
  value,
  warning = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        warning
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          warning ? "text-red-600" : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold tracking-tight ${
          warning ? "text-red-700" : "text-slate-900"
        }`}
      >
        {typeof value === "number"
          ? value.toLocaleString()
          : value}
      </p>
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  description: string;
};

function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div className="mb-3">
      <h2 className="text-lg font-semibold text-slate-900">
        {title}
      </h2>

      <p className="text-sm text-slate-500">
        {description}
      </p>
    </div>
  );
}

type EmptyStateProps = {
  message: string;
};

function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
