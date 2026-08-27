import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";

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
  delta: number;
  direction: ChangeDirection;
};

type DriverHeadline = {
  title: string;
};

type DriversData = {
  is_meaningful: boolean;
  headlines: DriverHeadline[];
} | null;

type Props = {
  data: SentimentChangeData;
  drivers?: DriversData;
  windowHours: number;
  title?: string;
};

function getIntensityLabel(delta: number, direction: ChangeDirection): string {
  const abs = Math.abs(delta);

  if (direction === "stable" || abs < 0.04) return "Stable";
  if (abs >= 0.20) {
    return direction === "improving" ? "Sharply improving" : "Sharply worsening";
  }
  if (abs >= 0.10) {
    return direction === "improving" ? "Improving" : "Worsening";
  }
  return direction === "improving" ? "Slightly improving" : "Slightly worsening";
}

function getDirectionMeta(direction: ChangeDirection, delta: number) {
  const label = getIntensityLabel(delta, direction);

  switch (direction) {
    case "improving":
      return {
        label,
        Icon: ArrowUpIcon,
        iconWrapClass:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        deltaClass: "text-emerald-700 dark:text-emerald-300",
      };

    case "worsening":
      return {
        label,
        Icon: ArrowDownIcon,
        iconWrapClass:
          "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        deltaClass: "text-red-700 dark:text-red-300",
      };

    default:
      return {
        label,
        Icon: ArrowRightIcon,
        iconWrapClass:
          "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        deltaClass: "text-amber-700 dark:text-amber-300",
      };
  }
}

export default function SentimentChangeCard({
  data,
  drivers = null,
  windowHours,
}: Props) {
  const { direction, delta } = data;
  const meta = getDirectionMeta(direction, delta);

  const showDrivers =
    Boolean(drivers?.is_meaningful) && (drivers?.headlines?.length ?? 0) > 0;

  return (
    <Card className="gap-4 border-amber-100 bg-gradient-to-br from-amber-50 to-white py-0 shadow-sm">
      <CardHeader className="px-5 pt-5 pb-0">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">Recent Change</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-5 pb-5">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-14 w-10 shrink-0 items-center justify-center rounded-2xl ${meta.iconWrapClass}`}
          >
            <meta.Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <span className={`text-2xl font-semibold ${meta.deltaClass}`}>
                {meta.label}
              </span>
            </div>
            <p className={`text-sm font-bold ${meta.deltaClass}`}>
              {data.previous.avg_sentiment_score.toFixed(2)}
              &nbsp;→&nbsp;
              {data.current.avg_sentiment_score.toFixed(2)}
              {/* {formatDelta(delta)} in last {windowHours} hours */}
            </p>
            <small>Δ&nbsp;{delta.toFixed(2)}&nbsp;vs previous {windowHours} hours</small>
          </div>
        </div>

        {showDrivers && (
          <div className="rounded-xl border bg-background/70 p-3">
            <p className="mb-2 text-sm font-medium">Driven by</p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              {drivers!.headlines.slice(0, 3).map((headline, index) => (
                <li key={`${headline.title}-${index}`} className="flex gap-2">
                  <span className="mt-1 text-foreground">•</span>
                  <span className="line-clamp-2">{headline.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
