import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "@/components/search/SearchBar";
import { useSearchSession } from "@/hooks/useSearchSession";
import { validateQuery } from "@/lib/searchParams";

export default function Home() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { clearPendingPrompt, clearSession, setPendingPrompt } =
    useSearchSession();

  useEffect(() => {
    clearPendingPrompt();
    clearSession();
  }, [clearPendingPrompt, clearSession]);

  const onSearch = () => {
    const validationError = validateQuery(query);

    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedPrompt = query.trim();

    setError("");
    setPendingPrompt(trimmedPrompt);
    navigate("/results");
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <img
            src="/logo.png"
            alt="Sentio Logo"
            className="w-14 sm:w-20 md:w-26"
          />
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Sentio
          </h1>
        </div>

        <p className="mt-8 text-3xl font-bold tracking-tight text-gray-700 sm:text-4xl">
          Turn news into signal, not noise.
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
          See how sentiment is shifting on any topic — across global news — right
          now.
        </p>

        <div className="mx-auto mt-8 w-full max-w-3xl sm:mt-10">
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
          <p className="mt-2 left text-sm text-gray-300 italic antialiased">
            Try a topic or ask a question — e.g. “What’s happening with Tesla today?”
          </p>
        </div>
      </div>
    </div>
  );
}
