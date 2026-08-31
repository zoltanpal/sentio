import { InfoIcon, LightbulbIcon, MoreHorizontalIcon } from "lucide-react";

import type { Drivers } from "@/hooks/useDashboardData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";

type DriversCardProps = {
  drivers?: Drivers[];
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
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-slate-950">
                What&apos;s driving this?
              </h2>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    aria-label="About the drivers card"
                  >
                    <InfoIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={6}
                  className="w-[calc(100vw-2rem)] max-w-xs rounded-xl border-slate-200 p-4 shadow-lg"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    What are drivers?
                  </p>
                  <p className="mt-1.5 text-sm font-normal leading-6 text-slate-600">
                    These are the most prominent groups of related stories in
                    the selected time window. They help explain which news
                    topics are contributing to the current sentiment. The
                    article count shows how much coverage each story received.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            <p className="mt-0.5 text-xs font-normal text-muted-foreground text-slate-500">
              Stories shaping the current movement
            </p>
          </div>
        </CardTitle>
        {/* <CardDescription className="mt-0.5 text-xs sm:text-sm">
            Stories shaping the current movement
        </CardDescription> */}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-0">
        {drivers?.length ? (
          <div className="divide-y divide-slate-100">
            {drivers.map((item, index) => (
              <Popover key={`${item.representative_title}-${index}`}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="group flex w-full min-w-0 cursor-pointer items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-blue-50/45 focus-visible:bg-blue-50/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 data-[state=open]:bg-blue-50/45 sm:px-6"
                    aria-label={`Read the full driver title: ${item.representative_title}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700 ring-1 ring-blue-100 transition-colors group-hover:bg-blue-100">
                      {index + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-semibold leading-5 text-slate-800">
                        {item.representative_title}
                      </span>
                      <span className="mt-1.5 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[0.7rem] font-medium text-slate-500">
                        {formatArticleCount(item.article_count)}
                      </span>
                    </span>

                    <span
                      className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors group-hover:bg-white group-hover:text-blue-600"
                      aria-hidden="true"
                    >
                      <MoreHorizontalIcon className="h-5 w-5" />
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  sideOffset={6}
                  className="w-[calc(100vw-2rem)] max-w-sm rounded-xl border-slate-200 p-4 shadow-lg"
                >
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-blue-600">
                    Driver {index + 1}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">
                    {item.representative_title}
                  </p>
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {formatArticleCount(item.article_count)} in this period
                  </p>
                </PopoverContent>
              </Popover>
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
