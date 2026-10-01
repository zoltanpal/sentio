import {
  ALLOWED_WINDOWS,
  DEFAULT_WINDOW,
} from "@/lib/searchParams";
import {
  parseEntityId,
  type SearchSession,
} from "@/lib/searchSession";

export type DashboardViewStateParams = {
  pageError: string;
  resolveError: string;
  analysisError: string;
  loading: boolean;
  resolving: boolean;
  articleCount: number;
  hasAttemptedSearch: boolean;
};

export function getDashboardViewState({
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

export function formatWindow(windowHours: number): string {
  if (windowHours > 24 && windowHours % 24 === 0) {
    return `${windowHours / 24}d`;
  }

  return `${windowHours}h`;
}

export function getPreferredWindow(
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

export function buildDashboardSearch(
  currentSearch: string,
  session: SearchSession,
): string {
  const params = new URLSearchParams(currentSearch);

  params.set("q", session.resolvedQuery);
  params.set(
    "timewindow",
    String(session.resolvedWindowHours ?? DEFAULT_WINDOW),
  );

  const entityId = parseEntityId(session.entityId);

  if (entityId !== null) {
    params.set("entity_id", String(entityId));
  } else {
    params.delete("entity_id");
  }

  return `?${params.toString()}`;
}