# Sentio

Sentio is a React frontend for live news sentiment analysis. Users enter a topic in plain language, the app resolves that input into a structured query, and the dashboard shows recent headlines, aggregate tone, and sentiment change over a selectable time window.

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Chart.js / react-chartjs-2
- Radix-based UI primitives

## App Flow

1. The home page collects a free-form search prompt.
2. The frontend stores the pending prompt in session storage and routes to `/results`.
3. The dashboard resolves the prompt into a query and time window.
4. The dashboard fetches live sentiment data and renders summary cards, a doughnut chart, and recent headlines.

## Environment

Create a `.env` file for local development if needed:

```bash
VITE_SENTIO_API_BASE_URL=https://devapi.palzoltan.net/sentio
VITE_SENTIO_API_TOKEN=
```

If `VITE_SENTIO_API_TOKEN` is empty, the frontend sends no `Authorization` header.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```
