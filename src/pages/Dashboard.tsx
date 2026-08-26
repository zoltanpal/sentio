import { useCallback, useEffect, useState } from "react";
import { BotIcon, FileTextIcon, Grid2X2Icon } from "lucide-react";
import { Link } from "react-router-dom";

import SearchBar from "@/components/search/SearchBar";
import Loading from "@/components/analysis/LoadingState";
import WindowHoursSelector from "@/components/search/WindowHoursSelector";
import HeadlinesTable from "@/components/analysis/HeadlinesTable";

import ExpandableText from "@/components/analysis/ExpandableText";
import DashboardSummaryCard from "@/components/analysis/DashboardSummaryCard";
import DriversCard from "@/components/analysis/DriversCard";
import TopEntities from "@/components/analysis/TopEntities";
import DashboardHeading from "@/components/analysis/DashboardHeading";

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

const USE_AI = false; // Set to true to enable AI-powered search resolution
const USE_AI_PROMPT_RESOLVER = false; // Set to true to enable AI-powered prompt resolution

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

  const onEntitySelect = useCallback(
    async (entityText: string) => {
      const query = sanitizeQuery(entityText);
      const validationError = validateQuery(query);

      if (validationError) {
        setPageError(validationError);
        return;
      }

      const nextSession: SearchSession = {
        source: "keyword",
        rawPrompt: query,
        resolvedQuery: query,
        resolvedWindowHours: windowHours,
      };

      await executeResolvedSearch(nextSession);
    },
    [executeResolvedSearch, windowHours]
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
          // The resolver may return its own fallback window (currently 6h).
          // A new dashboard search starts with the 24-hour default instead.
          resolvedWindowHours: DEFAULT_WINDOW,
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
      // A new search should retain the user's selected window. On a fresh
      // dashboard visit this is DEFAULT_WINDOW (24 hours).
      resolvedWindowHours: windowHours,
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-5">
          <Link to="/" className="shrink-0" aria-label="Sentio home">
            <img src="/logo/sentio_logo.png" alt="Sentio" className="h-auto w-36" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <span className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"><Grid2X2Icon className="h-4 w-4" />Dashboard</span>
            <Link to="/sources" className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950"><FileTextIcon className="h-4 w-4" />Sources</Link>
            <Link to="/help" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-950">How it works</Link>
          </nav>
          <div className="ml-auto hidden w-full max-w-[30rem] lg:block">
            <SearchBar
              value={promptInput}
              onChange={onPromptInputChange}
              onSearch={onSearch}
              loading={isBusy}
              error={displayError}
              placeholder="e.g. Tesla, NVDA, oil prices"
              size="md"
              inputClassName="py-1.5 text-sm sm:py-1.5"
              buttonClassName="px-3 sm:px-3"
            />
          </div>
        </div>
      </header>

      {/* Workspace navigation is intentionally disabled until its routes are available. */}
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 grid gap-3 lg:hidden">
              <SearchBar value={promptInput} onChange={onPromptInputChange} onSearch={onSearch} loading={isBusy} error={displayError} placeholder="Search topics, companies, or sources..." size="md" />
            </div>

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                {hasResults && data ? <DashboardHeading query={activeQuery} windowHours={windowHours} /> : <><h1 className="text-3xl font-bold tracking-tight">Dashboard</h1><p className="mt-1 text-slate-500">Search a topic to understand the news behind the signal.</p></>}
              </div>
              <div className="w-full sm:w-44 lg:w-56">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Time window</span>
                <WindowHoursSelector value={windowHours} onChange={onWindowTimeChange} />
              </div>
            </div>

      {isBusy ? (
        <Loading text="Analyzing feeds, please wait..." />
      ) : hasResults && data ? (
        <div className="space-y-6">
          {data.ai_summary ? (
            <section className="rounded-2xl border border-indigo-100 bg-[linear-gradient(110deg,#f5f3ff_0%,#eef8ff_100%)] p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm"><BotIcon className="h-4 w-4" /></span>
                <span>Live brief</span>
                <span className="font-normal text-slate-500">· last {windowHours} hours</span>
              </div>
              <ExpandableText text={data.ai_summary} maxLength={260} customClass="text-sm leading-6 text-slate-700" />
            </section>
          ) : null}

          <DashboardSummaryCard data={data} sourceCount={countSources} />

          <div className="grid gap-5 xl:grid-cols-12">
            <div className="space-y-5 xl:col-span-5">
              <DriversCard drivers={data.what_driving} />
            </div>
            <div className="xl:col-span-7">
              <Card className="h-[350px] gap-0 border-slate-200 py-0 shadow-sm sm:h-[390px]">
                <CardHeader className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3"><CardTitle className="text-lg text-slate-900">Sentiment over time</CardTitle><span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{windowHours}H</span></div>
                  <p className="text-sm text-slate-500">Coverage volume and sentiment across the selected period.</p>
                </CardHeader>
                <CardContent className="flex min-h-0 flex-1 items-stretch p-3 sm:p-5">
                  <div className="h-full w-full min-h-0">
                    <SentimentTimelineChart data={data.sentiment_scores_per_hour} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <section>
            <TopEntities
              data={data.top_entities}
              windowHours={windowHours}
              variant="inline"
              onSelect={(entity) => {
                void onEntitySelect(entity.name);
              }}
            />
            <Card className="mt-5 gap-0 overflow-hidden border-slate-200 py-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <CardTitle className="text-base text-slate-900">Latest Headlines ({windowHours}h)</CardTitle>
                  {/* <p className="mt-1 text-sm text-slate-500">Recent articles behind the signal.</p> */}
                </div>
                <span className="text-sm font-medium text-slate-500">{data.headlines.length} articles</span>
              </CardHeader>
              <CardContent className="p-0">
                <HeadlinesTable items={data.headlines} />
              </CardContent>
            </Card>
          </section>
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
        </main>
    </div>
  );
}
