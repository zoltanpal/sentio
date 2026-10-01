import { useEffect, useState } from "react";

import {
  BotIcon,
  ChartNoAxesCombinedIcon,
  NewspaperIcon,
} from "lucide-react";

import Loading from "@/components/analysis/LoadingState";
import HeadlinesTable from "@/components/analysis/HeadlinesTable";

import ExpandableText from "@/components/analysis/ExpandableText";
import DashboardSummaryCard from "@/components/analysis/DashboardSummaryCard";
import DriversCard from "@/components/analysis/DriversCard";
import TopEntities from "@/components/analysis/TopEntities";
import TopEntitiesSimple from "@/components/analysis/TopEntitiesSimple";
import DashboardHeading from "@/components/analysis/DashboardHeading";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import SentimentTimelineChart from "@/components/analysis/SentimentTimelineChart";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { formatWindow } from "@/features/dashboard/dashboardSearch";
import { useDashboardSearch } from "@/features/dashboard/useDashboardSearch";

import { getFirebaseAuth } from "@/auth/firebase";

const WINDOW_OPTIONS = [6, 12, 24, 48, 72] as const;
type Entity = {
  id: number;
  name: string;
  type: string;
  article_count: number;
};

const auth = getFirebaseAuth();
await auth.authStateReady();

