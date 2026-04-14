import { useCallback, useRef, useState } from "react";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";

const API_HOST = buildSentioApiUrl("/live/query");
const CACHE_PREFIX = "sentio_live_analysis";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export type SentimentLabel = "positive" | "neutral" | "negative";

export type SummaryLabel =
  | "positive"
  | "negative"
  | "neutral"
  | "mostly_positive"
  | "mostly_negative"
  | "mixed";

export type Intent =
  | "summary"
  | "reason"
  | "trend"
  | "comparison"
  | "unknown";

export type ChangeDirection = "improving" | "worsening" | "stable";

export type LiveHeadline = {
  id: number;
  title: string;
  title_hash?: string | null;
  summary: string | null;
  link: string | null;
  published_at: string;
  source_name: string;
  sentiment_label: SentimentLabel | null;
  sentiment_score: number | null;
  sentiment_raw: Record<string, unknown> | string | null;
};

export type LiveQueryResponse = {
  query: string;
  window_hours: number;
  intent?: Intent;
  aggregated: {
    article_count: number;
    avg_sentiment: {
      score: number;
      label: SentimentLabel;
    };
    distribution: {
      positive_count: number;
      neutral_count: number;
      negative_count: number;
      positive_pct: number;
      neutral_pct: number;
      negative_pct: number;
    };
    summary: {
      label: SummaryLabel;
      dominant_label: SentimentLabel;
      dominant_pct: number;
    };
  };
  headlines: LiveHeadline[];
  change?: {
    current: {
      article_count: number;
      avg_sentiment_score: number;
    };
    previous: {
      article_count: number;
      avg_sentiment_score: number;
    };
    delta: number;
    direction: ChangeDirection;
  } | null;
  ai_summary?: string | null;
  drivers?: {
    is_meaningful: boolean;
    headlines: {
      title: string;
    }[];
  } | null;
  sentiment_scores_per_hour: {
    bucket_start: string;
    article_count: number;
    avg_sentiment_score: number | null;
  }[];
};

type RunParams = {
  query: string;
  windowHours: number;
  useAi?: boolean;
  rawPrompt?: string | null;
  forceRefresh?: boolean;
};

type UseLiveAnalysisState = {
  data: LiveQueryResponse | null;
  loading: boolean;
  error: string;
};

type CachedLiveAnalysisEntry = {
  savedAt: number;
  data: LiveQueryResponse;
};

const EMPTY_STATE: UseLiveAnalysisState = {
  data: null,
  loading: false,
  error: "",
};

function buildCacheKey({
  query,
  windowHours,
  useAi,
}: {
  query: string;
  windowHours: number;
  useAi: boolean;
}) {
  return `${CACHE_PREFIX}:${query.trim().toLowerCase()}:${windowHours}:ai=${useAi}`;
}

function readCachedLiveAnalysis(key: string): LiveQueryResponse | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedLiveAnalysisEntry;

    if (!parsed?.savedAt || !parsed?.data) {
      sessionStorage.removeItem(key);
      return null;
    }

    const isExpired = Date.now() - parsed.savedAt > CACHE_TTL_MS;
    if (isExpired) {
      sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

function writeCachedLiveAnalysis(key: string, data: LiveQueryResponse) {
  try {
    const entry: CachedLiveAnalysisEntry = {
      savedAt: Date.now(),
      data,
    };

    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage failures silently.
  }
}

function removeCachedLiveAnalysis(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures silently.
  }
}

async function fetchLiveAnalysis(
  params: RunParams,
  signal?: AbortSignal
): Promise<LiveQueryResponse> {
  const headers: HeadersInit = {
    ...getSentioApiHeaders(),
    "Content-Type": "application/json",
  };

  const response = await fetch(API_HOST, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({
      query: params.query.trim(),
      window_hours: params.windowHours,
      use_ai: params.useAi ?? false,
      prompt: params.rawPrompt?.trim() || null,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      message || `Live analysis failed with status ${response.status}`
    );
  }

  return response.json();
}

export function useLiveAnalysis() {
  const [state, setState] = useState<UseLiveAnalysisState>(EMPTY_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    abortRef.current?.abort();
    setState(EMPTY_STATE);
  }, []);

  const clearCacheFor = useCallback(
    ({
      query,
      windowHours,
      useAi = false,
    }: {
      query: string;
      windowHours: number;
      useAi?: boolean;
    }) => {
      const key = buildCacheKey({
        query,
        windowHours,
        useAi,
      });
      removeCachedLiveAnalysis(key);
    },
    []
  );

  const run = useCallback(
    async ({
      query,
      windowHours,
      rawPrompt = null,
      useAi = false,
      forceRefresh = false,
    }: RunParams) => {
      const cleanedQuery = query.trim();

      if (!cleanedQuery) {
        setState({
          data: null,
          loading: false,
          error: "Please provide a search input.",
        });
        return;
      }

      const cacheKey = buildCacheKey({
        query: cleanedQuery,
        windowHours,
        useAi,
      });

      if (!forceRefresh) {
        const cachedData = readCachedLiveAnalysis(cacheKey);

        if (cachedData) {
          abortRef.current?.abort();
          setState({
            data: cachedData,
            loading: false,
            error: "",
          });
          return cachedData;
        }
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: "",
      }));

      try {
        const data = await fetchLiveAnalysis(
          {
            query: cleanedQuery,
            windowHours,
            rawPrompt,
            useAi,
          },
          controller.signal
        );

        writeCachedLiveAnalysis(cacheKey, data);

        setState({
          data,
          loading: false,
          error: "",
        });

        return data;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }

        console.error("Error fetching live analysis:", err);
        setState({
          data: null,
          loading: false,
          error: "Something went wrong while fetching the analysis.",
        });
      }
    },
    []
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    run,
    clearResults,
    clearCacheFor,
  };
}