import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";

type Entity = {
  entity_text: string;
  entity_type: string;
  article_count: number;
};

type Props = {
  data: Entity[];
  windowHours: number;
  onSelect?: (entity: Entity) => void;
};

const TYPE_COLORS: Record<string, string> = {
  PERSON:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300",
  COMPANY:
    "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-300",
  MARKET_INDEX:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300",
  EVENT:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300",
  CRYPTO:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300",
};

const DEFAULT_COLOR =
  "border-border bg-muted/40 text-muted-foreground";

function colorForType(type: string): string {
  return TYPE_COLORS[type.toUpperCase()] ?? DEFAULT_COLOR;
}

export default function TopEntities({ data, windowHours, onSelect }: Props) {
  if (!data.length) {
    return null;
  }

  return (
    <section>
        <div className="mb-3">
        <h2 className="text-lg font-semibold">Key Entities</h2>
        <p className="text-sm text-muted-foreground">
            Most mentioned in the selected period
        </p>
        </div>

      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
        <Button
            key={`${item.entity_type}-${item.entity_text}`}
            variant="outline"
            size="sm"
            onClick={() => onSelect?.(item)}
            className={cn(
                "h-auto rounded-lg px-3 py-1.5 shadow-none",
                "transition-colors hover:brightness-95",
                colorForType(item.entity_type),
            )}
            >
            <span className="font-medium">
                {item.entity_text}
            </span>

            <span className="ml-1 text-xs opacity-60">
                {item.article_count}
            </span>
        </Button>
        ))}
      </div>
    </section>
  );
}