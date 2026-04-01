
const SENTIO_API_BASE_URL =
  import.meta.env.VITE_SENTIO_API_BASE_URL?.trim() ||
  "https://devapi.palzoltan.net/sentio";

const SENTIO_API_TOKEN = import.meta.env.VITE_SENTIO_API_TOKEN?.trim() || "";

export function buildSentioApiUrl(path: string): string {
  const normalizedBase = SENTIO_API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

export function getSentioApiHeaders(
  baseHeaders: HeadersInit = {}
): HeadersInit {
  if (!SENTIO_API_TOKEN) {
    return baseHeaders;
  }

  return {
    ...baseHeaders,
    Authorization: `Bearer ${SENTIO_API_TOKEN}`,
  };
}
