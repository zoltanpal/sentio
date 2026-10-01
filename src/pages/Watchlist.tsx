import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckIcon,
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
  StarIcon,
  Trash2Icon,
} from "lucide-react";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getFirebaseAuth } from "@/auth/firebase";
import {
  readEntities,
  useUserSession,
  type WatchlistEntity as Entity,
} from "@/auth/UserSessionContext";
import { buildSentioApiUrl } from "@/config/api";
import { useDashboardSearch } from "@/features/dashboard/useDashboardSearch";

export default function Watchlist() {
  const {
    displayError,
    isBusy,
    onLogoClick,
    onPromptInputChange,
    onSearch,
    promptInput,
  } = useDashboardSearch();

  const {
    user,
    authLoading,
    authError,
    watchlistItems,
    followedIds,
    watchlistLoading,
    watchlistReady,
    watchlistError,
    watchlistAction,
    refreshWatchlist,
    updateFollow: saveFollow,
  } = useUserSession();

  const [notice, setNotice] = useState("");
  const [entityQuery, setEntityQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchComplete, setSearchComplete] = useState(false);

  // Ignore local notices after unmounting or changing accounts.
  const noticeVersion = useRef(0);

  const firebaseUid = user?.uid ?? null;
  const loggedIn = user !== null;
  const loading = authLoading || watchlistLoading;
  const error = authError || watchlistError;
  const normalizedQuery = entityQuery.trim();
  const watchlist_actionsDisabled =
    loading || !watchlistReady || watchlistAction !== null;

  useEffect(() => {
    noticeVersion.current += 1;

    setNotice("");
    setEntityQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearchComplete(false);

    return () => {
      noticeVersion.current += 1;
    };
  }, [firebaseUid]);

  // Search after typing stops for 300 ms.
  useEffect(() => {
    setSearchResults([]);
    setSearchError("");
    setSearchComplete(false);

    if (!firebaseUid || normalizedQuery.length < 2) {
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setSearching(true);

    const timer = window.setTimeout(() => {
      async function searchEntities() {
        try {
          const currentUser = getFirebaseAuth().currentUser;

          if (!currentUser || currentUser.uid !== firebaseUid) return;

          const token = await currentUser.getIdToken();
          if (cancelled) return;

          const params = new URLSearchParams({ q: normalizedQuery });

          const response = await fetch(
            buildSentioApiUrl(`/entities/search?${params.toString()}`),
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              signal: controller.signal,
            },
          );

          if (!response.ok) {
            throw new Error("Entity search failed.");
          }

          const results = readEntities(await response.json());

          if (
            !cancelled &&
            getFirebaseAuth().currentUser?.uid === firebaseUid
          ) {
            setSearchResults(results);
            setSearchComplete(true);
          }
        } catch {
          if (!cancelled) {
            setSearchError("Could not search entities. Please try again.");
          }
        } finally {
          if (!cancelled) {
            setSearching(false);
          }
        }
      }

      void searchEntities();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [firebaseUid, normalizedQuery]);

  async function updateFollow(entity: Entity, method: "PUT" | "DELETE") {
    const version = noticeVersion.current;
    setNotice("");

    const saved = await saveFollow(entity, method);

    if (saved && version === noticeVersion.current) {
      setNotice(
        method === "PUT"
          ? `Following ${entity.entity_name}.`
          : `${entity.entity_name} removed from your watchlist.`,
      );
    }
  }

  function reloadWatchlist() {
    setNotice("");
    void refreshWatchlist();
  }

  return (
    <div className="mx-auto w-full">
      <DashboardHeader
        promptInput={promptInput}
        isBusy={isBusy}
        error={displayError}
        onLogoClick={onLogoClick}
        onPromptInputChange={onPromptInputChange}
        onSearch={onSearch}
      />

      <main className="mx-auto min-w-0 max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Watchlist
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Entities you’re following.
            </p>
          </div>

          {loggedIn && watchlistReady && !loading && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {watchlistItems.length} {watchlistItems.length === 1 ? "entity" : "entities"}
            </span>
          )}
        </div>

        {loggedIn && (
          <section className="mb-6 max-w-xl" aria-label="Find entities to follow">
            <label
              htmlFor="entity-search"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Add an entity
            </label>

            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400"
              />
              <input
                id="entity-search"
                type="search"
                autoComplete="off"
                value={entityQuery}
                onChange={(event) => {
                  setEntityQuery(event.target.value);
                  setSearchResults([]);
                  setSearchError("");
                  setSearchComplete(false);
                }}
                placeholder="Search companies, people, crypto…"
                aria-describedby="entity-search-hint"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10"
              />
            </div>

            <p id="entity-search-hint" className="mt-2 text-xs text-slate-400">
              Type at least 2 characters.
            </p>

            {normalizedQuery.length >= 2 && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {searching ? (
                  <p
                    role="status"
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500"
                  >
                    <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                    Searching…
                  </p>
                ) : searchError ? (
                  <p role="alert" className="px-4 py-3 text-sm text-red-700">
                    {searchError}
                  </p>
                ) : searchComplete && searchResults.length === 0 ? (
                  <p role="status" className="px-4 py-3 text-sm text-slate-500">
                    No matching entities found.
                  </p>
                ) : (
                  <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                    {searchResults.map((entity) => {
                      const following = followedIds.has(entity.entity_id);
                      const adding =
                        watchlistAction?.method === "PUT" &&
                        watchlistAction.entityId === entity.entity_id;

                      return (
                        <li
                          key={entity.entity_id}
                          className="flex items-center justify-between gap-3 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {entity.entity_name}
                            </p>
                            <p className="text-xs capitalize text-slate-500">
                              {entity.entity_type?.replace(/_/g, " ") ||
                                "Entity"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => void updateFollow(entity, "PUT")}
                            disabled={following || watchlist_actionsDisabled}
                            aria-label={
                              following
                                ? `Following ${entity.entity_name}`
                                : `Follow ${entity.entity_name}`
                            }
                            className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
                              following
                                ? "text-teal-700"
                                : "bg-teal-50 text-teal-700 hover:bg-teal-100 disabled:opacity-50"
                            }`}
                          >
                            {adding ? (
                              <LoaderCircleIcon className="h-4 w-4 animate-spin" />
                            ) : following ? (
                              <CheckIcon className="h-4 w-4" />
                            ) : (
                              <PlusIcon className="h-4 w-4" />
                            )}

                            {adding
                              ? "Adding…"
                              : following
                                ? "Following"
                                : "Follow"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}

        {notice && (
          <p role="status" className="mb-4 text-sm text-teal-700">
            {notice}
          </p>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            {loggedIn && !authError && (
              <button
                type="button"
                onClick={reloadWatchlist}
                disabled={loading || watchlistAction !== null}
                className="font-semibold underline disabled:opacity-50"
              >
                Refresh list
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500"
          >
            <LoaderCircleIcon className="h-5 w-5 animate-spin" />
            Loading watchlist…
          </div>
        ) : !loggedIn ? (
          <div className="rounded-2xl border border-slate-200 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-900">
              Your watchlist, in one place
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Log in to view and manage the entities you follow.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <Link
                to="/login"
                className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Sign up
              </Link>
            </div>
          </div>
        ) : !watchlistReady ? null : watchlistItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
            <StarIcon className="mx-auto h-8 w-8 text-slate-300" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No entities followed yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Use the search above to add your first entity.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full table-fixed text-left text-sm">
              <caption className="sr-only">Your followed entities</caption>

              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium text-slate-500 sm:px-5">
                    Entity
                  </th>
                  <th className="hidden w-36 px-4 py-3 font-medium text-slate-500 sm:table-cell">
                    Type
                  </th>
                  <th className="w-16 px-3 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {watchlistItems.map((item) => {
                  const removing =
                    watchlistAction?.method === "DELETE" &&
                    watchlistAction.entityId === item.entity_id;

                  const entityType =
                    item.entity_type?.replace(/_/g, " ") || "Entity";

                  return (
                    <tr
                      key={item.entity_id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <Link
                          to={`/dashboard?q=${encodeURIComponent(item.entity_name)}`}
                          className="block truncate font-medium text-slate-900 hover:text-teal-700"
                          title={item.entity_name}
                        >
                          {item.entity_name}
                        </Link>
                        <span className="mt-1 block text-xs capitalize text-slate-500 sm:hidden">
                          {entityType}
                        </span>
                      </td>

                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs capitalize text-slate-600">
                          {entityType}
                        </span>
                      </td>

                      <td className="px-2 py-2">
                        <button
                          type="button"
                          onClick={() => void updateFollow(item, "DELETE")}
                          disabled={watchlist_actionsDisabled}
                          aria-label={`Remove ${item.entity_name} from watchlist`}
                          title="Remove from watchlist"
                          className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-50"
                        >
                          {removing ? (
                            <LoaderCircleIcon
                              aria-hidden="true"
                              className="h-4 w-4 animate-spin"
                            />
                          ) : (
                            <Trash2Icon
                              aria-hidden="true"
                              className="h-4 w-4"
                            />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}