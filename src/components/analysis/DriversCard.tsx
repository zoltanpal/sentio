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

function formatArticleCount(count: number) {
  return `${count} ${count === 1 ? "article" : "articles"}`;
}

export default function DriversCard({ drivers }: DriversCardProps) {
  return (
    <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-[1.25rem] border-slate-200/90 bg-white py-0 shadow-none">
      <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
        <CardTitle className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <LightbulbIcon className="h-[1.125rem] w-[1.125rem]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-950">
              What&apos;s driving this?
            </h2>
            <p className="mt-0.5 text-xs font-normal text-slate-500">
              Stories shaping the current movement
            </p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        {drivers?.length ? (
          <div className="divide-y divide-slate-100">
            {drivers.map((item, index) => (
              <article
                key={`${item.representative_title}-${index}`}
                className="group flex min-w-0 items-start gap-3 px-4 py-4 transition-colors hover:bg-blue-50/45 sm:px-6"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100 transition-colors group-hover:bg-blue-100">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800"
                    title={item.representative_title}
                  >
                    {item.representative_title}
                  </p>
                  <span className="mt-1.5 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[0.7rem] font-medium text-slate-500">
                    {formatArticleCount(item.article_count)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="max-w-xs text-center text-sm leading-6 text-slate-500">
              No distinct drivers were identified for this period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
