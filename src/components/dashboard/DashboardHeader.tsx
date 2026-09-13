import type { MouseEvent } from "react";
import {
  CircleQuestionMarkIcon,
  FileTextIcon,
  Grid2X2Icon,
} from "lucide-react";
import { Link } from "react-router-dom";

import SearchBar from "@/components/search/SearchBar";

type DashboardHeaderProps = {
  promptInput: string;
  isBusy: boolean;
  error: string;
  onLogoClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  onPromptInputChange: (value: string) => void;
  onSearch: () => void;
};

export default function DashboardHeader({
  promptInput,
  isBusy,
  error,
  onLogoClick,
  onPromptInputChange,
  onSearch,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex h-16 items-center gap-3 sm:gap-5">
          <Link
            to="/"
            onClick={onLogoClick}
            className="shrink-0"
            aria-label="Sentio home"
          >
            <img
              src="/logo/sentio_logo.png"
              alt="Sentio"
              className="h-auto w-32 sm:w-42"
            />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            <span className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              <Grid2X2Icon className="h-4 w-4" />
              Dashboard
            </span>
            <Link
              to="/sources"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              <FileTextIcon className="h-4 w-4" />
              Sources
            </Link>
            <Link
              to="/help"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
            >
              <CircleQuestionMarkIcon className="h-4 w-4" />
              How it works
            </Link>
          </nav>
          <div className="ml-auto hidden w-full max-w-[30rem] lg:block">
            <SearchBar
              value={promptInput}
              onChange={onPromptInputChange}
              onSearch={onSearch}
              loading={isBusy}
              error={error}
              placeholder="e.g. Tesla, NVDA, oil prices"
              size="md"
              inputClassName="py-1.5 text-sm sm:py-1.5"
              buttonClassName="px-3 sm:px-3"
            />
          </div>

          <div className="ml-auto min-w-0 flex-1 lg:hidden">
            <SearchBar
              value={promptInput}
              onChange={onPromptInputChange}
              onSearch={onSearch}
              loading={isBusy}
              error={error}
              placeholder="Search..."
              size="md"
              inputClassName="min-w-0 py-1.5 text-sm"
              buttonClassName="px-3"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
