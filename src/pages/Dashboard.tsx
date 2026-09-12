import { useCallback, useEffect, useRef, useState } from "react";
import {
  BotIcon,
  FileTextIcon,
  Grid2X2Icon,
  CircleQuestionMarkIcon,
  ChartNoAxesCombinedIcon,
  // SparkleIcon,
  NewspaperIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import SearchBar from "@/components/search/SearchBar";
import Loading from "@/components/analysis/LoadingState";
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
  CardDescription,
} from "@/components/shared/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
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
  ALLOWED_WINDOWS,
  DEFAULT_WINDOW,
  sanitizeQuery,
  sanitizeWindow,
  validateQuery,
} from "@/lib/searchParams";
import SentimentTimelineChart from "@/components/analysis/SentimentTimelineChart";

const USE_AI = true; // Set to true to enable AI-powered search resolution
const USE_AI_PROMPT_RESOLVER = true; // Set to true to enable AI-powered prompt resolution
const WINDOW_OPTIONS = [6, 12, 24, 48, 72] as const;


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

function formatWindow(windowHours: number): string {
  if (windowHours > 24 && windowHours % 24 === 0) {
    return `${windowHours / 24}d`;
  }
  return `${windowHours}h`;
}

function getPreferredWindow(
  urlValue: string | null,
  sessionValue: number | null | undefined
): number {
  const urlWindow = Number(urlValue);

  if (urlValue !== null && ALLOWED_WINDOWS.includes(urlWindow)) {
    return urlWindow;
  }

  if (
    typeof sessionValue === "number" &&
    ALLOWED_WINDOWS.includes(sessionValue)
  ) {
    return sessionValue;
  }

  return DEFAULT_WINDOW;
}

function buildDashboardSearch(
  currentSearch: string,
  session: SearchSession
): string {
  const params = new URLSearchParams(currentSearch);

  params.set("q", session.resolvedQuery);
  params.set(
    "timewindow",
    String(session.resolvedWindowHours ?? DEFAULT_WINDOW)
  );

  return `?${params.toString()}`;
}


