import { useState, type FormEvent } from "react";
import { LockKeyhole, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/shared/ui/button";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shared/ui/tabs"

import GlobalStatsComponent from "@/components/statistics/GlobalStats";
import type { GlobalStatsData } from "@/components/statistics/GlobalStats";
import SentimentStatsComponent from "@/components/statistics/SentimentStats";
import type { SentimentStatsData } from "@/components/statistics/SentimentStats";
import EntityStatsComponent from "@/components/statistics/EntityStats";
import type { EntityStatsData } from "@/components/statistics/EntityStats";
import ClusteringStatsComponent from "@/components/statistics/ClusteringStats";
import type { ClusteringStatsData } from "@/components/statistics/ClusteringStats";


type StatisticsComponentProps = {
  globalStatsData: GlobalStatsData | null;
  sentimentStatsData: SentimentStatsData | null;
  entityStatsData: EntityStatsData | null;
  clusteringStatsData: ClusteringStatsData | null;
  onReload: () => Promise<void>;
};

const tabs = ["overview", "sentiment", "entity", "clustering"] as const;
type StatisticsTab = (typeof tabs)[number];

export default function StatisticsComponent({
  globalStatsData,
  sentimentStatsData,
  entityStatsData,
  clusteringStatsData,
  onReload,
}: StatisticsComponentProps) {

  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isReloading, setIsReloading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const tab: StatisticsTab = tabs.includes(requestedTab as StatisticsTab)
    ? (requestedTab as StatisticsTab)
    : "overview";

  function onTabChange(nextTab: string) {
    if (!tabs.includes(nextTab as StatisticsTab)) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("tab", nextTab);
    setSearchParams(nextSearchParams);
  }

  async function handleReload() {
    setIsReloading(true);
    try {
      await onReload();
    } finally {
      setIsReloading(false);
    }
  }


  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (login(username, password)) {
      setError("");
      return;
    }

    setError("The username or password is incorrect.");
  }

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex min-h-[28rem] max-w-7xl items-center justify-center px-4 py-8">
        <div
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="statistics-login-title"
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <LockKeyhole className="size-5" aria-hidden="true" />
          </div>
          <h1 id="statistics-login-title" className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            Statistics access
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Enter your credentials to view statistics.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="statistics-username">Username</Label>
              <Input
                id="statistics-username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statistics-password">Password</Label>
              <Input
                id="statistics-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full">View statistics</Button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-3">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-heading md:text-3xl lg:text-4xl">Statistics</h1>
        <Button type="button" variant="outline" onClick={handleReload} disabled={isReloading}>
          <RefreshCw className={isReloading ? "animate-spin" : ""} aria-hidden="true" />
          {isReloading ? "Reloading..." : "Reload data"}
        </Button>
      </div>
      <Tabs defaultValue="overview" value={tab} onValueChange={onTabChange}>
        <TabsList variant="line" className="text-2lg mb-4 border-b border-slate-200 text-slate-500">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analytics</TabsTrigger>
          <TabsTrigger value="entity">Entity Analytics</TabsTrigger>
          <TabsTrigger value="clustering">Clustering Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GlobalStatsComponent data={globalStatsData} />
        </TabsContent>
        <TabsContent value="sentiment">
          <SentimentStatsComponent data={sentimentStatsData} />
        </TabsContent>
        <TabsContent value="entity">
          <EntityStatsComponent data={entityStatsData} />
        </TabsContent>
        <TabsContent value="clustering">
          <ClusteringStatsComponent data={clusteringStatsData} />
        </TabsContent>

      </Tabs>  
    </div>

  );
}
