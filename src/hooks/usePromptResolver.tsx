import { useCallback, useEffect, useRef, useState } from "react";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";

const API_HOST = buildSentioApiUrl("/parse_prompt");

export type Intent =
  | "summary"
  | "reason"
  | "trend"
  | "comparison"
  | "unknown";

export type PromptResolveResponse = {
  prompt: string;
  query: string;
  window_hours: number;
  intent?: Intent;
};

type ResolveParams = {
  prompt: string;
  useAi?: boolean;
};

type UsePromptResolverState = {
  loading: boolean;
  error: string;
};

const EMPTY_STATE: UsePromptResolverState = {
  loading: false,
  error: "",
};

async function resolvePrompt(
  { prompt, useAi = true }: ResolveParams,
  signal?: AbortSignal
): Promise<PromptResolveResponse> {
  const headers = getSentioApiHeaders({
    "Content-Type": "application/json",
  });

  const response = await fetch(API_HOST, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({
      prompt: prompt.trim(),
      use_ai: useAi,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Prompt resolve failed with status ${response.status}`);
  }

  return response.json();
}

export function usePromptResolver() {
  const [state, setState] = useState<UsePromptResolverState>(EMPTY_STATE);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const run = useCallback(async ({ prompt, useAi = true }: ResolveParams) => {
    const cleanedPrompt = prompt.trim();

    if (!cleanedPrompt) {
      setState({
        loading: false,
        error: "Please provide a search input.",
      });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({
      loading: true,
      error: "",
    });

    try {
      const data = await resolvePrompt({
        prompt: cleanedPrompt,
        useAi,
      }, controller.signal);

      if (abortRef.current !== controller) {
        return;
      }

      setState({
        loading: false,
        error: "",
      });

      return data;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      console.error("Error resolving prompt:", err);

      setState({
        loading: false,
        error: "Something went wrong while interpreting the prompt.",
      });
    }
  }, []);

  return {
    loading: state.loading,
    error: state.error,
    run,
  };
}
