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
      <div className="w-full max-w-5xl text-center">
        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">Sentio</h1>

        <h2 className="mt-8 text-2xl font-bold tracking-tight sm:mt-10 sm:text-4xl md:text-5xl">
          Understand the news in real time
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-base text-gray-600 sm:text-lg">
          Track sentiment, trends, and narrative shifts across global news.
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