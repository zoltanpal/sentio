import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";

import type {
  ChartData,
  ChartOptions,
  ScriptableLineSegmentContext,
  TooltipItem,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  Tooltip,
  Legend,
  Title,
  Filler
);

type TimelinePoint = {
  bucket_start: string;
  article_count: number;
  avg_sentiment_score: number | null;
};

type Props = {
  data: TimelinePoint[];
  title?: string;
};

const POSITIVE_THRESHOLD = 0.05;
const NEGATIVE_THRESHOLD = -0.05;
const FONT_FAMILY =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function formatBucketLabel(value: string): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getSentimentColor(value: number | null): string {
  if (value === null || value === undefined) return "#94a3b8";
  if (value >= POSITIVE_THRESHOLD) return "#16a34a";
  if (value <= NEGATIVE_THRESHOLD) return "#dc2626";
  return "#d97706";
}

export default function SentimentTimelineChart({ data, title }: Props) {
  const labels = data.map((point) => formatBucketLabel(point.bucket_start));
  const sentimentValues = data.map((point) => point.avg_sentiment_score);
  const articleCounts = data.map((point) => point.article_count);
  const totalArticles = articleCounts.reduce((sum, count) => sum + count, 0);

  const chartData: ChartData<"bar" | "line", (number | null)[], string> = {
    labels,
    datasets: [
      {
        type: "bar",
        label: "Articles",
        data: articleCounts,
        yAxisID: "yCount",
        backgroundColor: "rgba(96, 165, 250, 0.24)",
        borderColor: "rgba(59, 130, 246, 0.45)",
        hoverBackgroundColor: "rgba(59, 130, 246, 0.34)",
        hoverBorderColor: "rgba(37, 99, 235, 0.7)",
        borderWidth: 1,
        borderRadius: 5,
        borderSkipped: false,
        categoryPercentage: 0.72,
        barPercentage: 0.82,
        order: 2,
      },
      {
        type: "line",
        label: "Avg sentiment",
        data: sentimentValues,
        yAxisID: "ySentiment",
        tension: 0.36,
        spanGaps: true,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        pointHoverBorderWidth: 3,
        pointBackgroundColor: sentimentValues.map(getSentimentColor),
        pointBorderColor: sentimentValues.map(getSentimentColor),
        pointHoverBackgroundColor: sentimentValues.map(getSentimentColor),
        pointHoverBorderColor: "#ffffff",
        borderWidth: 2.25,
        fill: false,
        order: 1,
        segment: {
          borderColor: (context: ScriptableLineSegmentContext) => {
            const value = context.p1.parsed.y as number | null;
            return getSentimentColor(value);
          },
        },
      },
    ],
  };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 80,
    normalized: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    animation: {
      duration: 350,
    },
    layout: {
      padding: {
        top: 2,
        right: 2,
        bottom: 0,
        left: 0,
      },
    },
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          color: "#64748b",
          boxWidth: 9,
          boxHeight: 9,
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            family: FONT_FAMILY,
            size: 11,
            weight: 500,
          },
        },
      },
      title: {
        display: Boolean(title),
        text: title ?? "",
        color: "#0f172a",
        font: {
          family: FONT_FAMILY,
          size: 14,
          weight: 600,
        },
        padding: {
          bottom: 12,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#ffffff",
        bodyColor: "#e2e8f0",
        borderColor: "rgba(148, 163, 184, 0.3)",
        borderWidth: 1,
        cornerRadius: 10,
        padding: 12,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        titleFont: {
          family: FONT_FAMILY,
          size: 12,
          weight: 600,
        },
        bodyFont: {
          family: FONT_FAMILY,
          size: 12,
        },
        callbacks: {
          label(context: TooltipItem<"bar" | "line">) {
            const label = context.dataset.label ?? "";
            const raw = context.raw;

            if (label === "Avg sentiment") {
              if (raw === null || raw === undefined) {
                return "Avg sentiment: no data";
              }

              return `Avg sentiment: ${Number(raw).toFixed(2)}`;
            }

            if (label === "Articles") {
              return `Articles: ${raw}`;
            }

            return `${label}: ${Number(raw).toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        border: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          autoSkip: true,
          maxTicksLimit: 5,
          maxRotation: 0,
          minRotation: 0,
          padding: 8,
          font: {
            family: FONT_FAMILY,
            size: 10,
          },
        },
      },
      ySentiment: {
        type: "linear",
        position: "left",
        min: -1,
        max: 1,
        border: {
          display: false,
        },
        grid: {
          color(context) {
            return Number(context.tick.value) === 0
              ? "rgba(100, 116, 139, 0.38)"
              : "rgba(148, 163, 184, 0.14)";
          },
          lineWidth(context) {
            return Number(context.tick.value) === 0 ? 1.25 : 1;
          },
        },
        ticks: {
          color: "#64748b",
          stepSize: 0.5,
          padding: 8,
          font: {
            family: FONT_FAMILY,
            size: 10,
          },
          callback(value) {
            return Number(value).toFixed(1);
          },
        },
      },
      yCount: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#94a3b8",
          precision: 0,
          maxTicksLimit: 5,
          padding: 8,
          font: {
            family: FONT_FAMILY,
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="relative h-full min-h-0 w-full">
      <p className="sr-only">
        Sentiment timeline with {data.length} time intervals and {totalArticles}
        total article mentions.
      </p>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
