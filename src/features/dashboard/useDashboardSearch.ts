import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useDashboardData } from "@/hooks/useDashboardData";
import { usePromptResolver } from "@/hooks/usePromptResolver";
import {
  clearPendingPrompt,
  clearSearchSession,
  getPendingPrompt,
  getSearchSession,
  parseEntityId,
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

type SelectedEntity = {
  id: number;
  name: string;
};

export function useDashboardSearch() {
  const [promptInput, setPromptInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [windowHours, setWindowHours] = useState(DEFAULT_WINDOW);
  const [pageError, setPageError] = useState("");
  const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);
  const [resolvedSession, setResolvedSession] =
    useState<SearchSession | null>(null);

  const resultsTopRef = useRef<HTMLDivElement>(null);
  const skipSearchRestoreRef = useRef<string | null>(null);

  // Prevent an older prompt resolution from overriding a newer action.
  const promptVersionRef = useRef(0);

  const location = useLocation();
  const navigate = useNavigate();

  const { data, error, loading, run, clearResults } = useDashboardData();

  const {
    run: resolvePrompt,
    loading: resolving,
    error: resolveError,
  } = usePromptResolver();

  useEffect(() => {
    return () => {
      promptVersionRef.current += 1;
    };
  }, []);

  const onLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
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
    promptVersionRef.current += 1;

    const session = getSearchSession();

    navigate(session?.resolvedQuery.trim() ? "/dashboard" : "/");
  };

  const loadResolvedSearch = useCallback(
    async (session: SearchSession) => {
      const resolvedQuery = sanitizeQuery(session.resolvedQuery);
      const resolvedWindow = sanitizeWindow(
        String(session.resolvedWindowHours),
      );
      const rawPrompt = sanitizeQuery(session.rawPrompt);
      const entityId = parseEntityId(session.entityId);
      const validationError = validateQuery(resolvedQuery);

      if (validationError) {
        setPageError(validationError);
        setHasAttemptedSearch(false);
        setResolvedSession(null);
        clearResults();
        clearSearchSession();
        return;
      }

      const normalizedSession: SearchSession = {
        ...session,
        resolvedQuery,
        resolvedWindowHours: resolvedWindow,
        rawPrompt: rawPrompt || null,
        entityId,
      };

      setPageError("");
      setHasAttemptedSearch(true);
      setResolvedSession(normalizedSession);
      setPromptInput(rawPrompt || resolvedQuery);
      setActiveQuery(resolvedQuery);
      setWindowHours(resolvedWindow);
      setSearchSession(normalizedSession);

      await run({
        query: resolvedQuery,
        windowHours: resolvedWindow,
        rawPrompt: rawPrompt || null,
        useAi: USE_AI,
      });
    },
    [clearResults, run],
  );

  const executeResolvedSearch = useCallback(
    async (session: SearchSession, replace = false) => {
      const normalizedSession: SearchSession = {
        ...session,
        resolvedQuery: sanitizeQuery(session.resolvedQuery),
        resolvedWindowHours: sanitizeWindow(
          String(session.resolvedWindowHours),
        ),
        rawPrompt: sanitizeQuery(session.rawPrompt) || null,
        entityId: parseEntityId(session.entityId),
      };

      const isDashboard = location.pathname === "/dashboard";

      if (validateQuery(normalizedSession.resolvedQuery)) {
        await loadResolvedSearch(normalizedSession);
        return;
      }

      const nextSearch = buildDashboardSearch(
        isDashboard ? location.search : "",
        normalizedSession,
      );

      setSearchSession(normalizedSession);

      if (!isDashboard) {
        skipSearchRestoreRef.current = null;

        navigate(
          {
            pathname: "/dashboard",
            search: nextSearch,
          },
          { replace },
        );

        return;
      }

      if (nextSearch !== location.search) {
        // Start loading immediately and avoid repeating the same request
        // when the URL restoration effect observes this navigation.
        skipSearchRestoreRef.current = nextSearch;
        void loadResolvedSearch(normalizedSession);

        navigate(
          {
            pathname: location.pathname,
            search: nextSearch,
            hash: location.hash,
          },
          { replace },
        );

        return;
      }

      // Submitting the same query again can still reload its data.
      await loadResolvedSearch(normalizedSession);
    },
    [
      location.pathname,
      location.search,
      location.hash,
      navigate,
      loadResolvedSearch,
    ],
  );

  const scrollToResults = useCallback(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    resultsTopRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, []);

  const onEntitySelect = useCallback(
    async (entity: SelectedEntity) => {
      const query = sanitizeQuery(entity.name);
      const entityId = parseEntityId(entity.id);
      const validationError = validateQuery(query);

      if (validationError || entityId === null) {
        setPageError(validationError || "Invalid entity.");
        return;
      }

      promptVersionRef.current += 1;
      clearPendingPrompt();

      const nextSession: SearchSession = {
        source: "keyword",
        rawPrompt: query,
        resolvedQuery: query,
        resolvedWindowHours: windowHours,
        entityId,
      };

      scrollToResults();
      await executeResolvedSearch(nextSession);
    },
    [executeResolvedSearch, scrollToResults, windowHours],
  );

  useEffect(() => {
    if (location.pathname !== "/dashboard") {
      skipSearchRestoreRef.current = null;
      promptVersionRef.current += 1;
      return;
    }

    if (skipSearchRestoreRef.current === location.search) {
      skipSearchRestoreRef.current = null;
      return;
    }

    skipSearchRestoreRef.current = null;

    let cancelled = false;
    const version = ++promptVersionRef.current;

    const params = new URLSearchParams(location.search);
    const session = getSearchSession();
    const pendingPrompt = sanitizeQuery(getPendingPrompt());

    const preferredWindow = getPreferredWindow(
      params.get("timewindow"),
      session?.resolvedWindowHours,
    );

    const restoreSearch = async () => {
      // The URL takes priority over previously stored selections.
      if (params.has("q")) {
        clearPendingPrompt();

        const query = sanitizeQuery(params.get("q"));
        const entityId = parseEntityId(params.get("entity_id"));

        const matchesSession =
          query === session?.resolvedQuery &&
          entityId === parseEntityId(session?.entityId);

        await executeResolvedSearch(
          {
            source:
              matchesSession && session ? session.source : "keyword",
            rawPrompt:
              matchesSession && session ? session.rawPrompt : null,
            resolvedQuery: query,
            resolvedWindowHours: preferredWindow,
            entityId,
          },
          true,
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

        if (
          cancelled ||
          version !== promptVersionRef.current ||
          !resolved
        ) {
          return;
        }

        clearPendingPrompt();

        await executeResolvedSearch(
          {
            source: "prompt",
            rawPrompt: pendingPrompt,
            resolvedQuery: resolved.query,
            resolvedWindowHours: resolved.window_parsed
              ? resolved.window_hours
              : preferredWindow,
            entityId: null,
          },
          true,
        );

        return;
      }

      if (session) {
        await executeResolvedSearch(
          {
            ...session,
            resolvedWindowHours: preferredWindow,
            entityId: parseEntityId(session.entityId),
          },
          true,
        );

        return;
      }

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
    clearResults,
  ]);

  const onSearch = async () => {
    const trimmedPrompt = promptInput.trim();
    const validationError = validateQuery(trimmedPrompt);

    if (validationError) {
      setPageError(validationError);
      return;
    }

    const version = ++promptVersionRef.current;

    setPageError("");
    setHasAttemptedSearch(true);

    const resolved = await resolvePrompt({
      prompt: trimmedPrompt,
      useAi: USE_AI_PROMPT_RESOLVER,
    });

    if (version !== promptVersionRef.current || !resolved) {
      return;
    }

    clearPendingPrompt();

    const nextSession: SearchSession = {
      source: "prompt",
      rawPrompt: trimmedPrompt,
      resolvedQuery: resolved.query,
      resolvedWindowHours: resolved.window_parsed
        ? resolved.window_hours
        : windowHours,
      // A new prompt must not inherit the previously selected entity.
      entityId: null,
    };

    await executeResolvedSearch(nextSession);
  };

  const onWindowTimeChange = (nextWindow: number) => {
    const normalizedWindow = sanitizeWindow(String(nextWindow));

    if (normalizedWindow === windowHours) {
      return;
    }

    promptVersionRef.current += 1;
    setWindowHours(normalizedWindow);

    if (!activeQuery) {
      return;
    }

    setHasAttemptedSearch(true);

    const nextSession: SearchSession = {
      source: resolvedSession?.source ?? "keyword",
      rawPrompt: resolvedSession?.rawPrompt ?? null,
      resolvedQuery: activeQuery,
      resolvedWindowHours: normalizedWindow,
      // Changing the window preserves the active entity.
      entityId: parseEntityId(resolvedSession?.entityId),
    };

    void executeResolvedSearch(nextSession);
  };

  const onPromptInputChange = (value: string) => {
    // Editing the draft does not change the displayed query or entity.
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

  const entityId = parseEntityId(resolvedSession?.entityId);

  const selectedEntity: SelectedEntity | null =
    entityId !== null
      ? {
          id: entityId,
          name: activeQuery,
        }
      : null;

  return {
    activeQuery,
    selectedEntity,
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