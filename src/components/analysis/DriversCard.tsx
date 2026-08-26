import { LightbulbIcon } from "lucide-react";
import type { CoverageDriver } from "@/hooks/useDashboardData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";

type DriversCardProps = {
  drivers?: CoverageDriver[];
};

export default function DriversCard({ drivers }: DriversCardProps) {
  // console.log("drivers:", drivers);


  return (
    <Card className="flex flex-col gap-0 border-slate-200 py-0 shadow-sm">
      <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <CardTitle>
          <div className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-blue-500" />
            <h2 className="font-bold text-slate-900">What&apos;s driving this?</h2>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-3 sm:p-4">
        {drivers?.length ? drivers.map((item, index) => (
          <article key={`${item.representative_title}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-100 hover:bg-blue-50/40">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{index + 1}</span>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800" title={item.representative_title}>
              {item.representative_title}
            </p>
            <span className="text-xs text-slate-500">{item.article_count} articles</span>
            {/* <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400" /> */}
          </article>
        )) : (
          <p className="rounded-xl bg-slate-50 px-2 py-8 text-center text-sm text-slate-500">No distinct drivers were identified for this period.</p>
        )}
      </CardContent>

    </Card>
  );
}
