import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BotIcon, NewspaperIcon } from "lucide-react";

import SearchBar from "@/components/Searchbar";
import Loading from "@/components/elements/Loading";
import WindowHoursSelector from "@/components/elements/WindowHoursSelector";
import HeadlinesTable from "@/components/HeadlinesTable";
import SentimentDoughnut from "@/components/elements/SentimentDoughnut";
import ExpandableText from "@/components/elements/ExpandableText";
import SentimentChangeCard from "@/components/elements/SentimentChangeCard";

import { Badge } from "@/components/ui/badge";
// import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";


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
const DEFAULT_WINDOW = 6;
const USE_AI = false;

function sanitizeWindow(value: string | null): number {
  const parsed = Number(value);
  return ALLOWED_WINDOWS.includes(parsed) ? parsed : DEFAULT_WINDOW;
}

function sanitizeQuery(value: string | null): string {
  return (value ?? "").trim();
}

function validateQuery(query: string): string {
  const trimmed = query.trim();

  if (!trimmed) {
    return "Please enter at least one keyword.";
  }

  if (trimmed.length < 3) {
    return "Please enter at least 3 characters.";
  }

  return "";
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryFromUrl = useMemo(
    () => sanitizeQuery(searchParams.get("query")),
    [searchParams]
  );

  const windowFromUrl = useMemo(
    () => sanitizeWindow(searchParams.get("window")),
    [searchParams]
  );

  const [queryInput, setQueryInput] = useState(queryFromUrl);
  const [windowHours, setWindowHours] = useState(windowFromUrl);
  const [pageError, setPageError] = useState("");

  const { data, loading, error, run, clearResults } = useLiveAnalysis();

  useEffect(() => {
    setQueryInput(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    setWindowHours(windowFromUrl);
  }, [windowFromUrl]);

  useEffect(() => {
    const rawQuery = searchParams.get("query");
    const rawWindow = searchParams.get("window");
    const cheatCode = searchParams.get("cheat");

    const safeQuery = sanitizeQuery(rawQuery);
    const safeWindow = sanitizeWindow(rawWindow);

    const validationError = validateQuery(safeQuery);

    if (validationError) {
      if (rawQuery !== null) {
        setPageError(validationError);
      }
      clearResults();
      return;
    }

    if (rawWindow !== null && Number(rawWindow) !== safeWindow) {
      setPageError(`Invalid time window. Using default value (${DEFAULT_WINDOW}h).`);
    } else {
      setPageError("");
    }

    const useAi = cheatCode === "marcopolo" ? true : USE_AI;

    run({
      query: safeQuery,
      windowHours: safeWindow,
      useAi,
      includeHeadlines: true,
      includeChange: true,
    });
  }, [searchParams, run, clearResults]);


  const executeSearch = (nextQuery: string, nextWindow: number) => {
    const validationError = validateQuery(nextQuery);

    if (validationError) {
      setPageError(validationError);
      return;
    }

    setPageError("");

    setSearchParams({
      query: nextQuery.trim(),
      window: String(nextWindow),
    });
  };

  const onSearch = () => {
    executeSearch(queryInput, windowHours);
  };

  const onWindowTimeChange = (nextWindow: number) => {
    if (nextWindow === windowHours) return;

    setWindowHours(nextWindow);
    executeSearch(queryInput, nextWindow);
  };

  const displayError = pageError || error;
  const hasResults = (data?.aggregated.article_count ?? 0) > 0;

  console.log("Live analysis data:", data);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-3">
      <div className="mb-4 flex items-center justify-between px-2">
        <a href="/" className="flex items-center gap-2 sm:gap-4">
          <img
            src="/logo.png"
            alt="Sentio Logo"
            className="w-10 sm:w-14 md:w-16"
          />
          <h1 className="font-bold tracking-tight sm:text-4xl md:text-5xl">
            Sentio
          </h1>
        </a>

        <div className="flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className="">LogIn</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>SignUp</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
          <div className="w-full">
            <SearchBar
              value={queryInput}
              onChange={(value) => {
                setQueryInput(value);
                if (pageError) setPageError("");
              }}
              onSearch={onSearch}
              loading={loading}
              error={displayError}
              placeholder="e.g. Tesla, NVDA, oil prices"
              size="md"
            />
          </div>

          <div className="flex min-w-[220px] flex-col gap-1">
            <span className="text-sm">Time window</span>
            <WindowHoursSelector
              value={windowHours}
              onChange={onWindowTimeChange}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <Loading text="Analyzing feeds, please wait..." />
      ) : hasResults && data ? (
        <div className="space-y-8">
          {data.ai_summary ? (
            <div className="rounded-xl border bg-gradient-to-r from-purple-100 to-teal-100 p-4">
              <div className="mb-2 flex items-center gap-2 text-md font-semibold">
                <BotIcon className="h-4 w-4" />
                <span>Live Summary (last {windowHours} hours)</span>
              </div>
              <ExpandableText text={data.ai_summary} maxLength={200} />
            </div>
          ) : null}

          {data.change ? (
            <div className="flex w-[300px] flex-col">
              <SentimentChangeCard data={data.change} />
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-4 lg:flex-row">
            <div className="w-full lg:w-3/4">
              <Card className="h-[300px] gap-0 bg-gradient-to-r from-pink-30 to-pink-50 py-2 sm:h-[320px]">
                <CardHeader className="m-0 px-5 py-2">
                  <CardTitle className="text-lg">Latest Headlines</CardTitle>
                </CardHeader>
                <CardContent className="m-0 h-[220px] p-0">
                  <HeadlinesTable items={data.headlines} />
                </CardContent>
              </Card>
            </div>

            <div className="w-full lg:w-1/4">
              <Card className="h-[300px] gap-0 bg-gradient-to-r from-pink-50 to-pink-100 py-2 sm:h-[320px]">
                <CardHeader className="px-4 py-2 sm:px-5">
                  <CardTitle className="text-base sm:text-lg">
                    Overall Tone
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 px-2 pb-2 sm:px-3">
                  <div className="relative h-[160px] sm:h-[180px] md:h-[190px]">
                    <SentimentDoughnut
                      distribution={data.aggregated.distribution}
                      summaryLabel={
                        sentimentLabelMap[data.aggregated.summary.label] ??
                        data.aggregated.summary.label
                      }
                    />
                  </div>
                </CardContent>

                <CardFooter className="px-3 py-2">
                  <Badge
                    variant="secondary"
                    className="flex max-w-full items-center gap-1 border-green-200 bg-green-200 px-2 text-[11px] sm:text-xs"
                  >
                    <NewspaperIcon className="h-3.5 w-3.5" />
                    <span>{data.aggregated.article_count} articles</span>
                  </Badge>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center text-muted-foreground">
          No news found for the given query and time window. Please try expanding
          the time window or using different keywords.
        </div>
      )}
    </div>
  );
}