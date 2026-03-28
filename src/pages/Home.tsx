import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SearchBar from "@/components/Searchbar";

export default function Dashboard() {
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
    navigate(
      `/results?query=${encodeURIComponent(trimmedQuery)}&window=6`
    );
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">Sentio</h1>
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl mt-10">
          Understand the news in real time
        </h1>

        <p className="mt-10 text-lg text-gray-600">
          Track sentiment, trends, and narrative shifts across global news.
        </p>

        <div className="mt-20 items-center justify-center gap-4 sm:flex">
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