import { useCallback, useRef, useState } from "react";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";

const API_HOST = buildSentioApiUrl("/live/query");

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

  const run = useCallback(
    async ({
      query,
      windowHours,
      rawPrompt = null,
      useAi = false,
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
            rawPrompt,
            useAi,
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
    data: state.data,
    loading: state.loading,
    error: state.error,
    run,
    clearResults,
  };
}