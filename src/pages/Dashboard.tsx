import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BotIcon, NewspaperIcon } from "lucide-react";

import SearchBar from "@/components/search/SearchBar";
import Loading from "@/components/analysis/LoadingState";
import WindowHoursSelector from "@/components/search/WindowHoursSelector";
import HeadlinesTable from "@/components/analysis/HeadlinesTable";
import SentimentDoughnut from "@/components/analysis/SentimentDoughnut";
import ExpandableText from "@/components/analysis/ExpandableText";
import SentimentChangeCard from "@/components/analysis/SentimentChangeCard";

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

const sentimentLabelMap: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mostly_positive: "Mostly Positive",
  mostly_negative: "Mostly Negative",
  mixed: "Mixed",
};

const ALLOWED_WINDOWS = [6, 12, 24, 48, 72];
const DEFAULT_WINDOW = 6;
const USE_AI = true;
const USE_AI_PROMPT_RESOLVER = true;

function sanitizeWindow(value: string | null): number {
  const parsed = Number(value);
  return ALLOWED_WINDOWS.includes(parsed) ? parsed : DEFAULT_WINDOW;
}

function sanitizeQuery(value: string | null): string {
  return (value ?? "").trim();
}

function validateQuery(query: string): string {
  const trimmed = query.trim();

  if (!trimmed) {
    return "Please enter at least one keyword.";
  }

  if (trimmed.length < 3) {
    return "Please enter at least 3 characters.";
  }

  return "";
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryFromUrl = useMemo(
    () => sanitizeQuery(searchParams.get("query")),
    [searchParams]
  );

  const windowFromUrl = useMemo(
    () => sanitizeWindow(searchParams.get("window")),
    [searchParams]
  );

  const modeFromUrl = useMemo(
    () => sanitizeQuery(searchParams.get("mode")),
    [searchParams]
  );

  const [promptInput, setPromptInput] = useState("");
  const [activeQuery, setActiveQuery] = useState(queryFromUrl);
  const [windowHours, setWindowHours] = useState(windowFromUrl);
  const [pageError, setPageError] = useState("");
  const [isPreparingSearch, setIsPreparingSearch] = useState(
    modeFromUrl === "prompt" || Boolean(queryFromUrl)
  );
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(
    modeFromUrl === "prompt" || Boolean(queryFromUrl)
  );
  const [resolvedSession, setResolvedSession] =
    useState<SearchSession | null>(null);

  const {
    data,
    loading,
    error,
    run,
    clearResults,
  } = useLiveAnalysis();

  const {
    run: resolvePrompt,
    loading: resolving,
    error: resolveError,
  } = usePromptResolver();

  const {
    getSession,
    setSession,
    getPendingPrompt,
    clearPendingPrompt,
  } = useSearchSession();

  useEffect(() => {
    const session = getSession();
    setResolvedSession(session);

    if (session?.source === "prompt" && session.rawPrompt) {
      setPromptInput(session.rawPrompt);
      setActiveQuery(session.resolvedQuery);
    } else {
      setPromptInput(queryFromUrl);
      setActiveQuery(queryFromUrl);
    }
  }, [getSession, queryFromUrl]);

  useEffect(() => {
    setWindowHours(windowFromUrl);
  }, [windowFromUrl]);

  useEffect(() => {
    if (modeFromUrl !== "prompt") {
      return;
    }

    const pendingPrompt = getPendingPrompt();
    const safePrompt = sanitizeQuery(pendingPrompt);

    const validationError = validateQuery(safePrompt);

    if (validationError) {
      setPageError(validationError);
      setIsPreparingSearch(false);
      clearResults();
      clearPendingPrompt();
      return;
    }

    let cancelled = false;

    setPromptInput(safePrompt);
    setPageError("");
    setIsPreparingSearch(true);
    setHasAttemptedSearch(true);

    const resolveAndRedirect = async () => {
      const resolved = await resolvePrompt({
        prompt: safePrompt,
        useAi: USE_AI_PROMPT_RESOLVER,
      });

      if (!resolved || cancelled) {
        if (!cancelled) {
          setIsPreparingSearch(false);
        }
        return;
      }

      const nextSession: SearchSession = {
        source: "prompt",
        rawPrompt: safePrompt,
        resolvedQuery: resolved.query,
        resolvedWindowHours: resolved.window_hours,
      };

      setSession(nextSession);
      setResolvedSession(nextSession);

      setActiveQuery(resolved.query);
      setWindowHours(resolved.window_hours);

      clearPendingPrompt();

      setSearchParams({
        query: resolved.query,
        window: String(resolved.window_hours),
      });
    };

    resolveAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [
    modeFromUrl,
    resolvePrompt,
    getPendingPrompt,
    setSession,
    clearPendingPrompt,
    setSearchParams,
    clearResults,
  ]);

  useEffect(() => {
    if (modeFromUrl === "prompt") {
      return;
    }

    const rawQuery = searchParams.get("query");
    const rawWindow = searchParams.get("window");
    const safeQuery = sanitizeQuery(rawQuery);
    const safeWindow = sanitizeWindow(rawWindow);

    const validationError = validateQuery(safeQuery);

    if (validationError) {
      if (rawQuery !== null) {
        setPageError(validationError);
      }
      setIsPreparingSearch(false);
      setHasAttemptedSearch(false);
      clearResults();
      return;
    }

    if (rawWindow !== null && Number(rawWindow) !== safeWindow) {
      setPageError(
        `Invalid time window. Using default value (${DEFAULT_WINDOW}h).`
      );
    } else {
      setPageError("");
    }

    setActiveQuery(safeQuery);
    setIsPreparingSearch(false);
    setHasAttemptedSearch(true);

    run({
      query: safeQuery,
      windowHours: safeWindow,
      useAi: USE_AI,
    });
  }, [searchParams, modeFromUrl, run, clearResults]);

  const executeSearch = (nextQuery: string, nextWindow: number) => {
    const trimmedQuery = nextQuery.trim();
    const validationError = validateQuery(trimmedQuery);

    if (validationError) {
      setPageError(validationError);
      return;
    }

    setPageError("");
    setActiveQuery(trimmedQuery);

    setSearchParams({
      query: trimmedQuery,
      window: String(nextWindow),
    });
  };

  const onSearch = async () => {
    const trimmedPrompt = promptInput.trim();
    const validationError = validateQuery(trimmedPrompt);

    if (validationError) {
      setPageError(validationError);
      return;
    }

    setPageError("");
    setIsPreparingSearch(true);
    setHasAttemptedSearch(true);

    const resolved = await resolvePrompt({
      prompt: trimmedPrompt,
      useAi: USE_AI_PROMPT_RESOLVER,
    });

    if (!resolved) {
      setIsPreparingSearch(false);
      return;
    }

    const nextSession: SearchSession = {
      source: "prompt",
      rawPrompt: trimmedPrompt,
      resolvedQuery: resolved.query,
      resolvedWindowHours: resolved.window_hours,
    };

    setSession(nextSession);
    setResolvedSession(nextSession);

    setActiveQuery(resolved.query);
    setWindowHours(resolved.window_hours);

    setSearchParams({
      query: resolved.query,
      window: String(resolved.window_hours),
    });
  };

  const onWindowTimeChange = (nextWindow: number) => {
    if (nextWindow === windowHours) return;

    setWindowHours(nextWindow);
    setHasAttemptedSearch(true);
    executeSearch(activeQuery, nextWindow);
  };

  const displayError = pageError || resolveError || error;
  const isBusy = loading || resolving || isPreparingSearch;
  const hasResults = (data?.aggregated.article_count ?? 0) > 0;
  const hasUnsavedPromptChanges =
    resolvedSession?.source === "prompt" &&
    Boolean(resolvedSession.rawPrompt) &&
    promptInput.trim() !== (resolvedSession.rawPrompt ?? "").trim();
  const showEmptyState = hasAttemptedSearch && !isBusy && !displayError && !hasResults;
  const showIdleState = !hasAttemptedSearch && !isBusy;


  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-3">
      <div className="mb-4 flex items-center justify-between px-2">
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

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
          <div className="w-full">
            <SearchBar
              value={promptInput}
              onChange={(value) => {
                setPromptInput(value);
                if (pageError) setPageError("");
              }}
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

        {/* {resolvedSession?.source === "prompt" &&
        resolvedSession.rawPrompt &&
        activeQuery ? (
          <div className="mt-3 text-sm text-gray-500">
            Searching for:{" "}
            <span className="font-medium text-gray-700">{activeQuery}</span>
          </div>
        ) : null} */}

        {/* {hasUnsavedPromptChanges ? (
          <div className="mt-2 text-sm text-gray-500">
            Time window changes still apply to the current parsed query until
            you search again.
          </div>
        ) : null} */}
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

          {data.change ? (
            <div className="flex w-[300px] flex-col">
              <SentimentChangeCard data={data.change} />
            </div>
          ) : null}

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

                <CardContent className="flex-1 px-2 pb-2 sm:px-3">
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

                <CardFooter className="px-3 py-2">
                  <Badge
                    variant="secondary"
                    className="flex max-w-full items-center gap-1 border-green-200 bg-green-200 px-2 text-[11px] sm:text-xs"
                  >
                    <NewspaperIcon className="h-3.5 w-3.5" />
                    <span>{data.aggregated.article_count} articles</span>
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
      ) : null
      }
    </div>
  );
}
