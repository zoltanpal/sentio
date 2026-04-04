import { Card, CardHeader, CardTitle, CardContent } from "@/components/shared/ui/card";

type ChangeCardProps = {
  query: string;
  delta: number;
  direction: "improving" | "worsening" | "stable";
  windowHours: number;
  articleCount: number;
  drivers?: {
    is_meaningful: boolean;
    headlines: { title: string }[];
  } | null;
};

export function ChangeCard({
  query,
  delta,
  direction,
  windowHours,
  articleCount,
  drivers,
}: ChangeCardProps) {
  if (!drivers?.is_meaningful) return null;

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

        {/* Drivers */}
        {drivers.headlines.length > 0 && (
          <div className="pt-2">
            <p className="text-sm font-medium mb-1">Driven by:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {drivers.headlines.slice(0, 3).map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span>•</span>
                  <span className="line-clamp-2">{h.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}