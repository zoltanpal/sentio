import { useCallback, useState } from "react";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";

const API_HOST = buildSentioApiUrl("/live/parse_prompt");

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
  { prompt, useAi = true }: ResolveParams
): Promise<PromptResolveResponse> {
  const headers = getSentioApiHeaders({
    "Content-Type": "application/json",
  });

  const response = await fetch(API_HOST, {
    method: "POST",
    headers,
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

  const run = useCallback(async ({ prompt, useAi = true }: ResolveParams) => {
    const cleanedPrompt = prompt.trim();

    if (!cleanedPrompt) {
      setState({
        loading: false,
        error: "Please provide a search input.",
      });
      return;
    }

    setState({
      loading: true,
      error: "",
    });

    try {
      const data = await resolvePrompt({
        prompt: cleanedPrompt,
        useAi,
      });

      setState({
        loading: false,
        error: "",
      });

      return data;
    } catch (err) {
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
