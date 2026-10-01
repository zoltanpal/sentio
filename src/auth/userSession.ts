import { getFirebaseAuth } from "@/auth/firebase";
import { buildSentioApiUrl } from "@/config/api";

// Replace with your exact API response type when available.
export type SentioUser = Record<string, unknown>;

const STORAGE_KEY = "sentio-user";

type CachedUser = {
  firebaseUid: string;
  data: SentioUser;
};

export function clearUserCache(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable.
  }
}

export async function getUserData(
  refresh = false,
): Promise<SentioUser> {
  const auth = getFirebaseAuth();
  await auth.authStateReady();

  const user = auth.currentUser;

  if (!user) {
    clearUserCache();
    return null;
  }

  if (!refresh) {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);

      if (stored) {
        const cached: CachedUser = JSON.parse(stored);

        // Never reuse another account's cached data.
        if (
          cached.firebaseUid === user.uid &&
          cached.data &&
          typeof cached.data === "object" &&
          !Array.isArray(cached.data)
        ) {
          return cached.data;
        }

        clearUserCache();
      }
    } catch {
      clearUserCache();
    }
  }

  // Firebase refreshes the token when necessary.
  const token = await user.getIdToken();

  const response = await fetch(buildSentioApiUrl("/user/me"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearUserCache();
    }

    throw new Error(
      response.status === 401
        ? "Your session could not be verified. Please log in again."
        : "Could not load your user data. Please try again.",
    );
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The API returned an unexpected user response.");
  }

  // Ignore a response if the account changed while fetching.
  if (auth.currentUser?.uid !== user.uid) {
    throw new Error("The signed-in account changed. Please try again.");
  }

  const userData = data as SentioUser;

  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        firebaseUid: user.uid,
        data: userData,
      } satisfies CachedUser),
    );
  } catch {
    // The request can still succeed without caching.
  }

  return userData;
}