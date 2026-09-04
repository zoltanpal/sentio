type SentimentValidation = {
  status: string;
  check_name: string;
  issue_count: number;
};

type SentimentStatistics = {
  articles_fetched: number;
  analyzed: number;
  analyzed_pct: number;
  pending: number;
};

type IncompleteSentimentArticle = {
  article_id: number;
  title: string;
  fetched_at: string;
  sentiment_analyzed_at: string | null;
  sentiment_row_count: number;
};

export type SentimentStatsData = {
  overview: {
    last_24_hours: SentimentStatistics[];
  };
  validation: SentimentValidation[];
  issues: {
    incomplete_articles: IncompleteSentimentArticle[];
  };
};

type SentimentStatsComponentProps = {
  data: SentimentStatsData | null;
};

function formatCheckName(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "pass":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "warning":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "fail":
      return "bg-red-100 text-red-700 ring-red-600/20";

    default:
      return "bg-slate-50 text-slate-700 ring-slate-600/20";
  }
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

function getIncompleteReason(
  article: IncompleteSentimentArticle,
) {
  const sentimentCount = Number(
    article.sentiment_row_count,
  );

  if (
    article.sentiment_analyzed_at &&
    sentimentCount === 0
  ) {
    return "Sentiment row missing";
  }

  if (
    !article.sentiment_analyzed_at &&
    sentimentCount > 0
  ) {
    return "Analyzed timestamp missing";
  }

  return "Pending over 30 minutes";
}

export default function SentimentStatsComponent({
  data,
}: SentimentStatsComponentProps) {
  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          Loading sentiment statistics...
        </div>
      </div>
    );
  }

  const statistics =
    data.overview?.last_24_hours?.[0] ?? null;

  const validationChecks =
    data.validation ?? [];

  const incompleteArticles =
    data.issues?.incomplete_articles ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-5 sm:px-6">
      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Sentiment processing
          </h2>

          <p className="text-sm text-slate-500">
            Sentiment worker activity during the last 24 hours.
          </p>
        </div>

        {statistics ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Articles fetched"
              value={statistics.articles_fetched}
            />

            <StatCard
              label="Analyzed"
              value={statistics.analyzed}
            />

            <StatCard
              label="Pending"
              value={statistics.pending}
              warning={statistics.pending > 0}
            />

            <StatCard
              label="Coverage"
              value={`${statistics.analyzed_pct.toFixed(1)}%`}
              warning={statistics.analyzed_pct < 100}
            />
          </div>
        ) : (
          <EmptyState message="No sentiment statistics available." />
        )}
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Sentiment validation
          </h2>

          <p className="text-sm text-slate-500">
            Data consistency checks for sentiment processing.
          </p>
        </div>

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
                        {formatCheckName(check.check_name)}
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
                      No sentiment validation data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Incomplete sentiment articles
          </h2>

          <p className="text-sm text-slate-500">
            Articles with missing, inconsistent, or delayed
            sentiment processing. Showing up to 50 articles.
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Problem
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Article ID
                  </th>

                  <th className="min-w-72 px-4 py-3 font-medium text-slate-600">
                    Title
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Fetched at
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                    Analyzed at
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-600">
                    Sentiment rows
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-red-100">
                {incompleteArticles.map((article) => (
                  <tr
                    key={article.article_id}
                    className="bg-red-50 transition-colors hover:bg-red-100"
                  >
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        {getIncompleteReason(article)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                      {article.article_id}
                    </td>

                    <td className="max-w-xl px-4 py-3 font-medium text-slate-800">
                      {article.title}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(article.fetched_at)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDate(
                        article.sentiment_analyzed_at,
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-red-700">
                      {Number(
                        article.sentiment_row_count,
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}

                {incompleteArticles.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No incomplete sentiment articles found.
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
  value: number | string;
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
