type ClusteringQueueAndCoverage = {
  ready_for_clustering: number;
  clustered: number;
  pending: number;
  inconsistent: number;
  with_embedding: number;
  clustered_pct: number;
};

type ClusterActivity = {
  clusters_created: number;
  memberships_added: number;
  clusters_touched: number;
  current_single_article_clusters: number;
  current_multi_article_clusters: number;
  avg_current_cluster_size: number;
  largest_current_cluster_size: number;
};

type ClusteringIntegrityCheck = {
  status: string;
  check_name: string;
  issue_count: number;
};

type RecentMultiArticleCluster = {
  cluster_id: number;
  stored_article_count: number;
  actual_article_count: number;
  short_label: string | null;
  label_updated_at: string | null;
  first_seen_at: string;
  last_seen_at: string;
  titles: string[];
};

type TableValue =
  | string
  | number
  | boolean
  | null
  | string[];

type IssueRow = Record<string, TableValue>;

export type ClusteringStatsData = {
  overview: {
    queue_and_coverage: ClusteringQueueAndCoverage[];
    activity: ClusterActivity[];
  };
  validation: ClusteringIntegrityCheck[];
  issues: {
    unmarked_articles: IssueRow[];
    unlabeled_multi_article_clusters: IssueRow[];
    article_count_mismatches: IssueRow[];
  };
  inspection: {
    recent_multi_article_clusters: RecentMultiArticleCluster[];
  };
};

type ClusteringStatsComponentProps = {
  data: ClusteringStatsData | null;
};

