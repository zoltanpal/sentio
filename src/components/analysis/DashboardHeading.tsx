type Props = {
  query: string;
  windowHours: number;
};

function formatWindow(windowHours: number): string {
  if (windowHours > 24 && windowHours % 24 === 0) {
    return `${windowHours / 24}d`;
  }

  return `${windowHours}h`;
}

export default function DashboardHeading({
  query,
  windowHours,
}: Props) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {query}
        </h1>

        <span className="text-xl font-medium text-foreground/80 sm:text-2xl">
          — last {formatWindow(windowHours)}
        </span>
      </div>

      <p className="mt-1 text-lg text-muted-foreground">
        What changed?
      </p>
    </div>
  );
}