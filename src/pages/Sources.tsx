import { useCallback, useEffect, useState } from "react";

import Header from "@/components/layout/Header";
import { Separator } from "@/components/shared/ui/separator";
// import { dummySources } from "@/constants/constants";


const API_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN;
const SOURCES_URL = `${import.meta.env.VITE_API_BASE_URL}/detailed_sources`;

type Source = {
  name: string;
  site_url: string;
  category: string;
  current_article_count: number;
};

export default function Sources() {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [sources, setSources] = useState<Source[]>([]);

    const fetchSources = useCallback(async () => {
        setLoading(true);
        try {
          const response = await fetch(SOURCES_URL, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
          });
          const result: unknown = await response.json();
          setSources(Array.isArray(result) ? result as Source[] : []);
        } catch (err) {
          console.error("Error fetching feeds:", err);
        } finally {
          setLoading(false);
        }
    }, []);

    useEffect(() => {
      void fetchSources();
    }, [fetchSources]);

    const filteredSources =
        query.length >= 3
            ? sources.filter((source) =>
                source.name.toLowerCase().includes(query.toLowerCase())
            )
            : sources;


  return (
    <div className="mx-auto w-full">
      <section className="mx-auto max-w-7xl px-2 py-3">
        <Header />

        <Separator className="my-2" />
      <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Data Sources
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Sentio analyzes publicly available news from a range of global sources.
          </p>
        </div>
        <div className="my-3 text-right">
            <input
                type="text"
                placeholder="Search sources..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className=" max-w-md bg-white rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200"
            />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? <p className="text-sm text-slate-500">Loading sources…</p> : null}
            {filteredSources.map((source) => (
                <a  key={source.name} href={source.site_url} target="_blank" rel="noopener noreferrer" 
                    className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-300 bg-white">
                    <h2 className="text-lg font-semibold text-gray-900">{source.name}</h2>
                    <p className="mt-1 text-sm text-gray-600">Category: {source.category}</p>
                    <p className="mt-1 text-sm text-gray-600">Articles Analyzed: {source.current_article_count}</p>
                </a>
            ))}
        </div>

        </section>
    </div>
  );
}
