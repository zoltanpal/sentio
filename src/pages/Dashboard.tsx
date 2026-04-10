import { useCallback, useEffect, useState } from "react";
import { BotIcon, GlobeIcon, NewspaperIcon } from "lucide-react";

import SearchBar from "@/components/search/SearchBar";
import Loading from "@/components/analysis/LoadingState";
import WindowHoursSelector from "@/components/search/WindowHoursSelector";
import HeadlinesTable from "@/components/analysis/HeadlinesTable";
import SentimentDoughnut from "@/components/analysis/SentimentDoughnut";
import ExpandableText from "@/components/analysis/ExpandableText";
import SentimentChangeCard from "@/components/analysis/SentimentChangeCard";
import { ChangeCard } from "@/components/analysis/ChangeCard";
import { MainNavigationMenu } from "@/components/layout/nav";

import { Badge } from "@/components/shared/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { useLiveAnalysis } from "@/hooks/useLiveAnalysis";
import { usePromptResolver } from "@/hooks/usePromptResolver";
import {
  useSearchSession,
  type SearchSession,
} from "@/hooks/useSearchSession";
import {
  DEFAULT_WINDOW,
  sanitizeQuery,
  sanitizeWindow,
  validateQuery,
} from "@/lib/searchParams";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/shared/ui/navigation-menu"


import SentimentTimelineChart from "@/components/analysis/SentimentTimelineChart";

const sentimentLabelMap: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mostly_positive: "Mostly Positive",
  mostly_negative: "Mostly Negative",
  mixed: "Mixed",
};

const USE_AI = false;
const USE_AI_PROMPT_RESOLVER = false;

type DashboardViewStateParams = {
  pageError: string;
  resolveError: string;
  analysisError: string;
  loading: boolean;
  resolving: boolean;
  articleCount: number;
  hasAttemptedSearch: boolean;
};

function getDashboardViewState({
  pageError,
  resolveError,
  analysisError,
  loading,
  resolving,
  articleCount,
  hasAttemptedSearch,
}: DashboardViewStateParams) {
  const displayError = pageError || resolveError || analysisError;
  const isBusy = loading || resolving;
  const hasResults = articleCount > 0;
  const showEmptyState =
    hasAttemptedSearch && !isBusy && !displayError && !hasResults;
  const showIdleState = !hasAttemptedSearch && !isBusy;

  return {
    displayError,
    hasResults,
    isBusy,
    showEmptyState,
    showIdleState,
  };
}