export default function Dashboard() {
  const [promptInput, setPromptInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [windowHours, setWindowHours] = useState(DEFAULT_WINDOW);
  const [pageError, setPageError] = useState("");
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [resolvedSession, setResolvedSession] = useState<SearchSession | null>(null);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { data, error, loading, run, clearResults } = useDashboardData();
  const {
    run: resolvePrompt,
    loading: resolving,
    error: resolveError,
  } = usePromptResolver();

  const onLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Preserve opening the link in a new tab.
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    const session = getSearchSession();
    navigate(session?.resolvedQuery.trim() ? "/dashboard" : "/");
  };


  const loadResolvedSearch = useCallback(
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

  const executeResolvedSearch = useCallback(
    async (session: SearchSession, replace = false) => {
      const normalizedSession: SearchSession = {
        ...session,
        resolvedQuery: sanitizeQuery(session.resolvedQuery),
        resolvedWindowHours: sanitizeWindow(
          String(session.resolvedWindowHours)
        ),
        rawPrompt: sanitizeQuery(session.rawPrompt) || null,
      };

      if (validateQuery(normalizedSession.resolvedQuery)) {
        await loadResolvedSearch(normalizedSession);
        return;
      }

      const nextSearch = buildDashboardSearch(
        location.search,
        normalizedSession
      );

      // Store prompt metadata before navigation. The URL contains only the
      // resolved query and time window.
      setSearchSession(normalizedSession);

      if (nextSearch !== location.search) {
        navigate(
          {
            pathname: location.pathname,
            search: nextSearch,
            hash: location.hash,
          },
          { replace }
        );
        return;
      }

      // Allow submitting the same search again without URL navigation.
      await loadResolvedSearch(normalizedSession);
    },
    [
      location.pathname,
      location.search,
      location.hash,
      navigate,
      loadResolvedSearch,
    ]
  );  

  const scrollToResults = useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    resultsTopRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

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

      scrollToResults();
      await executeResolvedSearch(nextSession);
    },
    [executeResolvedSearch, scrollToResults, windowHours]
  );

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams(location.search);
    const session = getSearchSession();
    const pendingPrompt = sanitizeQuery(getPendingPrompt());

    const preferredWindow = getPreferredWindow(
      params.get("timewindow"),
      session?.resolvedWindowHours
    );

    const restoreSearch = async () => {
      // An explicit URL query always takes priority.
      if (params.has("q")) {
        clearPendingPrompt();

        const query = sanitizeQuery(params.get("q"));
        const matchesSession = query === session?.resolvedQuery;

        await executeResolvedSearch(
          {
            source: matchesSession ? session.source : "keyword",
            rawPrompt: matchesSession ? session.rawPrompt : null,
            resolvedQuery: query,
            resolvedWindowHours: preferredWindow,
          },
          true
        );
        return;
      }

      // A pending Home submission is a new user action, so it replaces
      // the previously saved search when no URL query is present.
      if (pendingPrompt) {
        const validationError = validateQuery(pendingPrompt);

        if (validationError) {
          setPageError(validationError);
          clearResults();
          clearPendingPrompt();
          return;
        }

        setPromptInput(pendingPrompt);
        setWindowHours(preferredWindow);
        setHasAttemptedSearch(true);
        setPageError("");

        const resolved = await resolvePrompt({
          prompt: pendingPrompt,
          useAi: USE_AI_PROMPT_RESOLVER,
        });

        if (cancelled || !resolved) {
          return;
        }

        clearPendingPrompt();

        await executeResolvedSearch(
          {
            source: "prompt",
            rawPrompt: pendingPrompt,
            resolvedQuery: resolved.query,
            resolvedWindowHours: resolved.window_hours,
          },
          true
        );
        return;
      }

      if (session) {
        await executeResolvedSearch(
          {
            ...session,
            resolvedWindowHours: preferredWindow,
          },
          true
        );
        return;
      }

      // No URL query or saved search: keep the dashboard idle.
      setPromptInput("");
      setActiveQuery("");
      setWindowHours(preferredWindow);
      setResolvedSession(null);
      setHasAttemptedSearch(false);
      setPageError("");
      clearResults();
    };

    void restoreSearch();

    return () => {
      cancelled = true;
    };
  }, [
    location.search,
    executeResolvedSearch,
    resolvePrompt,
    clearResults,
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
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex h-16 items-center gap-3 sm:gap-5">
            <Link to="/" onClick={onLogoClick} className="shrink-0" aria-label="Sentio home">
              <img
                src="/logo/sentio_logo.png"
                alt="Sentio"
                className="h-auto w-32 sm:w-42"
              />
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              <span className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                <Grid2X2Icon className="h-4 w-4" />
                Dashboard
              </span>
              <Link
                to="/sources"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                <FileTextIcon className="h-4 w-4" />
                Sources
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
              >
                <CircleQuestionMarkIcon className="h-4 w-4" />
                How it works
              </Link>
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

            <div className="ml-auto min-w-0 flex-1 lg:hidden">
              <SearchBar
                value={promptInput}
                onChange={onPromptInputChange}
                onSearch={onSearch}
                loading={isBusy}
                error={displayError}
                placeholder="Search..."
                size="md"
                inputClassName="min-w-0 py-1.5 text-sm"
                buttonClassName="px-3"
              />
            </div>
          </div>
        </div>
      </header>

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
                  data={data.top_entities}
                  windowHours={windowHours}
                  variant="inline"
                  onSelect={(entity) => {
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
          ) : showEmptyState ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500 sm:p-12">
              No news found for the given query and time window. Please try
              expanding the time window or using different keywords.
            </div>
          ) : showIdleState ? (
            <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white/60 p-8 text-center text-slate-500 sm:p-12">
              Enter a topic to start analyzing live news sentiment.
            </div>
          ) : null}
          </div>
      </main>
    </div>
  );
}
