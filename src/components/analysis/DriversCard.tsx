import { ChevronRightIcon, LightbulbIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";

type DriversCardProps = {
  drivers: any;
};

export default function DriversCard({ drivers }: DriversCardProps) {
  // console.log("drivers:", drivers);


  return (
    <Card className="flex flex-col gap-0">
      <CardHeader className="px-3 py-1 sm:py-1 sm:px-4">
        <CardTitle>
          <div className="flex items-center gap-2">
            <LightbulbIcon className="h-5 w-5 text-blue-500" />
            <h2 className="font-bold text-slate-900">What&apos;s driving this?</h2>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-3 px-2">
        {drivers.length ? drivers.map((item, index) => (
          <article key={`${item}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 hover:bg-slate-50 transition">
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
