import { ScrollArea } from "@/components/shared/ui/scroll-area";
import { cn, formatTimeAgo } from "@/lib/utils";

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
    bar: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  neutral: {
    bar: "bg-amber-400",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  negative: {
    bar: "bg-red-500",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
  unknown: {
    bar: "bg-slate-300",
    badge: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

function HeadlineRow({ item }: { item: Headline }) {
  const sentimentLabel = item.sentiment_label ?? "unknown";
  const style = sentimentStyles[sentimentLabel];

  return (
    <article className="group relative flex min-w-0 items-start gap-3 px-4 py-4 transition-colors hover:bg-blue-50/35 sm:items-center sm:gap-4 sm:px-6">
      <span
        className={cn(
          "absolute bottom-4 left-0 top-4 w-1 rounded-r-full",
          style.bar
        )}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-xs">
          <span className="max-w-full truncate">{item.source_name}</span>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <time
            className="whitespace-nowrap font-normal normal-case tracking-normal"
            dateTime={item.published_at}
          >
            {formatTimeAgo(item.published_at)}
          </time>
        </div>

        <h3
          className="mt-1.5 line-clamp-3 text-sm font-semibold leading-5 text-slate-900 sm:line-clamp-2 sm:text-[0.95rem] sm:leading-6"
          title={item.summary ?? item.title}
        >
          {item.title}
        </h3>

        <span
          className={cn(
            "mt-2 inline-flex h-7 items-center justify-center rounded-full border px-3 text-xs font-semibold capitalize sm:hidden",
            style.badge
          )}
        >
          {sentimentLabel}
        </span>
      </div>

      <span
        className={cn(
          "hidden h-8 min-w-24 shrink-0 items-center justify-center rounded-full border px-3 text-sm font-medium capitalize sm:inline-flex",
          style.badge
        )}
      >
        {sentimentLabel}
      </span>
    </article>
  );
}

export default function HeadlinesTable({ items }: { items: Headline[] }) {
  if (!items.length) {
    return (
      <p className="px-6 py-10 text-center text-sm text-slate-500">
        No headlines are available for this period.
      </p>
    );
  }

  return (
    <ScrollArea className="h-[360px] sm:h-[400px] lg:h-[360px]">
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <HeadlineRow key={item.id} item={item} />
        ))}
      </div>
    </ScrollArea>
  );
}