function formatLabel(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function formatTableValue(
  column: string,
  value: TableValue,
) {
  if (value === null) {
    return "—";
  }

  if (Array.isArray(value)) {
    return value.join("; ");
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (column.endsWith("_at")) {
    return formatDate(value);
  }

  return value;
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

export default function ClusteringStatsComponent({
  data,
}: ClusteringStatsComponentProps) {
  if (!data) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6">
        <EmptyState message="Loading clustering statistics..." />
      </div>
    );
  }

  const queue =
    data.overview?.queue_and_coverage?.[0] ?? null;

  const activity =
    data.overview?.activity?.[0] ?? null;

  const integrityChecks =
    data.validation ?? [];

  const unmarkedArticles =
    data.issues?.unmarked_articles ?? [];

  const unlabeledClusters =
    data.issues?.unlabeled_multi_article_clusters ?? [];

  const articleCountMismatches =
    data.issues?.article_count_mismatches ?? [];

  const recentClusters =
    data.inspection?.recent_multi_article_clusters ?? [];

  return (
    <div>
      {/* <div>
        cluster processing | cluster activity | clustering integrity | issues | recent clusters
      </div> */}

      <div className="mx-auto w-full max-w-7xl space-y-6 px-3 py-5 sm:px-6">
        <section>
          <SectionHeader
            title="Clustering processing"
            description="Current clustering queue and processing coverage."
          />

          {queue ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard
                label="Ready for clustering"
                value={queue.ready_for_clustering}
              />

              <StatCard
                label="Clustered"
                value={queue.clustered}
              />

              <StatCard
                label="Pending"
                value={queue.pending}
                            warning={queue.pending > 0}
              />

              <StatCard
                label="Inconsistent"
                value={queue.inconsistent}
                warning={queue.inconsistent > 0}
              />

              <StatCard
                label="With embedding"
                value={queue.with_embedding}
              />

              <StatCard
                label="Coverage"
                value={`${queue.clustered_pct.toFixed(1)}%`}
                warning={queue.clustered_pct < 100}
              />
            </div>
          ) : (
            <EmptyState message="No clustering queue data available." />
          )}
        </section>

        <section>
          <SectionHeader
            title="Cluster activity"
            description="Current cluster creation, membership, and size statistics."
          />

          {activity ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard
                label="Clusters created"
                value={activity.clusters_created}
              />

              <StatCard
                label="Memberships added"
                value={activity.memberships_added}
              />

              <StatCard
                label="Clusters touched"
                value={activity.clusters_touched}
              />

              <StatCard
                label="Single-article clusters"
                value={activity.current_single_article_clusters}
              />

              <StatCard
                label="Multi-article clusters"
                value={activity.current_multi_article_clusters}
              />

              <StatCard
                label="Average cluster size"
                value={activity.avg_current_cluster_size}
              />

              <StatCard
                label="Largest cluster size"
                value={activity.largest_current_cluster_size}
              />
            </div>
          ) : (
            <EmptyState message="No cluster activity data available." />
          )}
        </section>

        <section>
          <SectionHeader
            title="Clustering integrity"
            description="Data consistency checks for clusters and memberships."
          />

          <ValidationTable checks={integrityChecks} />
        </section>

        <IssueTable
          title="Unmarked clustered articles"
          description="Articles with cluster memberships but without a clustered timestamp."
          rows={unmarkedArticles}
          emptyMessage="No unmarked clustered articles found."
        />

        <IssueTable
          title="Unlabeled multi-article clusters"
          description="Multi-article clusters that do not have a generated label."
          rows={unlabeledClusters}
          emptyMessage="No unlabeled multi-article clusters found."
        />

        <IssueTable
          title="Cluster article count mismatches"
          description="Clusters where the stored and actual membership counts differ."
          rows={articleCountMismatches}
          emptyMessage="No cluster article-count mismatches found."
        />

        <section>
          <SectionHeader
            title="Recent multi-article clusters"
            description="Recently active clusters containing multiple related articles."
          />

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                      Cluster ID
                    </th>

                    <th className="min-w-64 px-4 py-3 font-medium text-slate-600">
                      Label
                    </th>

                    <th className="whitespace-nowrap px-4 py py-3 text-right font-medium text-slate-600">
                      Stored
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-600">
                      Actual
                    </th>

                    <th className="min-w-48 px-4 py-3 font-medium text-slate-600">
                      Articles
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                      First seen
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                      Last seen
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                      Label updated
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentClusters.map((cluster) => {
                    const storedArticleCount = Number(
                      cluster.stored_article_count,
                    );

                    const actualArticleCount = Number(
                      cluster.actual_article_count,
                    );

                    const hasMismatch =
                      storedArticleCount !== actualArticleCount;

                    const titles = cluster.titles ?? [];

                    return (
                      <tr
                        key={cluster.cluster_id}
                        className={`align-top transition-colors ${
                          hasMismatch
                            ? "bg-red-50 hover:bg-red-100"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-700">
                          {cluster.cluster_id}
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-800">
                          {cluster.short_label || (
                            <span className="text-red-700">
                              Missing label
                            </span>
                          )}
                        </td>

                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                            hasMismatch
                              ? "text-red-700"
                              : "text-slate-700"
                          }`}
                        >
                          {storedArticleCount.toLocaleString()}
                        </td>

                        <td
                          className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${
                            hasMismatch
                              ? "text-red-700"
                              : "text-slate-700"
                          }`}
                        >
                          {actualArticleCount.toLocaleString()}
                        </td>

                        <td className="px-4 py-3">
                          <details>
                            <summary className="cursor-pointer whitespace-nowrap font-medium text-blue-600 hover:text-blue-700">
                              Show {titles.length} titles
                            </summary>

                            <ul className="mt-3 min-w-80 space-y-2 text-slate-700">
                              {titles.map((title, index) => (
                                <li
                                  key={`${cluster.cluster_id}-${index}`}
                                  className="border-l-2 border-slate-200 pl-3"
                                >
                                  {title}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatDate(cluster.first_seen_at)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatDate(cluster.last_seen_at)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatDate(cluster.label_updated_at)}
                        </td>
                      </tr>
                    );
                  })}

                  {recentClusters.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No recent multi-article clusters found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type ValidationTableProps = {
  checks: ClusteringIntegrityCheck[];
};

function ValidationTable({
  checks,
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

            {checks.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No clustering integrity data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type IssueTableProps = {
  title: string;
  description: string;
  rows: IssueRow[];
  emptyMessage: string;
};

function IssueTable({
  title,
  description,
  rows,
  emptyMessage,
}: IssueTableProps) {
  const columns =
    rows.length > 0
      ? Object.keys(rows[0])
      : [];

  return (
    <section>
      <SectionHeader
        title={title}
        description={description}
      />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            {columns.length > 0 && (
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className={`whitespace-nowrap px-4 py-3 font-medium text-slate-600 ${
                        column === "title" ||
                        column === "short_label"
                          ? "min-w-64"
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
              {rows.map((row, index) => {
                const rowKey =
                  row.article_id ??
                  row.cluster_id ??
                  index;

                return (
                  <tr
                    key={String(rowKey)}
                    className="bg-red-50 transition-colors hover:bg-red-100"
                  >
                    {columns.map((column) => (
                      <td
                        key={column}
                        className={`px-4 py-3 text-slate-700 ${
                          column === "title" ||
                          column === "short_label"
                            ? "max-w-xl font-medium text-slate-800"
                            : "whitespace-nowrap"
                        }`}
                      >
                        {formatTableValue(
                          column,
                          row[column],
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-emerald-700">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
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
