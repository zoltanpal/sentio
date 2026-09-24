import { getFirebaseAuth } from "@/auth/firebase";
import { clearUserCache } from "@/auth/userSession";
import { buildSentioApiUrl } from "@/config/api";

export async function updateWatchlist(
  entityId: number,
  method: "PUT" | "DELETE",
): Promise<void> {
  const user = getFirebaseAuth().currentUser;

  if (!user) {
    throw new Error("Sign in to manage your watchlist.");
  }

  const token = await user.getIdToken();

  const response = await fetch(
    buildSentioApiUrl(`/user/watchlist/${entityId}`),
    {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Watchlist update failed: ${response.status}`);
  }

  // Both pages use getUserData(), so invalidate its cached result.
  clearUserCache();
}