import { useCallback } from "react";

const SESSION_KEY = "live-search-session";
const PENDING_PROMPT_KEY = "live-pending-prompt";

export type SearchSource = "prompt" | "keyword";

export type SearchSession = {
  source: SearchSource;
  rawPrompt: string | null;
  resolvedQuery: string;
  resolvedWindowHours: number | null;
};

export function useSearchSession() {
  const getSession = useCallback((): SearchSession | null => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SearchSession;
    } catch {
      return null;
    }
  }, []);

  const setSession = useCallback((value: SearchSession) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
    } catch {
      // Ignore storage write failures and keep the flow functional in restricted environments.
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore storage write failures and keep the flow functional in restricted environments.
    }
  }, []);

  const getPendingPrompt = useCallback((): string => {
    return sessionStorage.getItem(PENDING_PROMPT_KEY) ?? "";
  }, []);

  const setPendingPrompt = useCallback((prompt: string) => {
    try {
      sessionStorage.setItem(PENDING_PROMPT_KEY, prompt);
    } catch {
      // Ignore storage write failures and keep the flow functional in restricted environments.
    }
  }, []);

  const clearPendingPrompt = useCallback(() => {
    try {
      sessionStorage.removeItem(PENDING_PROMPT_KEY);
    } catch {
      // Ignore storage write failures and keep the flow functional in restricted environments.
    }
  }, []);

  return {
    getSession,
    setSession,
    clearSession,
    getPendingPrompt,
    setPendingPrompt,
    clearPendingPrompt,
  };
}
