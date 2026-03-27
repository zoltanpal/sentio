import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SearchBar from "@/components/Searchbar";
import Loading from "@/components/elements/Loading";
import WindowHoursSelector from "@/components/elements/WindowHoursSelector";
import { useLiveAnalysis } from "@/hooks/useLiveAnalysis";

const sentimentLabelMap: Record<string, string> = {
  positive: "Positive",
  negative: "Negative",
  neutral: "Neutral",
  mostly_positive: "Mostly Positive",
  mostly_negative: "Mostly Negative",
  mixed: "Mixed",
};

const ALLOWED_WINDOWS = [6, 12, 24, 48, 72];
const AI_SUMMARY = false;


function sanitizeWindow(value: string | null): number {
  const parsed = Number(value);
  return ALLOWED_WINDOWS.includes(parsed) ? parsed : 6;
}

function sanitizeQuery(value: string | null): string {
  const trimmed = (value ?? "").trim();
  return trimmed.length >= 3 ? trimmed : "";
}



export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("query") ?? "";
  const initialWindow = Number(searchParams.get("window") ?? "6");
  const safeInitialWindow = Number.isNaN(initialWindow) ? 6 : initialWindow;

  const [query, setQuery] = useState(initialQuery);
  const [windowHours, setWindowHours] = useState(safeInitialWindow);

  const { results, loading, error, run, setError } = useLiveAnalysis();

  const onSearch = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter at least one keyword.");
      return;
    }

    if (trimmedQuery.length < 3) {
      setError("Please enter at least 3 characters.");
      return;
    }

    setError("");

    setSearchParams({
      query: trimmedQuery,
      window: windowHours.toString(),
    });

    await run({
      query: trimmedQuery,
      windowHours,
      aiSummary: AI_SUMMARY,
    });
  };


  useEffect(() => {
    const rawQuery = searchParams.get("query");
    const rawWindow = searchParams.get("window");

    const queryFromUrl = sanitizeQuery(rawQuery);
    const safeWindow = sanitizeWindow(rawWindow);

    if (!queryFromUrl) {
      if (rawQuery !== null) {
        // console.warn("Invalid query parameter. Ignoring.");
        setError("Please provide a valid search query (min. 3 characters).");
      }
      return;
    }


    if (rawWindow !== null && Number(rawWindow) !== safeWindow) {
      setError("Invalid time window. Using default value (6h).");
    }

    setQuery(queryFromUrl);
    setWindowHours(safeWindow);

    run({
      query: queryFromUrl,
      windowHours: safeWindow,
      aiSummary: AI_SUMMARY,
    });
  }, []);


  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-3">
      <a href="/" className="text-blue-500 hover:underline mb-5 inline-block">
        &larr; Back to Home
      </a>
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="w-full">
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              if (error) setError("");
            }}
            onSearch={onSearch}
            loading={loading}
            error={error}
            placeholder="e.g. Tesla, NVDA, oil prices"
            size="md"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="text-lg text-muted-foreground">
            Time window
          </div>

          <WindowHoursSelector
            value={windowHours}
            onChange={setWindowHours}
          />
        </div>
      </div>

      {loading ? (
        <Loading text="Analyzing feeds, please wait..." />
      ) : results.aggregated || results.headlines || results.sentimentChange ? (
        <div className="space-y-8">
          {results.aggregated?.summary?.label ? (
            <div>
              <h1 className="text-3xl font-bold">
                {sentimentLabelMap[results.aggregated.summary.label] ??
                  results.aggregated.summary.label}<br />
                  Sentiment change:
                  {results.sentimentChange?.change.direction} : {results.sentimentChange?.change.delta * 100}%
              </h1>

              {results.headlines?.ai_summary ? (
                <div>
                  <h2>AI Summary</h2>
                  <p className="mt-2 mb-3 text-body">
                    {results.headlines.ai_summary}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <section>
            <h2 className="mb-3 text-xl font-semibold">Aggregated Results</h2>
            <div className="overflow-x-auto rounded-xl border bg-muted/20 p-4">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(results.aggregated, null, 2)}
              </pre>
            </div>
          </section>

          <div>
            <h2 className="mb-3 text-xl font-semibold">Latest Headlines</h2>
            <div className="">
              <table className="w-full text-sm text-left rtl:text-right text-body">
                <tbody>
                  {results.headlines.headlines?.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className="bg-neutral-primary-soft hover:bg-neutral-secondary-medium"
                    >
                      <td className="px-6 py-4">
                          {item.title}
                      </td>
                      <td className="px-6 py-4">{item.source_name}</td>
                      <td className="px-6 py-4">
                        {new Date(item.published_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {sentimentLabelMap[item.sentiment_label] ?? item.sentiment_label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(results.headlines, null, 2)}
              </pre>
            </div>
          </div>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Sentiment Change</h2>
            <div className="overflow-x-auto rounded-xl border bg-muted/20 p-4">
              <pre className="whitespace-pre-wrap text-sm">
                {JSON.stringify(results.sentimentChange, null, 2)}
              </pre>
            </div>
          </section>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-muted-foreground">
          Search for a topic to see live sentiment analysis results.
        </div>
      )}
    </div>
  );
}