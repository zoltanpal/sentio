import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "@/components/search/SearchBar";
import { useSearchSession } from "@/hooks/useSearchSession";

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setPendingPrompt } = useSearchSession();

  const onSearch = () => {
    const validationError = validateQuery(query);

    if (validationError) {
      setError(validationError);
      return;
    }

    const trimmedPrompt = query.trim();

    setError("");
    setPendingPrompt(trimmedPrompt);
    navigate("/results?mode=prompt");
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

        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
          See how sentiment is shifting on any topic — across global news — right
          now.
        </p>

        <div className="mx-auto mt-10 w-full max-w-3xl sm:mt-14">
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
        </div>
      </div>
    </div>
  );
}
