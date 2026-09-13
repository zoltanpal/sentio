export type SentimentLabel = "positive" | "neutral" | "negative";

export type SummaryLabel =
  | "positive"
  | "negative"
  | "neutral"
  | "mostly_positive"
  | "mostly_negative"
  | "mixed";

export type Intent =
  | "summary"
  | "reason"
  | "trend"
  | "comparison"
  | "unknown";

export type ChangeDirection = "improving" | "worsening" | "stable";

export type DriverHeadline = {
  title: string;
  source: string;
};

export type Drivers = {
  representative_title: string;
  article_count: number;
  headlines: DriverHeadline[];
};

export type CoverageDriver = {
  main_reason: string;
  drivers: Drivers[];
};

export type LiveHeadline = {
  id: number;
  title: string;
  title_hash?: string | null;
  summary: string | null;
  link: string | null;
  published_at: string;
  source_name: string;
  sentiment_label: SentimentLabel | null;
  sentiment_score: number | null;
  sentiment_raw: Record<string, unknown> | string | null;
};

export type LiveQueryResponse = {
  query: string;
  window_hours: number;
  intent?: Intent;
  aggregated: {
    article_count: number;
    avg_sentiment: {
      score: number;
      label: SentimentLabel;
    };
    distribution: {
      positive_count: number;
      neutral_count: number;
      negative_count: number;
      positive_pct: number;
      neutral_pct: number;
      negative_pct: number;
    };
    summary: {
      label: SummaryLabel;
      dominant_label: SentimentLabel;
      dominant_pct: number;
    };
  };
  headlines: LiveHeadline[];
  change?: {
    current: {
      article_count: number;
      avg_sentiment_score: number;
    };
    previous: {
      article_count: number;
      avg_sentiment_score: number;
    };
    delta: number;
    direction: ChangeDirection;
  } | null;
  ai_summary?: string | null;
  sentiment_scores_per_hour: {
    bucket_start: string;
    article_count: number;
    avg_sentiment_score: number | null;
  }[];
  top_entities: {
    name: string;
    type: string;
    count: number;
  }[];
  what_driving?: CoverageDriver;
};