export default function Dashboard() {
  const [promptInput, setPromptInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [windowHours, setWindowHours] = useState(DEFAULT_WINDOW);
  const [pageError, setPageError] = useState("");
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [resolvedSession, setResolvedSession] =
    useState<SearchSession | null>(null);

  const { data, error, loading, run, clearResults } = useLiveAnalysis();
  const {
    run: resolvePrompt,
    loading: resolving,
    error: resolveError,
  } = usePromptResolver();

  const {
    getSession,
    setSession,
    clearSession,
    getPendingPrompt,
    clearPendingPrompt,
  } = useSearchSession();

  const executeResolvedSearch = useCallback(
    async (session: SearchSession) => {
      const resolvedQuery = sanitizeQuery(session.resolvedQuery);
      const resolvedWindow = sanitizeWindow(String(session.resolvedWindowHours));
      const rawPrompt = sanitizeQuery(session.rawPrompt);
      const validationError = validateQuery(resolvedQuery);

      if (validationError) {
        setPageError(validationError);
        setHasAttemptedSearch(false);
        setResolvedSession(null);
        clearResults();
        clearSession();
        return;
      }

      setPageError("");
      setHasAttemptedSearch(true);
      setResolvedSession(session);
      setPromptInput(rawPrompt || resolvedQuery);
      setActiveQuery(resolvedQuery);
      setWindowHours(resolvedWindow);
      setSession({
        ...session,
        resolvedQuery,
        resolvedWindowHours: resolvedWindow,
        rawPrompt: rawPrompt || null,
      });

      await run({
        query: resolvedQuery,
        windowHours: resolvedWindow,
        rawPrompt: rawPrompt || null,
        useAi: USE_AI,
      });
    },
    [clearResults, clearSession, run, setSession]
  );

  useEffect(() => {
    const pendingPrompt = sanitizeQuery(getPendingPrompt());
    const session = getSession();
    let cancelled = false;

    if (pendingPrompt) {
      void (async () => {
        const validationError = validateQuery(pendingPrompt);

        if (cancelled) {
          return;
        }

        if (validationError) {
          setPageError(validationError);
          clearResults();
          clearPendingPrompt();
          return;
        }

        setPromptInput(pendingPrompt);
        setHasAttemptedSearch(true);
        setPageError("");

        const resolved = await resolvePrompt({
          prompt: pendingPrompt,
          useAi: USE_AI_PROMPT_RESOLVER,
        });

        if (!resolved || cancelled) {
          return;
        }

        clearPendingPrompt();

        const nextSession: SearchSession = {
          source: "prompt",
          rawPrompt: pendingPrompt,
          resolvedQuery: resolved.query,
          resolvedWindowHours: resolved.window_hours,
        };

        await executeResolvedSearch(nextSession);
      })();

      return () => {
        cancelled = true;
      };
    }

    if (!session) {
      return;
    }

    void executeResolvedSearch(session);

    return () => {
      cancelled = true;
    };
  }, [
    clearPendingPrompt,
    clearResults,
    executeResolvedSearch,
    getPendingPrompt,
    getSession,
    resolvePrompt,
  ]);

  const onSearch = async () => {
    const trimmedPrompt = promptInput.trim();
    const validationError = validateQuery(trimmedPrompt);

    if (validationError) {
      setPageError(validationError);
      return;
    }

    setPageError("");
    setHasAttemptedSearch(true);

    const resolved = await resolvePrompt({
      prompt: trimmedPrompt,
      useAi: USE_AI_PROMPT_RESOLVER,
    });

    if (!resolved) {
      return;
    }

    const nextSession: SearchSession = {
      source: "prompt",
      rawPrompt: trimmedPrompt,
      resolvedQuery: resolved.query,
      resolvedWindowHours: resolved.window_hours,
    };

    await executeResolvedSearch(nextSession);
  };

  const onWindowTimeChange = (nextWindow: number) => {
    const normalizedWindow = sanitizeWindow(String(nextWindow));

    if (normalizedWindow === windowHours) {
      return;
    }

    setWindowHours(normalizedWindow);
    setHasAttemptedSearch(true);

    if (!activeQuery) {
      return;
    }

    const nextSession: SearchSession = {
      source: resolvedSession?.source ?? "prompt",
      rawPrompt: resolvedSession?.rawPrompt ?? (promptInput.trim() || null),
      resolvedQuery: activeQuery,
      resolvedWindowHours: normalizedWindow,
    };

    void executeResolvedSearch(nextSession);
  };

  const onPromptInputChange = (value: string) => {
    setPromptInput(value);
    if (pageError) {
      setPageError("");
    }
  };

  const {
    displayError,
    isBusy,
    hasResults,
    showEmptyState,
    showIdleState,
  } = getDashboardViewState({
    pageError,
    resolveError,
    analysisError: error,
    loading,
    resolving,
    articleCount: data?.aggregated.article_count ?? 0,
    hasAttemptedSearch,
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-3">
      <div className="flex justify-between px-2">
        <div className="pb-4 items-center">
          <a href="/" className="flex items-center gap-2 sm:gap-4">
            <img
              src="/logo.png"
              alt="Sentio Logo"
              className="w-10 sm:w-14 md:w-16"
            />
            <h1 className="font-bold tracking-tight sm:text-4xl md:text-5xl">
              Sentio
            </h1>
          </a>
        </div>
        <div className="md:flex items-bottom">
          <MainNavigationMenu></MainNavigationMenu>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
          <div className="w-full">
            <SearchBar
              value={promptInput}
              onChange={onPromptInputChange}
              onSearch={onSearch}
              loading={isBusy}
              error={displayError}
              placeholder="e.g. Tesla, NVDA, oil prices"
              size="md"
            />
          </div>

          <div className="flex min-w-[220px] flex-col gap-1">
            <span className="text-sm">Time window</span>
            <WindowHoursSelector
              value={windowHours}
              onChange={onWindowTimeChange}
            />
          </div>
        </div>
      </div>

      {isBusy ? (
        <Loading text="Analyzing feeds, please wait..." />
      ) : hasResults && data ? (
        <div className="space-y-8">
          {data.ai_summary ? (
            <div className="rounded-xl border bg-gradient-to-r from-purple-100 to-teal-100 p-4">
              <div className="mb-2 flex items-center gap-2 text-md font-semibold">
                <BotIcon className="h-4 w-4" />
                <span>Live Summary (last {windowHours} hours)</span>
              </div>
              <ExpandableText text={data.ai_summary} maxLength={200} />
            </div>
          ) : null}
          
          <div className="flex flex-col-reverse gap-4 lg:flex-row">
            <div className="w-full lg:w-3/4">
              <Card className="h-[300px] gap-0 bg-gradient-to-r from-blue-30 to-blue-50 py-2 sm:h-[320px]">
                <SentimentTimelineChart data={data.sentiment_scores_per_hour} />
              </Card>
            </div>
            <div className="w-full lg:w-1/4">
              <SentimentChangeCard
                data={data.change}
                drivers={data.drivers}
                windowHours={data.window_hours}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-4 lg:flex-row">
            <div className="w-full lg:w-3/4">
              <Card className="h-[300px] gap-0 bg-gradient-to-r from-pink-30 to-pink-50 py-2 sm:h-[320px]">
                <CardHeader className="m-0 px-5 py-2">
                  <CardTitle className="text-lg">Latest Headlines</CardTitle>
                </CardHeader>
                <CardContent className="m-0 h-[220px] p-0">
                  <HeadlinesTable items={data.headlines} />
                </CardContent>
              </Card>
            </div>

            <div className="w-full lg:w-1/4">
              <Card className="h-[300px] gap-0 bg-gradient-to-r from-pink-50 to-pink-100 py-2 sm:h-[320px]">
                <CardHeader className="px-4 py-2 sm:px-5">
                  <CardTitle className="text-base sm:text-lg">
                    Overall Tone
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 px-2 pb-0 sm:px-3">
                  <div className="relative h-[160px] sm:h-[180px] md:h-[190px]">
                    <SentimentDoughnut
                      distribution={data.aggregated.distribution}
                      summaryLabel={
                        sentimentLabelMap[data.aggregated.summary.label] ??
                        data.aggregated.summary.label
                      }
                    />
                  </div>
                </CardContent>

                <CardFooter className="px-3 py-2 gap-1">
                  <Badge
                    variant="secondary"
                    className="flex max-w-full items-center gap-1 border-green-200 bg-green-200 px-2 text-[11px] sm:text-xs"
                  >
                    <NewspaperIcon className="h-3.5 w-3.5" />
                    <span>{data.aggregated.article_count} articles</span>
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="flex max-w-full items-center gap-1 border-blue-200 bg-blue-200 px-2 text-[11px] sm:text-xs"
                  >
                    <GlobeIcon className="h-3.5 w-3.5" />
                    <span>{countSources} sources</span>
                  </Badge>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : showEmptyState ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-muted-foreground">
          No news found for the given query and time window. Please try expanding
          the time window or using different keywords.
        </div>
      ) : showIdleState ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-muted-foreground">
          Enter a topic to start analyzing live news sentiment.
        </div>
      ) : null}
    </div>
  );
}
