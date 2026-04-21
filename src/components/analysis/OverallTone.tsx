import { GlobeIcon, NewspaperIcon, ClockIcon } from "lucide-react";
import { Badge } from "@/components/shared/ui/badge";
import SentimentDoughnut from "@/components/analysis/SentimentDoughnut";
import { formatTimeAgo } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";

const sentimentLabelMap: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mostly_positive: "Mostly Positive",
  mostly_negative: "Mostly Negative",
  mixed: "Mixed",
};

type OverallToneProps = {
  data: any;
  countSources: number;
  lastUpdated: number;
};

export default function OverallTone({
  data,
  countSources,
  lastUpdated,
}: OverallToneProps) {
  return (
    <Card className="flex h-auto min-h-[300px] flex-col gap-0 bg-gradient-to-r from-pink-50 to-pink-100 py-2 sm:min-h-[320px]">
      <CardHeader className="px-4 py-2 sm:px-5">
        <CardTitle className="text-base sm:text-lg">Overall Tone</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 items-center px-2 pb-0 sm:px-3">
        <div className="relative h-[145px] w-full sm:h-[170px] md:h-[185px]">
          <SentimentDoughnut
            distribution={data.aggregated.distribution}
            summaryLabel={
              sentimentLabelMap[data.aggregated.summary.label] ??
              data.aggregated.summary.label
            }
          />
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap items-stretch gap-1 px-3 py-2">
        <Badge
          variant="secondary"
          className="min-w-0 flex-1 justify-center gap-1 border-green-200 bg-emerald-100 px-1.5 py-1 text-[11px] sm:flex-none sm:text-xs"
        >
          <NewspaperIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{data.aggregated.article_count} articles</span>
        </Badge>

        <Badge
          variant="secondary"
          className="min-w-0 flex-1 justify-center gap-1 border-teal-200 bg-cyan-100 px-1.5 py-1 text-[11px] sm:flex-none sm:text-xs"
        >
          <GlobeIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{countSources} sources</span>
        </Badge>

        <Badge
          variant="secondary"
          className="min-w-0 w-full justify-center gap-1 border-yellow-200 bg-amber-100 px-1.5 py-1 text-[11px] xs:w-auto xs:flex-1 sm:w-auto sm:flex-none sm:text-xs"
        >
          <ClockIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{formatTimeAgo(lastUpdated)}</span>
        </Badge>
      </CardFooter>
    </Card>
  );
}
