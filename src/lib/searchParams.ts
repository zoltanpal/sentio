export const ALLOWED_WINDOWS = [6, 12, 24, 48, 72];
export const DEFAULT_WINDOW = 6;

export function sanitizeWindow(value: string | null): number {
  const parsed = Number(value);
  return ALLOWED_WINDOWS.includes(parsed) ? parsed : DEFAULT_WINDOW;
}

export function sanitizeQuery(value: string | null): string {
  return (value ?? "").trim();
}

export function validateQuery(query: string): string {
  const trimmed = query.trim();

  if (!trimmed) {
    return "Please enter at least one keyword.";
  }

  if (trimmed.length < 2) {
    return "Please enter at least 3 characters.";
  }

  return "";
}
