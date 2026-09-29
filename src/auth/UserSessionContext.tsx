import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";

import { getFirebaseAuth } from "@/auth/firebase";
import { clearUserCache, getUserData } from "@/auth/userSession";
import { updateWatchlist } from "@/features/watchlist/updateWatchlist";

export type WatchlistEntity = {
  entity_id: number;
  entity_name: string;
  entity_type?: string;
};

type Mutation = {
  entityId: number;
  method: "PUT" | "DELETE";
};

type SessionValue = {
  user: User | null;
  authLoading: boolean;
  authError: string;
  items: WatchlistEntity[];
  watchlistLoading: boolean;
  watchlistReady: boolean;
  watchlistError: string;
  followedIds: Set<number>;
  mutation: Mutation | null;
  refreshWatchlist: () => Promise<void>;
  updateFollow: (
    entity: WatchlistEntity,
    method: "PUT" | "DELETE",
  ) => Promise<boolean>;
};

const SessionContext = createContext<SessionValue | undefined>(undefined);

export function readEntities(value: unknown): WatchlistEntity[] {
  if (!Array.isArray(value)) {
    throw new Error("Expected an entity array.");
  }

  return value.map((item: unknown) => {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid entity response.");
    }

    const row = item as Record<string, unknown>;
    const id = row.entity_id ?? row.id;
    const name = row.entity_name ?? row.name ?? row.entity_text;
    const type = row.entity_type ?? row.type;

    if (typeof id !== "number" || typeof name !== "string") {
      throw new Error("Invalid entity ID or name.");
    }

    return {
      entity_id: id,
      entity_name: name,
      entity_type: typeof type === "string" ? type : undefined,
    };
  });
}

export function UserSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [items, setItems] = useState<WatchlistEntity[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistReady, setWatchlistReady] = useState(false);
  const [watchlistError, setWatchlistError] = useState("");
  const [mutation, setMutation] = useState<Mutation | null>(null);

  const versionRef = useRef(0);
  const operationLock = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (currentUser) => {
        const version = ++versionRef.current;

        setUser(currentUser);
        setAuthLoading(false);
        setAuthError("");
        setItems([]);
        setWatchlistReady(false);
        setWatchlistError("");
        setMutation(null);
        operationLock.current = false;

        if (!currentUser) {
          clearUserCache();
          setWatchlistLoading(false);
          return;
        }

        setWatchlistLoading(true);

        void getUserData()
          .then((data) => {
            if (version !== versionRef.current) return;
            if (!data) throw new Error("No user data returned.");

            setItems(readEntities(data.watchlist));
            setWatchlistReady(true);
          })
          .catch(() => {
            if (version === versionRef.current) {
              setWatchlistError("Could not load your watchlist.");
            }
          })
          .finally(() => {
            if (version === versionRef.current) {
              setWatchlistLoading(false);
            }
          });
      },
      () => {
        versionRef.current += 1;
        operationLock.current = false;
        clearUserCache();

        setUser(null);
        setAuthLoading(false);
        setAuthError("Could not verify your session.");
        setItems([]);
        setWatchlistReady(false);
        setWatchlistLoading(false);
        setMutation(null);
      },
    );

    return () => {
      unsubscribe();
      versionRef.current += 1;
    };
  }, []);

  const refreshWatchlist = useCallback(async () => {
    if (
      !user ||
      watchlistLoading ||
      operationLock.current ||
      getFirebaseAuth().currentUser?.uid !== user.uid
    ) {
      return;
    }

    const version = versionRef.current;
    operationLock.current = true;
    setWatchlistLoading(true);
    setWatchlistError("");

    try {
      const data = await getUserData(true);

      if (version !== versionRef.current) return;
      if (!data) throw new Error("No user data returned.");

      setItems(readEntities(data.watchlist));
      setWatchlistReady(true);
    } catch {
      if (version === versionRef.current) {
        setWatchlistError("Could not refresh your watchlist.");
      }
    } finally {
      if (version === versionRef.current) {
        operationLock.current = false;
        setWatchlistLoading(false);
      }
    }
  }, [user, watchlistLoading]);

  const updateFollow = useCallback(
    async (
      entity: WatchlistEntity,
      method: "PUT" | "DELETE",
    ): Promise<boolean> => {
      if (
        !user ||
        !watchlistReady ||
        watchlistLoading ||
        operationLock.current ||
        getFirebaseAuth().currentUser?.uid !== user.uid
      ) {
        return false;
      }

      const version = versionRef.current;
      operationLock.current = true;
      setMutation({ entityId: entity.entity_id, method });
      setWatchlistError("");

      try {
        await updateWatchlist(entity.entity_id, method);

        if (
          version !== versionRef.current ||
          getFirebaseAuth().currentUser?.uid !== user.uid
        ) {
          return false;
        }

        setItems((current) =>
          method === "PUT"
            ? current.some((item) => item.entity_id === entity.entity_id)
              ? current
              : [...current, entity]
            : current.filter((item) => item.entity_id !== entity.entity_id),
        );

        // A future reload must fetch fresh user data.
        clearUserCache();
        return true;
      } catch {
        if (version === versionRef.current) {
          setWatchlistError(
            method === "PUT"
              ? "Could not follow this entity. Please try again."
              : "Could not unfollow this entity. Please try again.",
          );
        }
        return false;
      } finally {
        if (version === versionRef.current) {
          operationLock.current = false;
          setMutation(null);
        }
      }
    },
    [user, watchlistReady, watchlistLoading],
  );

  const followedIds = useMemo(
    () => new Set(items.map((item) => item.entity_id)),
    [items],
  );

  return (
    <SessionContext.Provider
      value={{
        user,
        authLoading,
        authError,
        items,
        watchlistLoading,
        watchlistReady,
        watchlistError,
        followedIds,
        mutation,
        refreshWatchlist,
        updateFollow,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useUserSession requires UserSessionProvider.");
  }

  return context;
}