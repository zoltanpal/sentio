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
      input: "px-6 py-4 text-2xl",
      button: "px-6 text-sm font-medium",
    },
    md: {
      wrapper: "rounded-xl",
      input: "px-4 py-3 text-lg",
      button: "px-5 text-sm font-medium",
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
            "flex-1 outline-none bg-white placeholder:text-gray-400",
            currentSize.input,
            inputClassName
          )}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={isDisabled}
          className={cn(
            "flex items-center gap-2 border-l border-gray-200 bg-blue-100 transition",
            "hover:bg-blue-300",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-50",
            currentSize.button,
            buttonClassName
          )}
        >
          <SearchIcon className="h-5 w-5" />
          <span className="text-xl">Search</span>
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}