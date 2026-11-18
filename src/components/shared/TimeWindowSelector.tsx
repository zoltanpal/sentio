import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";

export const TIME_WINDOW_OPTIONS = [6, 12, 24, 48, 72] as const;
export type TimeWindowHours = (typeof TIME_WINDOW_OPTIONS)[number];

type Props = {
  value: number;
  onChange: (hours: TimeWindowHours) => void;
  disabled?: boolean;
};

function formatTimeWindow(hours: number): string {
  if (hours >= 24 && hours % 24 === 0) {
    return `${hours / 24}d`;
  }
  return `${hours}h`;
}

export default function TimeWindowSelector({ value, onChange, disabled = false }: Props) {
  return (
    <div className="shrink-0">
      <div className="sm:hidden">
        <Select
          value={String(value)}
          onValueChange={(selected) => {
            const hours = TIME_WINDOW_OPTIONS.find((option) => String(option) === selected);
            if (hours !== undefined) onChange(hours);
          }}
          disabled={disabled}
        >
          <SelectTrigger
            className="h-10 w-[5.25rem] rounded-xl border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-none focus:ring-2 focus:ring-blue-100"
            aria-label="Time window"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="min-w-[7rem] rounded-xl border-slate-200 p-1">
            {TIME_WINDOW_OPTIONS.map((hours) => (
              <SelectItem
                key={hours}
                value={String(hours)}
                className="h-10 rounded-lg text-sm font-medium"
              >
                {formatTimeWindow(hours)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden sm:block">
        {/* <span className="mb-2 block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-slate-500">
          Time window
        </span> */}
        <div
          className="inline-flex rounded-xl border border-slate-200 bg-white p-1"
          role="group"
          aria-label="Time window"
        >
          {TIME_WINDOW_OPTIONS.map((hours) => {
            const selected = hours === value;

            return (
              <button
                key={hours}
                type="button"
                onClick={() => onChange(hours)}
                disabled={disabled}
                aria-pressed={selected}
                className={`h-8 min-w-11 rounded-sm px-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                  selected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {formatTimeWindow(hours)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
