import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/ui/card";

type ChangeCardProps = {
  query: string;
  delta: number;
  direction: "improving" | "worsening" | "stable";
  windowHours: number;
  articleCount: number;
};

export function ChangeCard({
  query,
  delta,
  direction,
  windowHours,
  articleCount,
}: ChangeCardProps) {

  const isUp = direction === "improving";
  const isDown = direction === "worsening";

  const arrow = isUp ? "↑" : isDown ? "↓" : "→";

  const color = isUp
    ? "text-green-600"
    : isDown
    ? "text-red-600"
    : "text-gray-500";

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">
          ⚠️ {query} sentiment {direction}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Change info */}
        <div className={`text-sm font-medium ${color}`}>
          {arrow} {delta.toFixed(2)} in last {windowHours} hours
        </div>

        <div className="text-xs text-gray-500">
          {articleCount} articles
        </div>

      </CardContent>
    </Card>
  );
}