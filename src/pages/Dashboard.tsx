import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SearchBar from "@/components/Searchbar";
import Loading from "@/components/elements/Loading";
import WindowHoursSelector from "@/components/elements/WindowHoursSelector";
import { useLiveAnalysis } from "@/hooks/useLiveAnalysis";
import HeadlinesTable from "@/components/HeadlinesTable";
import SentimentDoughnut from "@/components/elements/SentimentDoughnut";

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BotIcon, NewspaperIcon } from "lucide-react";


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
  const initialWindow = sanitizeWindow(searchParams.get("window"));

  const [query, setQuery] = useState(initialQuery);
  const [windowHours, setWindowHours] = useState(initialWindow);

  const { results, loading, error, run, setError } = useLiveAnalysis();

  const executeSearch = (nextQuery: string, nextWindow: number) => {
    const trimmedQuery = nextQuery.trim();

    if (!trimmedQuery || trimmedQuery.length < 3) {
      setError("Please enter at least 3 characters.");
      return false;
    }

    setError("");

    setSearchParams({
      query: trimmedQuery,
      window: nextWindow.toString(),
    });

    return true;
  };


  const onSearch = async () => {
    executeSearch(query, windowHours);
  };

  const onWindowTimeChange = async (nextWindow: number) => {
    if (nextWindow === windowHours) return;

    setWindowHours(nextWindow);

    executeSearch(query, nextWindow);
  };


  useEffect(() => {
    const rawQuery = searchParams.get("query");
    const rawWindow = searchParams.get("window");
    const cheatCode = searchParams.get("cheat");

    const queryFromUrl = sanitizeQuery(rawQuery);
    const safeWindow = sanitizeWindow(rawWindow);

    if (!queryFromUrl) {
      if (rawQuery !== null) {
        setError("Please provide a valid search query (min. 3 characters).");
      }
      return;
    }

    if (rawWindow !== null && Number(rawWindow) !== safeWindow) {
      setError("Invalid time window. Using default value (6h).");
    } else {
      setError("");
    }

    let ai_summary = AI_SUMMARY;
    if (cheatCode === "marcopolo") {
      ai_summary = true;
    }

    setQuery(queryFromUrl);
    setWindowHours(safeWindow);

    console.log(ai_summary)

    run({
      query: queryFromUrl,
      windowHours: safeWindow,
      aiSummary: AI_SUMMARY,
    });
  }, [searchParams]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-3">
      <a href="/" className="mb-5 inline-block text-blue-500 hover:underline">
        &larr; Back to Home
      </a>

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
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

          <div className="flex min-w-[220px] flex-col gap-1">
            <span className="text-sm text-muted-foreground">Time window</span>

            <WindowHoursSelector
              value={windowHours}
              onChange={onWindowTimeChange}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loading text="Analyzing feeds, please wait..." />
      ) : results.aggregated ? (
        <div className="space-y-8">
          {AI_SUMMARY && results.headlines?.ai_summary ? (
            <div>
              
              <div className="rounded-xl border bg-muted/20 p-4 bg-gradient-to-r from-purple-100 to-teal-100">
                <BotIcon />
                <label className="mb-1 text-md font-semibold">AI Summary (last {windowHours} hours)</label>
                <p>{results.headlines.ai_summary}</p>
              </div>
            </div>
          ) : null}



            <div className="flex flex-col-reverse lg:flex-row gap-4">
              <div className="w-full lg:w-3/4">
                <Card className="py-3 gap-0 h-[300px] sm:h-[320px]">
                  <CardHeader className="px-5 py-2 m-0">
                    <CardTitle className="text-lg">Latest Headlines</CardTitle>
                  </CardHeader>
                  <CardContent className="m-0 p-0 h-[250px]">
                    <HeadlinesTable items={results.headlines?.headlines || []} />
                  </CardContent>
                </Card>
              </div>
              <div className="w-full lg:w-1/4">
                <Card className="h-[300px] sm:h-[320px] py-2 gap-0">
                  <CardHeader className="px-4 sm:px-5 py-2">
                    <CardTitle className="text-base sm:text-lg">Sentiment Overview</CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 px-2 sm:px-3 pb-2">
                    <div className="relative h-[160px] sm:h-[180px] md:h-[190px]">
                      <SentimentDoughnut
                        distribution={results.aggregated.distribution}
                        summaryLabel={sentimentLabelMap[results.aggregated.summary.label]}
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="px-3 py-2">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-[11px] sm:text-xs max-w-full"
                    >
                      <NewspaperIcon className="h-3.5 w-3.5" />
                      <span>{results.aggregated.article_count} articles</span>
                    </Badge>
                  </CardFooter>
                </Card>
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