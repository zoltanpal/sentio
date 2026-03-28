import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  loading?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  size?: "lg" | "md";
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  loading = false,
  error = "",
  placeholder = "Search...",
  className,
  inputClassName,
  buttonClassName,
  size = "lg",
}: SearchBarProps) {
  const isDisabled = !value.trim() || loading;

  const sizeStyles = {
    lg: {
      wrapper: "rounded-2xl",
      input: "px-4 py-3 text-base sm:px-5 sm:py-4 sm:text-xl md:px-6 md:text-2xl",
      button: "px-4 sm:px-5 md:px-6",
      icon: "h-4 w-4 sm:h-5 sm:w-5",
    },
    md: {
      wrapper: "rounded-xl",
      input: "px-3 py-2 text-sm sm:px-4 sm:py-3 sm:text-base md:text-lg",
      button: "px-3 sm:px-4 md:px-5",
      icon: "h-4 w-4 sm:h-5 sm:w-5",
    },
  };

  const currentSize = sizeStyles[size];

  const handleSearch = () => {
    if (isDisabled) return;
    onSearch();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex overflow-hidden border border-gray-200 bg-white shadow-sm transition focus-within:ring-2 focus-within:ring-gray-300",
          currentSize.wrapper,
          error && "border-red-500 focus-within:ring-red-300"
        )}
      >
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "min-w-0 flex-1 bg-white outline-none placeholder:text-gray-400",
            currentSize.input,
            inputClassName
          )}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={isDisabled}
          className={cn(
            "flex shrink-0 items-center justify-center border-l border-gray-200 bg-blue-100 transition",
            "hover:bg-blue-300",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-blue-100",
            currentSize.button,
            buttonClassName
          )}
          aria-label="Search"
        >
          <SearchIcon className={currentSize.icon} />
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}