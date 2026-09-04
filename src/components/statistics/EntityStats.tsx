type EntityValidation = {
  status: string;
  check_name: string;
  issue_count: number;
};

type EntityQueueAndCoverage = {
  ready_for_entities: number;
  analyzed: number;
  pending: number;
  analyzed_with_entities: number;
  analyzed_without_entities: number;
};

type EntityTableValue = string | number | boolean | null;

type IncompleteEntityArticle = Record<
  string,
  EntityTableValue
>;

export type EntityStatsData = {
  overview: {
    queue_and_coverage: EntityQueueAndCoverage[];
  };
  validation: EntityValidation[];
  issues: {
    incomplete_articles: IncompleteEntityArticle[];
  };
};

type EntityStatsComponentProps = {
  data: EntityStatsData | null;
};

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function formatTableValue(
  column: string,
  value: EntityTableValue,
) {
  if (value === null) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (column.endsWith("_at")) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
    }
  }

  return value;
}

export default function EntityStatsComponent({
  data,
}: EntityStatsComponentProps) {
  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6">
        <EmptyState message="Loading entity statistics..." />
      </div>
    );
  }

  const queueAndCoverage =
    data.overview?.queue_and_coverage?.[0] ?? null;

  const validationChecks = data.validation ?? [];

  const incompleteArticles =
    data.issues?.incomplete_articles ?? [];

  const incompleteColumns =
    incompleteArticles.length > 0
      ? Object.keys(incompleteArticles[0])
      : [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-5 sm:px-6">
      <section>
        <SectionHeader
          title="Entity processing"
          description="Current entity worker queue and processing coverage."
        />

        {queueAndCoverage ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard
              label="Ready for entities"
              value={queueAndCoverage.ready_for_entities}
            />

            <StatCard
              label="Analyzed"
              value={queueAndCoverage.analyzed}
            />

            <StatCard
              label="Pending"
              value={queueAndCoverage.pending}
              warning={queueAndCoverage.pending > 0}
            />

            <StatCard
              label="With entities"
              value={queueAndCoverage.analyzed_with_entities}
            />

            <StatCard
              label="Without entities"
              value={queueAndCoverage.analyzed_without_entities}
            />
          </div>
        ) : (
          <EmptyState message="No entity queue data available." />
        )}
      </section>

      <section>
        <SectionHeader
          title="Entity validation"
          description="Data consistency checks for entity processing."
        />

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
                {validationChecks.map((check) => {
                  const hasIssue =
                    check.status.toLowerCase() === "fail" ||
                    check.issue_count > 0;

                  return (
                    <tr
                      key={check.check_name}
                      className={`transition-colors ${
                        hasIssue
                          ? "bg-red-50 hover:bg-red-100"
                          : "hover:bg-slate-50"
                      }`}
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
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          hasIssue
                            ? "text-red-700"
                            : "text-slate-600"
                        }`}
                      >
                        {check.issue_count.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}

                {validationChecks.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No entity validation data available.
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
          title="Incomplete entity articles"
          description="Articles with missing, inconsistent, or delayed entity processing."
        />

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              {incompleteColumns.length > 0 && (
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {incompleteColumns.map((column) => (
                      <th
                        key={column}
                        className={`whitespace-nowrap px-4 py-3 font-medium text-slate-600 ${
                          column === "title"
                            ? "min-w-72"
                            : ""
                        }`}
                      >
                        {formatLabel(column)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}

              <tbody className="divide-y divide-red-100">
                {incompleteArticles.map(
                  (article, index) => {
                    const rowKey =
                      article.article_id?.toString() ??
                      index;

                    return (
                      <tr
                        key={rowKey}
                        className="bg-red-50 transition-colors hover:bg-red-100"
                      >
                        {incompleteColumns.map(
                          (column) => (
                            <td
                              key={column}
                              className={`px-4 py-3 text-slate-700 ${
                                column === "title"
                                  ? "max-w-xl font-medium text-slate-800"
                                  : "whitespace-nowrap"
                              }`}
                            >
                              {formatTableValue(
                                column,
                                article[column],
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    );
                  },
                )}

                {incompleteArticles.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500">
                      No incomplete entity articles found.
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
          warning
            ? "text-red-600"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold tracking-tight ${
          warning
            ? "text-red-700"
            : "text-slate-900"
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

function EmptyState({
  message,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
