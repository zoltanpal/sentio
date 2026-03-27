type WindowHoursSelectorProps = {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
};

const defaultOptions = [6, 12, 24, 48, 72];

export default function WindowHoursSelector({
  value,
  onChange,
  options = defaultOptions,
}: WindowHoursSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* <span className="text-sm text-muted-foreground mr-1">Time window</span> */}

      {options.map((hours) => {
        const isActive = value === hours;

        return (
          <button
            key={hours}
            type="button"
            onClick={() => onChange(hours)}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition border",
              isActive
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
            ].join(" ")}
          >
            {hours}h
          </button>
        );
      })}
    </div>
  );
}