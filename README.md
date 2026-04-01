# Sentio

Sentio is a React frontend for live news sentiment analysis.

The user enters a free-form prompt such as `Tesla`, `NVDA`, or `oil prices`. The app navigates to the dashboard immediately, resolves that prompt into a parsed search query through an API call, and then fetches live news sentiment results for the parsed query.

## What The App Does

- Accepts a natural-language prompt on the home page
- Navigates to the dashboard without waiting for prompt parsing
- Resolves the prompt into a structured query and time window
- Fetches live analysis results for that parsed query
- Shows a summary, tone shift, article count, and recent headlines
- Lets the user change the time range for the already parsed query

## User Flow

1. The user enters a prompt on `/`.
2. The frontend stores the raw prompt in session storage.
3. The app navigates immediately to `/results?mode=prompt`.
4. The dashboard reads the pending prompt and sends it to the prompt parser API.
5. The parser API returns a resolved query and window.
6. The dashboard updates the URL to `?query=...&window=...`.
7. The dashboard sends the live analysis request for that resolved query.
8. The UI renders the returned sentiment data.

Important behavior:

- Going back to the Home page resets the current session and pending prompt.
- Changing the time window on the Dashboard reuses the parsed query, not the raw prompt.
- If the user edits the prompt in the Dashboard but does not search again, the current time-range changes still apply to the last parsed query.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Tailwind CSS v4
- Chart.js
- `react-chartjs-2`
- Radix-based UI primitives

## Project Structure

```text
src/
  components/
    analysis/
    search/
    shared/
  config/
    api.ts
  hooks/
    useLiveAnalysis.tsx
    usePromptResolver.tsx
    useSearchSession.tsx
  lib/
    searchParams.ts
    utils.tsx
  pages/
    Dashboard.tsx
    Home.tsx
    Loading.tsx
    NotFound.tsx
```

Structure rules used in this project:

- `pages/` contains route-level screens
- `components/search/` contains search-related UI
- `components/analysis/` contains result and sentiment UI
- `components/shared/` contains shared UI primitives
- `hooks/` contains API and session hooks
- `lib/` contains small reusable helpers

## Main Files

- `src/pages/Home.tsx`: prompt entry point
- `src/pages/Dashboard.tsx`: dashboard UI and search flow orchestration
- `src/hooks/usePromptResolver.tsx`: prompt parsing API logic
- `src/hooks/useLiveAnalysis.tsx`: live analysis API logic
- `src/hooks/useSearchSession.tsx`: session storage helpers
- `src/config/api.ts`: env-based API configuration

## Environment Variables

Create a `.env` file if needed:

```bash
VITE_SENTIO_API_BASE_URL=https://devapi.palzoltan.net/sentio
VITE_SENTIO_API_TOKEN=
```

Notes:

- `VITE_SENTIO_API_BASE_URL` is the base URL used by the frontend API helpers.
- If `VITE_SENTIO_API_TOKEN` is empty, the app sends no `Authorization` header.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open the app in the browser. The Vite config currently runs on port `5000`.

## Current Notes

- Build passes.
- Lint passes with a few existing `react-refresh/only-export-components` warnings in shared UI files.
- The frontend depends on external Sentio APIs for prompt parsing and live analysis.
