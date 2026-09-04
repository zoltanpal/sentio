import { useCallback, useEffect, useState } from "react";
import { buildSentioApiUrl, getSentioApiHeaders } from "@/config/api";
import { useAuth } from "@/auth/AuthContext";

import Header from "@/components/layout/Header";
import StatisticsComponent from "@/components/statistics/Statistics";
import type { GlobalStatsData } from "@/components/statistics/GlobalStats";
import type { SentimentStatsData } from "@/components/statistics/SentimentStats";
import type { EntityStatsData } from "@/components/statistics/EntityStats";
import type { ClusteringStatsData } from "@/components/statistics/ClusteringStats";
import { Separator } from "@/components/shared/ui/separator";


const API_HOST = buildSentioApiUrl("/health");

export default function Statistics() {
  const { isAuthenticated } = useAuth();

  const [globalStatsData, setGlobalStatsData] = useState<GlobalStatsData | null>(null);
  const [sentimentStatsData, setSentimentStatsData] = useState<SentimentStatsData | null>(null);
  const [entityStatsData, setEntityStatsData] = useState<EntityStatsData | null>(null);
  const [clusteringStatsData, setClusteringStatsData] = useState<ClusteringStatsData | null>(null);

  async function fetchData<T>(stat: string = ""): Promise<T> {
    const response = await fetch(`${API_HOST}/${stat}`, {
      headers: getSentioApiHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch global check: ${response.statusText}`);
    }
    return response.json();
  }

  const reloadData = useCallback(async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const [global, sentiment, entity, clustering] = await Promise.all([
        fetchData<GlobalStatsData>(),
        fetchData<SentimentStatsData>("sentiment"),
        fetchData<EntityStatsData>("entity"),
        fetchData<ClusteringStatsData>("clustering"),
      ]);

      setGlobalStatsData(global);
      setSentimentStatsData(sentiment);
      setEntityStatsData(entity);
      setClusteringStatsData(clustering);
      // console.log("data is loaded");
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void reloadData();
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [reloadData]);


  return (
    <div className="mx-auto w-full">
      <section className="mx-auto max-w-7xl px-2 py-3">
        <Header />
        <Separator className="my-2" />
        <StatisticsComponent
          globalStatsData={globalStatsData} 
          sentimentStatsData={sentimentStatsData} 
          entityStatsData={entityStatsData}
          clusteringStatsData={clusteringStatsData}
          onReload={reloadData}
        />
      </section>
    </div>
  );
}
