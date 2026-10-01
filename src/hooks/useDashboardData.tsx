import { useCallback, useEffect, useRef, useState } from "react";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";
import type { LiveQueryResponse } from "@/features/dashboard/types";
import { DEFAULT_WINDOW } from "@/lib/searchParams";

const API_HOST = buildSentioApiUrl("/dashboard");
const CACHE_PREFIX = "sentio_dashb";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
// const CACHE_TTL_MS = 2; // 5 minutes

type RunParams = {
  query: string;
  windowHours?: number;
  useAi?: boolean;
  rawPrompt?: string | null;
  forceRefresh?: boolean;
};

type UseDashboardDataState = {
  data: LiveQueryResponse | null;
  loading: boolean;
  error: string;
};

type CachedDashboardDataEntry = {
  savedAt: number;
  data: LiveQueryResponse;
};

const EMPTY_STATE: UseDashboardDataState = {
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

function readCachedDashboardData(key: string): LiveQueryResponse | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CachedDashboardDataEntry;

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

function writeCachedDashboardData(key: string, data: LiveQueryResponse) {
  try {
    const entry: CachedDashboardDataEntry = {
      savedAt: Date.now(),
      data,
    };

    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore storage failures silently.
  }
}

function removeCachedDashboardData(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage failures silently.
  }
}

async function fetchDashboardData(
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
      window_hours: params.windowHours ?? DEFAULT_WINDOW,
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

  const data: LiveQueryResponse = await response.json();

  console.log("API candidates:", data.watchlist_candidates);

  return data;

}

export function useDashboardData() {
  const [state, setState] = useState<UseDashboardDataState>(EMPTY_STATE);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

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
      removeCachedDashboardData(key);
    },
    []
  );

  const run = useCallback(
    async ({
      query,
      windowHours = DEFAULT_WINDOW,
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
        const cachedData = readCachedDashboardData(cacheKey);

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
        const data = await fetchDashboardData(
          {
            query: cleanedQuery,
            windowHours,
            rawPrompt,
            useAi,
          },
          controller.signal
        );

        writeCachedDashboardData(cacheKey, data);

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
