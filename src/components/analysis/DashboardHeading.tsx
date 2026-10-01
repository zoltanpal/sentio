import { useState } from "react";
import { Link } from "react-router-dom";
import { StarIcon } from "lucide-react";

import { useUserSession } from "@/auth/UserSessionContext";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shared/ui/tooltip";

type WatchlistCandidate = {
  id: number;
  name: string;
  type?: string;
};

type Props = {
  query: string;
  windowHours: number;
  watchlist_candidates: WatchlistCandidate[];
  selectedEntity?: WatchlistCandidate | null;
};

function formatWindow(hours: number): string {
  return hours >= 24 && hours % 24 === 0
    ? `${hours / 24}d`
    : `${hours}h`;
}

export default function DashboardHeading({
  query,
  windowHours,
  watchlist_candidates,
  selectedEntity,
}: Props) {
  const {
    user,
    authLoading,
    authError,
    followedIds,
    watchlistLoading,
    watchlistReady,
    watchlistError,
    watchlistAction,
    refreshWatchlist,
    updateFollow,
  } = useUserSession();

  const [pickerOpen, setPickerOpen] = useState(false);

  const loggedIn = user !== null;

   const loading = authLoading || (loggedIn && (watchlistLoading || !watchlistReady));

  const busy = watchlistAction !== null;
  const error = authError || watchlistError;

  const candidates = selectedEntity ? [selectedEntity] : watchlist_candidates ?? [];

  const singleCandidate = candidates.length === 1 ? candidates[0] : null;

  const followingSingle = singleCandidate !== null && followedIds.has(singleCandidate.id);

  const followingAny = candidates.some((candidate) =>
    followedIds.has(candidate.id),
  );

  const showStar = candidates.length > 0;
  const starFilled = singleCandidate ? followingSingle : followingAny;

  const starLabel = starFilled ? "Following" : "Follow";

  const tooltipText = authLoading
    ? "Loading your account"
    : !loggedIn
      ? "Log in to add entities to your watchlist"
      : loading
        ? "Loading your follow status"
        : busy
          ? "Updating your watchlist"
          : singleCandidate
            ? followingSingle
              ? `Remove ${singleCandidate.name} from your watchlist`
              : `Add ${singleCandidate.name} to your watchlist`
            : "Choose an entity to follow or unfollow";

  const starClassName =
    "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center " +
    "gap-1.5 rounded-full px-2 text-slate-500 transition-colors " +
    "hover:bg-amber-50 hover:text-amber-600 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-teal-600 disabled:cursor-wait";

  // Keep the star visible while loading or saving.
  const starIcon = (
    <StarIcon
      aria-hidden="true"
      className={`size-5 shrink-0 transition-colors ${
        starFilled
          ? "fill-amber-400 text-amber-500"
          : "fill-none text-slate-500"
      }`}
    />
  );

  const starContents = (
    <>
      {starIcon}
      <span className="text-xs font-medium sm:hidden">
        {starLabel}
      </span>
    </>
  );

  async function toggleFollow(candidate: WatchlistCandidate) {
    if (!loggedIn || loading || busy) return;

    const saved = await updateFollow(
      {
        entity_id: candidate.id,
        entity_name: candidate.name,
        entity_type: candidate.type,
      },
      followedIds.has(candidate.id) ? "DELETE" : "PUT",
    );

    if (saved) {
      setPickerOpen(false);
    }
  }

  console.log("showStar",showStar);

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <div className="inline-flex min-w-0 max-w-full items-center gap-1">
            <h1 className="min-w-0 break-words text-4xl font-bold tracking-tight sm:text-5xl">
              {query}
            </h1>

            {/* Initial account loading: keep a disabled star visible. */}
            {showStar && authLoading && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex shrink-0">
                    <button
                      type="button"
                      disabled
                      aria-label="Loading your account"
                      aria-busy="true"
                      className={starClassName}
                    >
                      {starContents}
                    </button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{tooltipText}</TooltipContent>
              </Tooltip>
            )}

            {/* Signed out: the star links to login. */}
            {showStar && !authLoading && !loggedIn && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/login"
                    aria-label="Log in to follow an entity"
                    className={starClassName}
                  >
                    {starContents}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{tooltipText}</TooltipContent>
              </Tooltip>
            )}

            {/* One known entity: follow or unfollow directly. */}
            {showStar &&
              !authLoading &&
              loggedIn &&
              singleCandidate && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex shrink-0">
                      <button
                        type="button"
                        disabled={loading || busy}
                        onClick={() => void toggleFollow(singleCandidate)}
                        aria-label={
                          followingSingle
                            ? `Unfollow ${singleCandidate.name}`
                            : `Follow ${singleCandidate.name}`
                        }
                        aria-pressed={followingSingle}
                        aria-busy={loading || busy}
                        className={starClassName}
                      >
                        {starContents}
                      </button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{tooltipText}</TooltipContent>
                </Tooltip>
              )}

            {/* Multiple possible entities: let the user choose. */}
            {showStar &&
              !authLoading &&
              loggedIn &&
              !singleCandidate && (
                <Popover
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex shrink-0">
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            disabled={loading || busy}
                            aria-label="Choose an entity to follow or unfollow"
                            aria-busy={loading || busy}
                            className={starClassName}
                          >
                            {starContents}
                          </button>
                        </PopoverTrigger>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipText}</TooltipContent>
                  </Tooltip>

                  <PopoverContent
                    align="start"
                    collisionPadding={12}
                    className="w-[min(20rem,calc(100vw-1.5rem))] rounded-xl p-2"
                  >
                    <p className="px-2 pb-2 pt-1 text-sm font-semibold text-slate-900">
                      Which entity do you mean?
                    </p>

                    <div className="max-h-64 overflow-y-auto">
                      {candidates.map((candidate) => {
                        const following = followedIds.has(candidate.id);
                        const updating = watchlistAction?.entityId === candidate.id;

                        return (
                          <button
                            key={candidate.id}
                            type="button"
                            disabled={loading || busy}
                            onClick={() => void toggleFollow(candidate)}
                            aria-label={
                              following
                                ? `Unfollow ${candidate.name}`
                                : `Follow ${candidate.name}`
                            }
                            aria-pressed={following}
                            aria-busy={updating}
                            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:cursor-wait"
                          >
                            <StarIcon
                              aria-hidden="true"
                              className={`size-4 shrink-0 ${
                                following
                                  ? "fill-amber-400 text-amber-500"
                                  : "fill-none text-slate-400"
                              }`}
                            />

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-slate-900">
                                {candidate.name}
                              </span>
                              <span className="block text-xs capitalize text-slate-500">
                                {candidate.type?.replace(/_/g, " ") ||
                                  "Entity"}
                              </span>
                            </span>

                            <span className="shrink-0 text-xs font-medium text-slate-500">
                              {updating
                                ? "Saving…"
                                : following
                                  ? "Following"
                                  : "Follow"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
          </div>

          <span className="text-xl font-medium text-foreground/80 sm:text-2xl">
            — last {formatWindow(windowHours)}
          </span>
        </div>

        <p className="mt-1 text-lg text-muted-foreground">
          What changed?
        </p>

        {error && (
          <div role="alert" className="mt-2 text-sm text-red-700">
            {error}
            {loggedIn && !authError && (
              <button
                type="button"
                onClick={() => void refreshWatchlist()}
                disabled={watchlistLoading || busy}
                className="ml-2 underline disabled:opacity-50"
              >
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}