import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { LoaderCircleIcon, StarIcon } from "lucide-react";

import { getFirebaseAuth } from "@/auth/firebase";
import { getUserData } from "@/auth/userSession";
import { updateWatchlist } from "@/features/watchlist/updateWatchlist";

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
  selectedEntity?: {
    name: string;
    type: string;
  } | null;  
};

function formatWindow(windowHours: number): string {
  if (windowHours >= 24 && windowHours % 24 === 0) {
    return `${windowHours / 24}d`;
  }

  return `${windowHours}h`;
}

export default function DashboardHeading({
  query,
  windowHours,
  watchlist_candidates,
  selectedEntity
}: Props) {
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const requestVersion = useRef(0);
  const operationLock = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (user) => {
        const version = ++requestVersion.current;

        setLoggedIn(Boolean(user));
        setFollowedIds(new Set());
        setError("");

        if (!user) {
          setLoading(false);
          return;
        }

        setLoading(true);

        void getUserData()
          .then((data) => {
            if (version !== requestVersion.current) return;

            const watchlist = Array.isArray(data.watchlist)
              ? data.watchlist
              : [];

            setFollowedIds(
              new Set<number>(
                watchlist
                  .map((item: unknown) => {
                    if (!item || typeof item !== "object") return null;

                    const id = (item as { entity_id?: unknown }).entity_id;
                    return typeof id === "number" ? id : null;
                  })
                  .filter((id): id is number => id !== null),
              ),
            );
          })
          .catch(() => {
            if (version === requestVersion.current) {
              setError("Could not load your watchlist.");
            }
          })
          .finally(() => {
            if (version === requestVersion.current) {
              setLoading(false);
            }
          });
      },
      () => {
        requestVersion.current += 1;
        setLoggedIn(false);
        setFollowedIds(new Set());
        setLoading(false);
        setError("Could not verify your session.");
      },
    );

    return () => {
      unsubscribe();
      requestVersion.current += 1;
    };
  }, []);

  async function toggleFollow(candidate: WatchlistCandidate) {
    if (operationLock.current || loading || !loggedIn) return;
    const wasFollowing = followedIds.has(candidate.id);
    const version = requestVersion.current;

    operationLock.current = true;
    setBusyId(candidate.id);
    setError("");

    try {
      await updateWatchlist(
        candidate.id,
        wasFollowing ? "DELETE" : "PUT",
      );

      if (version !== requestVersion.current) return;

      setFollowedIds((current) => {
        const next = new Set(current);

        if (wasFollowing) {
          next.delete(candidate.id);
        } else {
          next.add(candidate.id);
        }

        return next;
      });

      setPickerOpen(false);
    } catch {
      if (version === requestVersion.current) {
        setError(
          wasFollowing
            ? "Could not remove this entity. Please try again."
            : "Could not follow this entity. Please try again.",
        );
      }
    } finally {
      operationLock.current = false;

      if (version === requestVersion.current) {
        setBusyId(null);
      }
    }
  }

  const matchingClickedEntity = selectedEntity
    ? watchlist_candidates.filter(
        (candidate) =>
          candidate.name.toLocaleLowerCase() ===
            selectedEntity.name.toLocaleLowerCase() &&
          candidate.type?.toLocaleUpperCase() ===
            selectedEntity.type.toLocaleUpperCase(),
      )
    : [];

  const singleCandidate =
    matchingClickedEntity.length === 1
      ? matchingClickedEntity[0]
      : watchlist_candidates.length === 1
        ? watchlist_candidates[0]
        : null;

  const followingSingle =
    singleCandidate !== null &&
    followedIds.has(singleCandidate.id);

  const followingAny = watchlist_candidates.some((candidate) =>
    followedIds.has(candidate.id),
  );

  const showStar = watchlist_candidates.length > 0;
  const starFilled = singleCandidate ? followingSingle : followingAny;
  const starLabel = starFilled ? "Following" : "Follow";

  const starIcon = busyId !== null ? (
    <LoaderCircleIcon
      aria-hidden="true"
      className="size-5 animate-spin"
    />
  ) : (
    <StarIcon
      aria-hidden="true"
      className={`size-5 ${
        starFilled ? "fill-amber-400 text-amber-500" : ""
      }`}
    />
  );

  const starClassName =
    "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-2 " +
    "text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600 " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-50";

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {/* Keep the star immediately beside the query. */}
          <div className="inline-flex min-w-0 max-w-full items-center gap-1">
            <h1 className="min-w-0 break-words text-4xl font-bold tracking-tight sm:text-5xl">
              {query}
            </h1>

            {showStar && !loggedIn && !loading && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/login"
                    aria-label="Log in to follow an entity"
                    className={starClassName}
                  >
                    <StarIcon aria-hidden="true" className="size-5" />
                    <span className="text-xs font-medium sm:hidden">
                      Follow
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  Log in to add entities to your watchlist
                </TooltipContent>
              </Tooltip>
            )}

            {showStar && loggedIn && singleCandidate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    disabled={loading || busyId !== null}
                    onClick={() => void toggleFollow(singleCandidate)}
                    aria-label={
                      followingSingle
                        ? `Remove ${singleCandidate.name} from your watchlist`
                        : `Follow ${singleCandidate.name}`
                    }
                    aria-pressed={followingSingle}
                    className={starClassName}
                  >
                    {starIcon}
                    <span className="text-xs font-medium sm:hidden">
                      {starLabel}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {followingSingle
                    ? `Remove ${singleCandidate.name} from your watchlist`
                    : `Add ${singleCandidate.name} to your watchlist`}
                </TooltipContent>
              </Tooltip>
            )}

            {showStar && loggedIn && !singleCandidate && (
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        disabled={loading || busyId !== null}
                        aria-label="Choose an entity to follow or unfollow"
                        className={starClassName}
                      >
                        {starIcon}
                        <span className="text-xs font-medium sm:hidden">
                          {starLabel}
                        </span>
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Choose which entity to follow
                  </TooltipContent>
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
                    {watchlist_candidates.map((candidate) => {
                      const following = followedIds.has(candidate.id);
                      const updating = busyId === candidate.id;

                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => void toggleFollow(candidate)}
                          aria-label={
                            following
                              ? `Unfollow ${candidate.name}`
                              : `Follow ${candidate.name}`
                          }
                          className="flex min-h-12 w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50 disabled:opacity-50"
                        >
                          {updating ? (
                            <LoaderCircleIcon
                              aria-hidden="true"
                              className="size-4 shrink-0 animate-spin"
                            />
                          ) : (
                            <StarIcon
                              aria-hidden="true"
                              className={`size-4 shrink-0 ${
                                following
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-slate-400"
                              }`}
                            />
                          )}

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
                            {following ? "Following" : "Follow"}
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
          <p role="alert" className="mt-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>
    </TooltipProvider>
  );
}