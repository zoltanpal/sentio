import { useCallback, useEffect, useState } from "react";
import { BotIcon } from "lucide-react";

import SearchBar from "@/components/search/SearchBar";
import Loading from "@/components/analysis/LoadingState";
import WindowHoursSelector from "@/components/search/WindowHoursSelector";
import HeadlinesTable from "@/components/analysis/HeadlinesTable";

import ExpandableText from "@/components/analysis/ExpandableText";
import SentimentChangeCard from "@/components/analysis/SentimentChangeCard";
import OverallTone from "@/components/analysis/OverallTone";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";
import { useDashboardData } from "@/hooks/useDashboardData";
import { usePromptResolver } from "@/hooks/usePromptResolver";
import {
  clearPendingPrompt,
  clearSearchSession,
  getPendingPrompt,
  getSearchSession,
  setSearchSession,
  type SearchSession,
} from "@/lib/searchSession";
import {
  DEFAULT_WINDOW,
  sanitizeQuery,
  sanitizeWindow,
  validateQuery,
} from "@/lib/searchParams";


import SentimentTimelineChart from "@/components/analysis/SentimentTimelineChart";
import Header from "@/components/layout/Header";

const USE_AI = true;
const USE_AI_PROMPT_RESOLVER = true;

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

  const { data, error, loading, run, clearResults } = useDashboardData();
  const {
    run: resolvePrompt,
    loading: resolving,
    error: resolveError,
  } = usePromptResolver();

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
        clearSearchSession();
        return;
      }

      setPageError("");
      setHasAttemptedSearch(true);
      setResolvedSession(session);
      setPromptInput(rawPrompt || resolvedQuery);
      setActiveQuery(resolvedQuery);
      setWindowHours(resolvedWindow);
      setSearchSession({
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
    [clearResults, run]
  );

  useEffect(() => {
    const pendingPrompt = sanitizeQuery(getPendingPrompt());
    const session = getSearchSession();
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
    clearResults,
    executeResolvedSearch,
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

  const countSources = new Set(data?.headlines.map((h) => h.source_name)).size;
  const lastUpdated = data?.headlines.reduce((latest, headline) => {
    const publishedAt_str = new Date(headline.published_at).getTime();
    return publishedAt_str > latest ? publishedAt_str : latest;
  }, 0);

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
      <Header />

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
          {/* AI Summary */}
          {data.ai_summary ? (
            <div className="rounded-xl border bg-gradient-to-r from-purple-100 to-teal-100 p-4">
              <div className="mb-2 flex items-center gap-2 text-md font-semibold">
                <BotIcon className="h-4 w-4" />
                <span>Live Summary (last {windowHours} hours)</span>
              </div>
              <ExpandableText text={data.ai_summary} maxLength={200} />
            </div>
          ) : null}


          {/* Latest Headlines and Overall Tone */}
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="w-full lg:w-1/4">
              <OverallTone data={data} countSources={countSources} lastUpdated={lastUpdated} />
            </div>
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
          </div>

          
          {/* Sentiment Trend and Change */}
          <div className="flex flex-col-reverse gap-4 lg:flex-row">
            <div className="w-full lg:w-3/4">
              <Card className="flex h-[300px] flex-col gap-0 bg-gradient-to-r from-blue-30 to-blue-50 py-2 sm:h-[360px]">
                <CardHeader className="m-0 px-5 py-0">
                  <CardTitle className="text-lg">Sentiment Trend</CardTitle>
                </CardHeader>

                <CardContent className="flex min-h-0 flex-1 items-stretch p-2 sm:p-2">
                  <div className="h-full w-full min-h-0">
                    <SentimentTimelineChart data={data.sentiment_scores_per_hour} />
                  </div>
                </CardContent>
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
