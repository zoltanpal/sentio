import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ChangeDirection = "improving" | "worsening" | "stable";

type SentimentChangeData = {
  current: {
    article_count: number;
    avg_sentiment_score: number;
  };
  previous: {
    article_count: number;
    avg_sentiment_score: number;
  };
  change: {
    delta: number;
    direction: ChangeDirection;
  };
  window_hours: number;
};

type Props = {
  data: SentimentChangeData;
  title?: string;
};

function formatScore(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

function getIntensityLabel(delta: number, direction: ChangeDirection): string {
  const abs = Math.abs(delta);

  if (direction === "stable" || abs < 0.05) return "Stable";
  if (abs >= 0.25) return direction === "improving" ? "Sharply improving" : "Sharply worsening";
  if (abs >= 0.12) return direction === "improving" ? "Improving" : "Worsening";
  return direction === "improving" ? "Slightly improving" : "Slightly worsening";
}

function getDirectionMeta(direction: ChangeDirection, delta: number) {
  const label = getIntensityLabel(delta, direction);

  switch (direction) {
    case "improving":
      return {
        label,
        Icon: ArrowUpIcon,
        badgeClass:
          "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",
        iconWrapClass:
          "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        deltaClass: "text-green-700 dark:text-green-300",
      };

    case "worsening":
      return {
        label,
        Icon: ArrowDownIcon,
        badgeClass:
          "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
        iconWrapClass:
          "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        deltaClass: "text-red-700 dark:text-red-300",
      };

    default:
      return {
        label,
        Icon: ArrowRightIcon,
        badgeClass:
          "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        iconWrapClass:
          "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
        deltaClass: "text-slate-700 dark:text-slate-300",
      };
  }
}

export default function SentimentChangeCard({
  data,
  title = "Sentiment change",
}: Props) {
  const { current, previous, change, window_hours } = data;

  const meta = getDirectionMeta(change.direction, change.delta);
  const totalArticles = current.article_count + previous.article_count;
  const lowVolume = totalArticles < 10;

  return (
    <Card className="rounded-xl border bg-gradient-to-r from-yellow-30 to-yellow-50">
      <CardHeader className="py-0 gap-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-base">{title}</CardTitle>
          {/* <Badge variant="outline" className="rounded-full">
            Last {window_hours}h vs previous {window_hours}h
          </Badge> */}
        </div>
      </CardHeader>

      <CardContent className="py-0">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${meta.iconWrapClass}`}
          >
            <meta.Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-3xl font-semibold ${meta.deltaClass}`}>{meta.label}</span>
              {/* <Badge
                variant="outline"
                className={`rounded-full ${meta.badgeClass}`}
              >
                {formatScore(change.delta)}
              </Badge> */}
            </div>

            {/* <p className="text-sm text-muted-foreground">
              From <span className="font-medium text-foreground">{formatScore(previous.avg_sentiment_score)}</span>{" "}
              to <span className="font-medium text-foreground">{formatScore(current.avg_sentiment_score)}</span>
            </p> */}
          </div>
        </div>

        {/* <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Current window</div>
            <div className="mt-1 text-2xl font-semibold">
              {formatScore(current.avg_sentiment_score)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {current.article_count} article{current.article_count === 1 ? "" : "s"}
            </div>
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-xs text-muted-foreground">Previous window</div>
            <div className="mt-1 text-2xl font-semibold">
              {formatScore(previous.avg_sentiment_score)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {previous.article_count} article{previous.article_count === 1 ? "" : "s"}
            </div>
          </div>
        </div> */}

        {/* {lowVolume && (
          <div className="flex mt-4 items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="text-xs leading-5">
              Low article volume. This change is based on only {totalArticles} article
              {totalArticles === 1 ? "" : "s"}, so the signal may be noisy.
            </p>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
}