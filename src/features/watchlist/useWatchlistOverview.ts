import { useCallback, useEffect, useState } from "react";

import { getFirebaseAuth } from "@/auth/firebase";
import { buildSentioApiUrl } from "@/config/api";

export const WATCHLIST_WINDOWS = [6, 12, 24, 48, 72] as const;
export type WatchlistWindow = (typeof WATCHLIST_WINDOWS)[number];

export type WatchlistOverviewRow = {
  entity_id: number;
  entity_name: string;
  entity_type: string | null;
  followed_at: string | null;
  article_count: number;
  previous_article_count: number;
  analyzed_count: number;
  avg_sentiment: number | null;
  previous_avg_sentiment: number | null;
  sentiment_change: number | null;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  source_count: number;
  latest_title: string | null;
  latest_link: string | null;
  latest_published_at: string | null;
};

type FetchState = {
  key: string;
  rows: WatchlistOverviewRow[];
  loading: boolean;
  error: string | null;
};

const INITIAL_STATE: FetchState = {
  key: "",
  rows: [],
  loading: false,
  error: null,
};

function readNumber(value: unknown, nullable = false): number | null {
  if (value === null && nullable) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const result = Number(value);
    if (Number.isFinite(result)) return result;
  }
  if (nullable && value === undefined) return null;
  throw new Error("Invalid numeric field in watchlist overview.");
}

function readCount(value: unknown): number {
  const count = readNumber(value);
  if (count === null || !Number.isInteger(count) || count < 0) {
    throw new Error("Invalid article count in watchlist overview.");
  }
  return count;
}

function readOptionalText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readOverview(value: unknown): WatchlistOverviewRow[] {
  // The endpoint returns one JSON array with one row for each followed entity.
  if (!Array.isArray(value)) {
    throw new Error("Expected an array from the watchlist overview API.");
  }

  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid watchlist overview row.");
    }

    const row = item as Record<string, unknown>;
    const id = readNumber(row.entity_id);
    if (id === null || !Number.isInteger(id) || typeof row.entity_name !== "string") {
      throw new Error("Invalid entity in watchlist overview.");
    }

    return {
      entity_id: id,
      entity_name: row.entity_name,
      entity_type: readOptionalText(row.entity_type),
      followed_at: readOptionalText(row.followed_at),
      article_count: readCount(row.article_count),
      previous_article_count: readCount(row.previous_article_count),
      analyzed_count: readCount(row.analyzed_count),
      avg_sentiment: readNumber(row.avg_sentiment, true),
      previous_avg_sentiment: readNumber(row.previous_avg_sentiment, true),
      sentiment_change: readNumber(row.sentiment_change, true),
      positive_count: readCount(row.positive_count),
      neutral_count: readCount(row.neutral_count),
      negative_count: readCount(row.negative_count),
      source_count: readCount(row.source_count),
      latest_title: readOptionalText(row.latest_title),
      latest_link: readOptionalText(row.latest_link),
      latest_published_at: readOptionalText(row.latest_published_at),
    };
  });
}

type Options = {
  firebaseUid: string | null;
  ready: boolean;
  watchlistKey: string;
  windowHours: WatchlistWindow;
};

export function useWatchlistOverview({ firebaseUid, ready, watchlistKey, windowHours }: Options) {
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [state, setState] = useState<FetchState>(INITIAL_STATE);
  const enabled = Boolean(firebaseUid && ready && watchlistKey);
  const requestKey = `${firebaseUid ?? ""}:${ready}:${watchlistKey}:${windowHours}:${refreshVersion}`;

  const refresh = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let cancelled = false;

    setState({ key: requestKey, rows: [], loading: true, error: null });

    async function loadOverview() {
      try {
        const currentUser = getFirebaseAuth().currentUser;
        if (!currentUser || currentUser.uid !== firebaseUid) {
          throw new Error("Session changed.");
        }

        const token = await currentUser.getIdToken();
        if (cancelled) return;

        const params = new URLSearchParams({ window_hours: String(windowHours) });
        const response = await fetch(
          buildSentioApiUrl(`/user/watchlist/overview?${params.toString()}`),
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          },
        );

        if (!response.ok) throw new Error(`Watchlist overview request failed: ${response.status}`);

        const rows = readOverview(await response.json());
        if (!cancelled && getFirebaseAuth().currentUser?.uid === firebaseUid) {
          setState({ key: requestKey, rows, loading: false, error: null });
        }
      } catch {
        if (!cancelled) {
          setState({
            key: requestKey,
            rows: [],
            loading: false,
            error: "Could not load watchlist metrics. You can still manage followed entities.",
          });
        }
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, firebaseUid, requestKey, windowHours]);

  const isCurrent = enabled && state.key === requestKey;

  return {
    rows: isCurrent ? state.rows : [],
    loading: enabled && (!isCurrent || state.loading),
    error: isCurrent ? state.error : null,
    refresh,
  };
}
