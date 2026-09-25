import type { MouseEvent } from "react";
import { Grid2X2Icon, BellIcon, StarIcon } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import UserMenu from "@/components/auth/UserMenu";
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
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 py-2 sm:gap-x-4 lg:h-16 lg:flex-nowrap lg:py-0">
          <Link
            to="/"
            onClick={onLogoClick}
            className="shrink-0"
            aria-label="Sentio home"
          >
            <img
              src="/logo/sentio_logo.png"
              alt="Sentio"
              className="h-auto w-20 sm:w-32 lg:w-42"
            />
          </Link>

          <nav className="hidden shrink-0 items-center gap-1 lg:flex">
            {[
              { to: "/dashboard", label: "Dashboard", Icon: Grid2X2Icon },
              { to: "/watchlist", label: "Watchlist", Icon: StarIcon },
            ].map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 font-semibold text-blue-700"
                      : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop search */}
          <div className="ml-auto hidden min-w-0 flex-1 lg:block lg:max-w-[22rem]">
            <SearchBar
              value={promptInput}
              onChange={onPromptInputChange}
              onSearch={onSearch}
              loading={isBusy}
              error={error}
              placeholder="e.g. Tesla, NVDA, oil prices"
              size="md"
              inputClassName="min-w-0 py-1.5 text-sm sm:py-1.5"
              buttonClassName="px-2 sm:px-2"
            />
          </div>

          {/* Account controls stay on the first row on mobile */}
          <div className="ml-auto flex shrink-0 items-center gap-3 lg:ml-0">
            <BellIcon
              aria-label="Notifications"
              className="hidden h-5 w-5 text-slate-500 lg:block"
            />

            <span
              aria-hidden="true"
              className="hidden h-6 w-px bg-slate-200 lg:block"
            />

            <UserMenu />
          </div>

          {/* Full-width mobile search on the second row */}
          <div className="w-full min-w-0 lg:hidden">
            <SearchBar
              value={promptInput}
              onChange={onPromptInputChange}
              onSearch={onSearch}
              loading={isBusy}
              error={error}
              placeholder="Search..."
              size="md"
              inputClassName="min-w-0 w-full px-2 py-1.5 text-sm"
              buttonClassName="shrink-0 px-2"
            />
          </div>
        </div>
      </div>
    </header>
  );
}