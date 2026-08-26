import { Button } from "@/components/shared/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shared/ui/card";

type Entity = {
  name?: string;
  entity_text?: string;
  type?: string;
  entity_type?: string;
  count?: number;
  article_count?: number;
};

type NormalizedEntity = {
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

function colorForType(type?: string): string {
  return TYPE_COLORS[type?.toUpperCase() ?? ""] ?? DEFAULT_COLOR;
}

export default function TopEntities({
  data,
  onSelect,
  windowHours,
  variant = "card",
}: Props) {
  const entities = (data ?? []).map((item): NormalizedEntity => ({
    // Support both the current API shape and older cached responses.
    name: item.name ?? item.entity_text ?? "Unnamed entity",
    type: item.type ?? item.entity_type ?? "",
    count: item.count ?? item.article_count ?? 0,
  }));

  if (!entities.length) {
    return null;
  }

  const entityButtons = (
    <div className="flex flex-wrap gap-2">
      {entities.map((item) => (
        <Button
          key={`${item.type}-${item.name}`}
          variant="outline"
          size="sm"
          onClick={() => onSelect?.(item)}
          className={cn(
            "h-auto rounded-lg px-3 py-1.5 shadow-none",
            "transition-colors hover:brightness-95",
            colorForType(item.type),
          )}
        >
          <span className="font-medium">{item.name}</span>
          <span className="ml-1 text-xs opacity-60">{item.count}</span>
        </Button>
      ))}
    </div>
  );

  if (variant === "inline") {
    return (
      <Card className="mt-5 gap-3 border-slate-200 py-0 shadow-sm">
        <CardHeader className="px-5 pt-4 sm:px-6">
          <CardTitle className="text-base text-slate-900">Most mentioned</CardTitle>
          <CardDescription>Entities mentioned in the last {windowHours ?? 24} hours</CardDescription>
        </CardHeader>
        <CardContent className="px-5 pb-5 sm:px-6">
          {entityButtons}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-3 border-slate-200 py-0 shadow-sm">
      <CardHeader className="px-5 pt-4 sm:px-6">
        <CardTitle className="text-lg text-slate-900">Key entities</CardTitle>
        <CardDescription>
          Most mentioned in the selected period
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6">
        {entityButtons}
      </CardContent>


    </Card>
  );
}