export default function Dashboard() {
  const {
    activeQuery,
    data,
    displayError,
    hasResults,
    isBusy,
    onEntitySelect,
    onLogoClick,
    onPromptInputChange,
    onSearch,
    onWindowTimeChange,
    promptInput,
    resultsTopRef,
    showEmptyState,
    showIdleState,
    windowHours,
  } = useDashboardSearch();
  const countSources = new Set(data?.headlines.map((h) => h.source_name)).size;
  const [entityItems, setEntityItems] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<{
    id: number;
    name: string;
    type: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchTopEntities() {
      try {
        const params = new URLSearchParams({
          time_window: String(windowHours),
        });

        const response = await fetch(
          buildSentioApiUrl(`/top_entities?${params.toString()}`),
          {
            headers: getSentioApiHeaders(),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Fetching top entities failed: ${response.status}`);
        }

        const entities: Entity[] = await response.json();

        if (!controller.signal.aborted) {
          setEntityItems(entities);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Could not load top entities:", error);
        }
      }
    }

    void fetchTopEntities();

    return () => controller.abort();
  }, [windowHours]);


    return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <DashboardHeader
        promptInput={promptInput}
        isBusy={isBusy}
        error={displayError}
        onLogoClick={onLogoClick}
        onPromptInputChange={onPromptInputChange}
        onSearch={() => {
          setSelectedEntity(null);
          void onSearch();
        }}
      />

      <main className="min-w-0 mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div
            ref={resultsTopRef}
            className="mb-5 flex scroll-mt-20 items-start justify-between gap-3 sm:mb-6 sm:items-end sm:gap-4"
          >
            <div className="min-w-0">
              {hasResults && data ? (
                <DashboardHeading
                  query={activeQuery}
                  windowHours={windowHours}
                  watchlist_candidates={data.watchlist_candidates ?? []}
                  selectedEntity={
                    selectedEntity?.name.trim().toLowerCase() ===
                    activeQuery.trim().toLowerCase()
                      ? selectedEntity
                      : null
                  }
                />
              ) : (
                <>
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 sm:text-base">
                    Search a topic to understand the news behind the signal.
                  </p>
                </>
              )}
            </div>
            <div className="shrink-0">
              <div className="sm:hidden">
                <Select
                  value={String(windowHours)}
                  onValueChange={(value) =>
                    onWindowTimeChange(Number(value))
                  }
                  disabled={isBusy}
                >
                  <SelectTrigger
                    className="h-10 w-[5.25rem] rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-none focus:ring-2 focus:ring-blue-100"
                    aria-label="Time window"
                  >
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    align="end"
                    className="min-w-[7rem] rounded-xl border-slate-200 p-1"
                  >
                    {WINDOW_OPTIONS.map((hours) => (
                      <SelectItem
                        key={hours}
                        value={String(hours)}
                        className="h-10 rounded-lg text-sm font-medium"
                      >
                        {formatWindow(hours)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden sm:block">
                <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Time window
                </span>
                <div
                  className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
                  role="group"
                  aria-label="Time window"
                >
                  {WINDOW_OPTIONS.map((hours) => {
                    const isSelected = hours === windowHours;

                    return (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => onWindowTimeChange(hours)}
                        disabled={isBusy}
                        aria-pressed={isSelected}
                        className={`h-8 min-w-11 rounded-sm px-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {formatWindow(hours)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {isBusy ? (
            <Loading text="Analyzing feeds, please wait..." />
          ) : hasResults && data ? (
            <div className="space-y-5 sm:space-y-6">
              <DashboardSummaryCard data={data} sourceCount={countSources} />

              {data.ai_summary ? (
                <Card className="gap-0 overflow-hidden rounded-[1.25rem] border-slate-200/90 bg-white py-0 shadow-none">
                  <CardHeader className="px-4 pt-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <BotIcon className="h-[1.125rem] w-[1.125rem]" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="font-bold items-center text-slate-950 text-base sm:text-lg">
                          AI briefing 
                          <span className="font-normal text-slate-800">
                            &nbsp;&bull;&nbsp;last {formatWindow(windowHours)}
                          </span>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-2 sm:px-6 sm:pb-4">
                  <ExpandableText
                      text={data.ai_summary}
                      maxLength={260}
                      customClass="text-m leading-6 text-slate-700"
                    />
                  </CardContent>
                </Card>
              ) : null}

              <div className="grid min-w-0 gap-5 xl:grid-cols-12 xl:items-stretch">
                <div className="order-1 min-w-0 xl:order-1 xl:col-span-4">
                  <DriversCard drivers={data.what_driving?.drivers} />
                </div>

                <div className="order-2 min-w-0 xl:order-2 xl:col-span-8">
                  <Card className="flex h-[360px] gap-0 rounded-[1.25rem] border-slate-200/90 bg-white py-0 shadow-none sm:h-[420px] xl:h-full xl:min-h-[420px]">
                    <CardHeader className="border-b border-slate-100 px-4 py-4 sm:px-6">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                          <ChartNoAxesCombinedIcon className="h-[1.125rem] w-[1.125rem]" />
                        </span>
                        <div className="min-w-0">
                          <CardTitle className="font-bold items-center text-slate-950 text-base sm:text-lg">
                            Sentiment over time
                            <span className="font-normal text-slate-800">
                              &nbsp;&bull;&nbsp;last {formatWindow(windowHours)}
                            </span>
                          </CardTitle>
                          <CardDescription className="mt-0.5 text-xs sm:text-sm">
                            Coverage volume and sentiment across the selected period.
                          </CardDescription>
                        </div>
                      </div>
                      
                    </CardHeader>
                    <CardContent className="flex min-h-0 flex-1 items-stretch p-2 sm:p-5">
                      <div className="h-full min-h-0 w-full">
                        <SentimentTimelineChart
                          data={data.sentiment_scores_per_hour}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <section className="min-w-0 space-y-5">
                <TopEntities
                  data={entityItems}
                  windowHours={windowHours}
                  variant="inline"
                  onSelect={(entity) => {
                    setSelectedEntity({
                      id: entity.id,
                      name: entity.name,
                      type: entity.type,
                    });
                    void onEntitySelect(entity.name);
                  }}
                />

                <Card className="gap-0 overflow-hidden rounded-[1.25rem] border-slate-200/90 bg-white py-0 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                        <NewspaperIcon className="h-[1.125rem] w-[1.125rem]" />
                      </span>
                      <div className="min-w-0">
                        <CardTitle className="font-bold items-center text-slate-950 text-base sm:text-lg">
                          Latest Headlines
                          <span className="font-normal text-slate-800">
                            &nbsp;&bull;&nbsp;last {formatWindow(windowHours)}
                          </span>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <HeadlinesTable items={data.headlines} />
                  </CardContent>
                </Card>
              </section>
            </div>
          ) : showEmptyState || showIdleState ? (
            <div className="space-y-8 sm:space-y-10">
              <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white/60 px-3 py-5 text-center sm:px-5 sm:py-6">
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  {showEmptyState ? "No news found for this search" : "Explore the latest news"}
                </h2>
                <p className="mx-auto mt-2 max-w-2lg text-sm leading-6 text-slate-600 sm:text-base">
                  {showEmptyState
                    ? "Try a different time window or different search term. You can also explore one of the topics below."
                    : "Search for a topic to see its sentiment, trends, and headlines, or start with one of the top topics below."}
                </p>
                {entityItems.length > 0 && (
                 <div className="space-y-3 mt-5 text-center" aria-label="Popular topics">
                   <TopEntitiesSimple
                     data={entityItems}
                     windowHours={windowHours}
                     variant="inline"
                    onSelect={(entity) => {
                      setSelectedEntity({
                        id: entity.id,
                        name: entity.name,
                        type: entity.type,
                      });
                      void onEntitySelect(entity.name);
                    }}
                   />
                 </div>
               )}
              </div>

            </div>
          ) : null}
          </div>
      </main>
    </div>
  );
}
