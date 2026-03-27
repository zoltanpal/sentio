import { useState } from "react";

const API_HOST = "https://devapi.palzoltan.net/sentiment_analyzer/live";
// const API_TOKEN = import.meta.env.VITE_API_TOKEN;
const API_TOKEN = "testtoken";

type LiveAnalysisResults = {
  aggregated: any | null;
  headlines: any | null;
  sentimentChange: any | null;
};

type RunParams = {
  query: string;
  windowHours: number;
  aiSummary?: boolean;
};

const EMPTY_RESULTS: LiveAnalysisResults = {
  aggregated: null,
  headlines: null,
  sentimentChange: null,
};

export function useLiveAnalysis() {
  const [results, setResults] = useState<LiveAnalysisResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const buildUrl = ({
    endpoint,
    query,
    windowHours,
    aiSummary = true,
  }: {
    endpoint: string;
    query: string;
    windowHours: number;
    aiSummary?: boolean;
  }) => {
    const params = new URLSearchParams({
      query: query.trim().toLowerCase(),
      window_hours: windowHours.toString(),
      ai_summary: String(aiSummary),
    });

    return `${API_HOST}/${endpoint}?${params.toString()}`;
  };

  const fetchData = async ({
    endpoint,
    query,
    windowHours,
    aiSummary = true,
  }: {
    endpoint: string;
    query: string;
    windowHours: number;
    aiSummary?: boolean;
  }) => {
    const response = await fetch(
      buildUrl({ endpoint, query, windowHours, aiSummary }),
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`${endpoint} failed with status ${response.status}`);
    }

    return response.json();
  };

  const clearResults = () => {
    setResults(EMPTY_RESULTS);
  };

  const run = async ({
    query,
    windowHours,
    aiSummary = true,
  }: RunParams) => {
    if (!query.trim()) {
      setError("Please provide a search input.");
      clearResults();
      return;
    }

    setError("");
    setLoading(true);

    try {
      const [aggregated, headlines, sentimentChange] = await Promise.all([
        fetchData({
          endpoint: "analyze",
          query,
          windowHours,
          aiSummary,
        }),
        fetchData({
          endpoint: "headlines",
          query,
          windowHours,
          aiSummary,
        }),
        fetchData({
          endpoint: "sentiment_change",
          query,
          windowHours,
          aiSummary,
        }),
      ]);

      setResults({
        aggregated,
        headlines,
        sentimentChange,
      });
    } catch (err) {
      console.error("Error fetching live analysis:", err);
      clearResults();
      setError("Something went wrong while fetching the analysis.");
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    run,
    clearResults,
    setError,
  };
}