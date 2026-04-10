import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { formatTimeAgo } from "@/lib/utils";

type Headline = {
  id: number;
  source_name: string;
  title: string;
  summary: string | null;
  published_at: string;
  sentiment_label: "positive" | "neutral" | "negative" | null;
};

const sentimentStyles = {
  positive: {
    bar: "bg-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  neutral: {
    bar: "bg-yellow-500",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  negative: {
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
};

const fallbackSentimentStyle = sentimentStyles.neutral;


function HeadlineRow({ item }: { item: Headline }) {
  const style = item.sentiment_label
    ? sentimentStyles[item.sentiment_label]
    : fallbackSentimentStyle;
  const sentimentLabel = item.sentiment_label ?? "unknown";

  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3 transition hover:bg-muted/40">
      <div className="flex min-w-0 items-start gap-4">
        <div className={`mt-1 h-10 w-1.5 shrink-0 rounded ${style.bar}`} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
            <span>{item.source_name}</span>
            <span className="text-border">•</span>
            <span className="whitespace-nowrap normal-case tracking-normal">
              {formatTimeAgo(item.published_at)}
            </span>
          </div>

          <div
            className="mt-1 text-sm font-medium leading-snug text-foreground"
            title={item.summary}
          >
            {item.title}
          </div>
        </div>
      </div>

      <span
        className={`inline-flex h-8 w-24 shrink-0 items-center justify-center rounded-full border text-sm font-medium capitalize ${style.badge}`}
      >
        {sentimentLabel}
      </span>
    </div>
  );
}

export default function HeadlinesTable({ items }: { items: Headline[] }) {
  return (
      <ScrollArea className="h-[240px]">
        <div className="divide-y">
          {items.map((item) => (
            <HeadlineRow key={item.id} item={item} />
          ))}
        </div>
      </ScrollArea>
  );
}
