
const SENTIO_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://devapi.palzoltan.net/sentio";

const VITE_API_AUTH_TOKEN = import.meta.env.VITE_API_AUTH_TOKEN?.trim() || "";


export function buildSentioApiUrl(path: string): string {
  const normalizedBase = SENTIO_API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

export function getSentioApiHeaders(
  baseHeaders: HeadersInit = {}
): HeadersInit {
  if (!VITE_API_AUTH_TOKEN) {
    return baseHeaders;
  }

  return {
    ...baseHeaders,
    Authorization: `Bearer ${VITE_API_AUTH_TOKEN}`,
  };
}
