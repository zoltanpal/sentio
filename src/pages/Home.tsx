import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "@/components/Searchbar";

export default function Home() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const onSearch = () => {
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
    navigate(`/results?query=${encodeURIComponent(trimmedQuery)}&window=6`);
  };

  return (
    <div className="flex flex-col items-center px-4 py-10 sm:py-14">
      <div className="w-full max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          <img src="/logo.png" alt="Sentio Logo" className="w-14 sm:w-20 md:w-26" />
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Sentio
          </h1>
        </div>

        <p className="mt-8 text-3xl font-bold tracking-tight text-gray-700 sm:text-4xl">
          Turn news into signal, not noise.
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
          See how sentiment is shifting on any topic — across global news — right now.
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