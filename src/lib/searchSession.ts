const SESSION_KEY = "live-search-session";
const PENDING_PROMPT_KEY = "live-pending-prompt";

export type SearchSource = "prompt" | "keyword";

export type SearchSession = {
  source: SearchSource;
  rawPrompt: string | null;
  resolvedQuery: string;
  resolvedWindowHours: number | null;
  entityId?: number | null;
};

export function parseEntityId(value: unknown): number | null {
  if (
    typeof value !== "number" &&
    (typeof value !== "string" || !/^[1-9]\d*$/.test(value))
  ) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isSearchSession(value: unknown): value is SearchSession {
  if (!value || typeof value !== "object") return false;

  const session = value as Record<string, unknown>;
  return (
    (session.source === "prompt" || session.source === "keyword") &&
    typeof session.resolvedQuery === "string" &&
    (typeof session.rawPrompt === "string" || session.rawPrompt === null) &&
    (typeof session.resolvedWindowHours === "number" ||
      session.resolvedWindowHours === null)
  );
}

export function getSearchSession(): SearchSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: unknown = JSON.parse(raw);
    return isSearchSession(session) ? {
        ...session,
        entityId: parseEntityId(session.entityId),
      } : null;
  } catch {
    return null;
  }
}

export function setSearchSession(value: SearchSession) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  } catch {
    // Ignore storage write failures and keep the flow functional in restricted environments.
  }
}

export function clearSearchSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore storage write failures and keep the flow functional in restricted environments.
  }
}

export function getPendingPrompt(): string {
  try {
    return sessionStorage.getItem(PENDING_PROMPT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setPendingPrompt(prompt: string) {
  try {
    sessionStorage.setItem(PENDING_PROMPT_KEY, prompt);
  } catch {
    // Ignore storage write failures and keep the flow functional in restricted environments.
  }
}

export function clearPendingPrompt() {
  try {
    sessionStorage.removeItem(PENDING_PROMPT_KEY);
  } catch {
    // Ignore storage write failures and keep the flow functional in restricted environments.
  }
}
