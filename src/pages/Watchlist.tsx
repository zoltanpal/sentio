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
import { onAuthStateChanged } from "firebase/auth";

import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { getFirebaseAuth } from "@/auth/firebase";
import { clearUserCache, getUserData } from "@/auth/userSession";
import { buildSentioApiUrl } from "@/config/api";
import { useDashboardSearch } from "@/features/dashboard/useDashboardSearch";
import { updateWatchlist } from "@/features/watchlist/updateWatchlist";

type Entity = {
  entity_id: number;
  entity_name: string;
  entity_type?: string;
};

function readEntities(value: unknown): Entity[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected an entity array.");
  }

  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid entity response.");
    }

    const row = item as Record<string, unknown>;
    const id = row.entity_id ?? row.id;
    const name = row.entity_name ?? row.entity_text;

    if (typeof id !== "number" || typeof name !== "string") {
      throw new Error("Invalid entity ID or name.");
    }

    return {
      entity_id: id,
      entity_name: name,
      entity_type:
        typeof row.entity_type === "string" ? row.entity_type : undefined,
    };
  });
}

function readWatchlist(data: Record<string, unknown>): Entity[] {
  return readEntities(data.watchlist);
}

export default function Watchlist() {
  const {
    displayError,
    isBusy,
    onLogoClick,
    onPromptInputChange,
    onSearch,
    promptInput,
  } = useDashboardSearch();

  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseUid, setFirebaseUid] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [entityQuery, setEntityQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Entity[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchComplete, setSearchComplete] = useState(false);

  const [mutation, setMutation] = useState<{
    entityId: number;
    method: "PUT" | "DELETE";
  } | null>(null);

  const operationLock = useRef(false);
  const requestVersion = useRef(0);

  const loggedIn = firebaseUid !== null;
  const followedIds = new Set(items.map((item) => item.entity_id));
  const normalizedQuery = entityQuery.trim();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (user) => {
        const version = ++requestVersion.current;

        setFirebaseUid(user?.uid ?? null);
        setItems([]);
        setError("");
        setNotice("");
        setEntityQuery("");
        setSearchResults([]);

        if (!user) {
          clearUserCache();
          setLoading(false);
          return;
        }

        setLoading(true);

        void getUserData()
          .then((data) => {
            if (version === requestVersion.current) {
              setItems(readWatchlist(data));
              console.log(data)
            }
          })
          .catch(() => {
            if (version === requestVersion.current) {
              setError("Could not load your watchlist. Please try again.");
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
        setFirebaseUid(null);
        setItems([]);
        setLoading(false);
        setError("Could not verify your session. Please refresh the page.");
      },
    );

    return () => {
      unsubscribe();
      requestVersion.current += 1;
    };
  }, []);

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
          const user = getFirebaseAuth().currentUser;

          if (!user || user.uid !== firebaseUid) return;

          const token = await user.getIdToken();
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

          if (!cancelled) {
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

  async function reloadWatchlist() {
    if (operationLock.current) return;

    operationLock.current = true;
    const version = requestVersion.current;

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await getUserData(true);

      if (version === requestVersion.current) {
        setItems(readWatchlist(data));
      }
    } catch {
      if (version === requestVersion.current) {
        setError("Could not refresh your watchlist. Please try again.");
      }
    } finally {
      operationLock.current = false;

      if (version === requestVersion.current) {
        setLoading(false);
      }
    }
  }

  async function updateFollow(entity: Entity, method: "PUT" | "DELETE") {
    if (operationLock.current || loading) return;

    const user = getFirebaseAuth().currentUser;
    if (!user || user.uid !== firebaseUid) return;

    if (method === "PUT" && followedIds.has(entity.entity_id)) return;

    operationLock.current = true;
    const version = requestVersion.current;

    setMutation({ entityId: entity.entity_id, method });
    setError("");
    setNotice("");

    try {
      if (version !== requestVersion.current) return;

      await updateWatchlist(entity.entity_id, method);

      if (version !== requestVersion.current) return;

      // Update only after the API confirms success.
      setItems((current) =>
        method === "PUT"
          ? current.some((item) => item.entity_id === entity.entity_id)
            ? current
            : [...current, entity]
          : current.filter((item) => item.entity_id !== entity.entity_id),
      );

      setNotice(
        method === "PUT"
          ? `Following ${entity.entity_name}.`
          : `${entity.entity_name} removed from your watchlist.`,
      );

      // Invalidate first so a failed refresh cannot leave stale cached data.
      clearUserCache();

      try {
        const data = await getUserData(true);

        if (version === requestVersion.current) {
          setItems(readWatchlist(data));
        }
      } catch {
        if (version === requestVersion.current) {
          clearUserCache();
          setError(
            "Your change was saved, but refreshing user data failed. Please refresh the list.",
          );
        }
      }
    } catch {
      if (version === requestVersion.current) {
        setError(
          method === "PUT"
            ? "Could not follow this entity. Please try again."
            : "Could not remove this entity. Please try again.",
        );
      }
    } finally {
      operationLock.current = false;
      setMutation(null);
    }
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

          {loggedIn && !loading && (
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {items.length} {items.length === 1 ? "entity" : "entities"}
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
                        mutation?.method === "PUT" &&
                        mutation.entityId === entity.entity_id;

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
                            onClick={() => updateFollow(entity, "PUT")}
                            disabled={following || mutation !== null || loading}
                            aria-label={
                              following
                                ? `Following ${entity.entity_name}`
                                : `Follow ${entity.entity_name}`
                            }
                            className={`flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
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
            {loggedIn && (
              <button
                type="button"
                onClick={reloadWatchlist}
                disabled={loading || mutation !== null}
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
        ) : items.length === 0 ? (
          !error && (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center">
              <StarIcon className="mx-auto h-8 w-8 text-slate-300" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                No entities followed yet
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Use the search above to add your first entity.
              </p>
            </div>
          )
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
                {items.map((item) => {
                  const removing =
                    mutation?.method === "DELETE" &&
                    mutation.entityId === item.entity_id;
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
                          onClick={() => updateFollow(item, "DELETE")}
                          disabled={mutation !== null}
                          aria-label={`Remove ${item.entity_name} from watchlist`}
                          title="Remove from watchlist"
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-teal-600 disabled:cursor-wait disabled:opacity-50"
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