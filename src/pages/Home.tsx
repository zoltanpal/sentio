import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "@/components/search/SearchBar";
import TopEntitiesSimple from "@/components/analysis/TopEntitiesSimple";
import { validateQuery } from "@/lib/searchParams";
import { useDashboardSearch } from "@/features/dashboard/useDashboardSearch";
import {
  clearPendingPrompt,
  clearSearchSession,
  setPendingPrompt,
} from "@/lib/searchSession";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";

type Entity = {
  id: number;
  name: string;
  type: string;
  article_count: number;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
    const [entityItems, setEntityItems] = useState<Entity[]>([]);
  

  const navigate = useNavigate();

  const {
    onEntitySelect,
  } = useDashboardSearch();

  useEffect(() => {
    clearPendingPrompt();
    clearSearchSession();

    const controller = new AbortController();

    async function fetchTopEntities() {
      try {
        const params = new URLSearchParams({
          time_window: String(24),
        });

        const response = await fetch(
          buildSentioApiUrl(`/top_entities?${params.toString()}`),
          {
            headers: getSentioApiHeaders(),
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Fetching top entities failed: ${response.status}`);
        }

        const entities: Entity[] = await response.json();

        if (!controller.signal.aborted) {
          setEntityItems(entities);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Could not load top entities:", error);
        }
      }
    }

    void fetchTopEntities();

  }, []);

  const onSearch = () => {

    const validationError = validateQuery(query);

    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedPrompt = query.trim();

    setError("");
    setPendingPrompt(trimmedPrompt);
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <img
            src="/logo/sentio_logo.png"
            alt="Sentio Logo"
            className="w-85 sm:w-20 md:w-98"
          />
        </div>

        <p className="mt-4 text-3xl font-bold tracking-tight text-gray-700 sm:text-4xl">
          Turn news into signal, not noise.
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
          See how sentiment is shifting on any topic - across global news - right
          now.
        </p>

        <div className="mx-auto mt-6 w-full max-w-3xl sm:mt-7">
          <SearchBar
            value={query}
            onChange={(value) => {
              setQuery(value);
              if (error) setError("");
            }}
            onSearch={onSearch}
            error={error}
            placeholder="e.g. Tesla, NVDA, oil prices"
            size="lg"
          />
          <p className="mt-4 left text-sm text-gray-300 italic antialiased">
            Try a topic or ask a question - e.g. "What's happening with Tesla today?"<br />
             or start with one of the top topics below.
          </p>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3 sm:gap-4">
            <TopEntitiesSimple
              data={entityItems}
              windowHours={24}
              variant="inline"
              onSelect={(entity) => {
                void onEntitySelect(entity);
              }}
            />
        </div>
      </div>
    </div>
  );
}
