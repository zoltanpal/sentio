import { SearchIcon } from "lucide-react";

import { Button } from "@/components/shared/ui/button";

import { cn } from "@/lib/utils";

type Entity = {
  id: number;
  name: string;
  type: string;
  article_count: number;
};

type NormalizedEntity = {
  id: number;
  name: string;
  type: string;
  count: number;
};

type Props = {
  data?: Entity[] | null;
  onSelect?: (entity: NormalizedEntity) => void;
  windowHours?: number;
  variant?: "card" | "inline";
};

const TYPE_COLORS: Record<string, string> = {
  PERSON:
    "border-blue-200/80 bg-blue-50/80 text-blue-700 hover:bg-blue-100/80",
  COMPANY:
    "border-violet-200/80 bg-violet-50/70 text-violet-700 hover:bg-violet-100/70",
  MARKET_INDEX:
    "border-cyan-200/80 bg-cyan-50/70 text-cyan-700 hover:bg-cyan-100/70",
  EVENT:
    "border-amber-200/80 bg-amber-50/70 text-amber-700 hover:bg-amber-100/70",
  CRYPTO:
    "border-rose-200/80 bg-rose-50/70 text-rose-700 hover:bg-rose-100/70",
};

const DEFAULT_COLOR =
  "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

function colorForType(type?: string): string {
  return TYPE_COLORS[type?.toUpperCase() ?? ""] ?? DEFAULT_COLOR;
}

export default function TopEntitiesSimple({
  data,
  onSelect
}: Props) {
  const entities = (data ?? []).map(
    (item): NormalizedEntity => ({
      id: item.id?? item.id ?? null,
      name: item.name ?? item.name ?? "Unnamed entity",
      type: item.type ?? item.type ?? "",
      count: item.article_count ?? item.article_count ?? 0,
    })
  );

  if (!entities.length) {
    return null;
  }

  return (

    <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">        {entities.map((item) => (
          <Button
              key={`${item.type}-${item.name}`}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSelect?.(item)}
              aria-label={`Search for ${item.name}, mentioned in ${item.count} articles`}
              title={`Search for ${item.name}`}
              className={cn(
                  "h-9 shrink-0 snap-start rounded-xl px-3 shadow-none",
                  "gap-1.5 transition-colors focus-visible:ring-blue-500",
                  colorForType(item.type)
              )}
          >
              <span className="font-semibold">{item.name}</span>
              <span className="text-xs tabular-nums opacity-65">
              {item.count}
              </span>
              <SearchIcon className="ml-0.5 h-3.5 w-3.5 opacity-55" />
          </Button>
      ))}
    </div>

  );
}
