import { useCallback, useRef, useState } from "react";

const API_HOST = "https://devapi.palzoltan.net/sentio/live/query";
const API_TOKEN = "testtoken";

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
  id: string | number;
  title: string;
  title_hash?: string | null;
  summary?: string | null;
  link?: string | null;
  published_at: string;
  source_name: string;
  sentiment_label?: SentimentLabel | null;
  sentiment_score?: number | null;
  sentiment_raw?: Record<string, unknown> | string | null;
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
};

type RunParams = {
  query: string;
  windowHours: number;
  useAi?: boolean;
  includeHeadlines?: boolean;
  includeChange?: boolean;
};

type UseLiveAnalysisState = {
  data: LiveQueryResponse | null;
  loading: boolean;
  error: string;
};

const EMPTY_STATE: UseLiveAnalysisState = {
  data: null,
  loading: false,
  error: "",
};

function buildUrl({
  query,
  windowHours,
  useAi = true,
  includeHeadlines = true,
  includeChange = true,
}: RunParams) {
  const params = new URLSearchParams({
    query: query.trim(),
    window_hours: String(windowHours),
    use_ai: String(useAi),
    include_headlines: String(includeHeadlines),
    include_change: String(includeChange),
  });

  return `${API_HOST}?${params.toString()}`;
}

async function fetchLiveAnalysis(
  params: RunParams,
  signal?: AbortSignal
): Promise<LiveQueryResponse> {
  const headers: HeadersInit = {};

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  const response = await fetch(buildUrl(params), {
    method: "GET",
    headers,
    signal,
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

  const run = useCallback(
    async ({
      query,
      windowHours,
      useAi = true,
      includeHeadlines = true,
      includeChange = true,
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
            useAi,
            includeHeadlines,
            includeChange,
          },
          controller.signal
        );

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
    results: state.data,
    loading: state.loading,
    error: state.error,
    run,
    clearResults,
  };
}