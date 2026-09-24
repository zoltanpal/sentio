import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

import {
  buildDashboardSearch,
  getDashboardViewState,
  getPreferredWindow,
} from "./dashboardSearch";

const USE_AI = true;
const USE_AI_PROMPT_RESOLVER = true;

export function useDashboardSearch() {
  const [promptInput, setPromptInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [windowHours, setWindowHours] = useState(DEFAULT_WINDOW);
  const [pageError, setPageError] = useState("");
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [resolvedSession, setResolvedSession] = useState<SearchSession | null>(
    null
  );
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const skipSearchRestoreRef = useRef<string | null>(null);

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

      const isDashboard = location.pathname === "/dashboard";

      if (validateQuery(normalizedSession.resolvedQuery)) {
        await loadResolvedSearch(normalizedSession);
        return;
      }

      const nextSearch = buildDashboardSearch(
        isDashboard ? location.search : "",
        normalizedSession
      );

      // Store prompt metadata before navigation. The URL contains only the
      // resolved query and time window.
      setSearchSession(normalizedSession);

      if (!isDashboard) {
        skipSearchRestoreRef.current = null;
        navigate(
          {
            pathname: "/dashboard",
            search: nextSearch,
          },
          { replace }
        );
        return;
      }

      if (nextSearch !== location.search) {
        // Start the analysis before synchronizing the URL. The effect below
        // also observes URL changes, so mark this exact update as already
        // handled to avoid starting the same search a second time.
        skipSearchRestoreRef.current = nextSearch;
        void loadResolvedSearch(normalizedSession);
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
    if (location.pathname !== "/dashboard") {
      skipSearchRestoreRef.current = null;
      return;
    }

    let cancelled = false;

    const params = new URLSearchParams(location.search);
    const session = getSearchSession();
    const pendingPrompt = sanitizeQuery(getPendingPrompt());

    const preferredWindow = getPreferredWindow(
      params.get("timewindow"),
      session?.resolvedWindowHours
    );

    if (skipSearchRestoreRef.current === location.search) {
      skipSearchRestoreRef.current = null;
      return;
    }

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
    location.pathname,
    location.search, 
    executeResolvedSearch, 
    resolvePrompt, 
    clearResults]);

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
      resolvedWindowHours: resolved.window_parsed
        ? resolved.window_hours
        : windowHours,
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

  const viewState = getDashboardViewState({
    pageError,
    resolveError,
    analysisError: error,
    loading,
    resolving,
    articleCount: data?.aggregated.article_count ?? 0,
    hasAttemptedSearch,
  });

  return {
    activeQuery,
    data,
    onEntitySelect,
    onLogoClick,
    onPromptInputChange,
    onSearch,
    onWindowTimeChange,
    promptInput,
    resultsTopRef,
    windowHours,
    ...viewState,
  };
}
