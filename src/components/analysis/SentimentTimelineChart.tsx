import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  BarController,
  LineController,
//   type ChartOptions,
//   type TooltipItem,
//   type ScriptableContext,
} from "chart.js";
import { Chart } from "react-chartjs-2";

import type { ChartData, ChartOptions, TooltipItem, ScriptableContext } from "chart.js";
import type { ScriptableLineSegmentContext } from "chart.js";

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
  if (value === null || value === undefined) return "#a1a1aa"; // zinc-400
  if (value >= POSITIVE_THRESHOLD) return "#16a34a"; // green-600
  if (value <= NEGATIVE_THRESHOLD) return "#dc2626"; // red-600
  return "#d97706"; // amber-600
}

export default function SentimentTimelineChart({
  data,
  title = "Sentiment Trend",
}: Props) {
  const labels = data.map((point) => formatBucketLabel(point.bucket_start));

  const sentimentValues = data.map((point) => point.avg_sentiment_score);
  const articleCounts = data.map((point) => point.article_count);

    const chartData: ChartData<"bar" | "line", (number | null)[], string> = {
    labels,
    datasets: [
        {
        type: "bar",
        label: "Articles",
        data: articleCounts,
        yAxisID: "yCount",
        backgroundColor: "rgba(59, 130, 246, 0.28)",
        borderColor: "rgba(59, 130, 246, 0.75)",
        borderWidth: 1,
        borderRadius: 6,
        order: 2,
        },
        {
        type: "line",
        label: "Avg sentiment",
        data: sentimentValues,
        yAxisID: "ySentiment",
        tension: 0.35,
        spanGaps: true,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: sentimentValues.map((value) => getSentimentColor(value)),
        pointBorderColor: sentimentValues.map((value) => getSentimentColor(value)),
        borderWidth: 2,
        order: 1,
        segment: {
            borderColor: (ctx: ScriptableLineSegmentContext) => {
                const y = ctx.p1.parsed.y as number | null;
                return getSentimentColor(y);
            },
        },
        },
    ],
    };

  const options: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
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
        grid: {
          display: false,
        },
      },
      ySentiment: {
        type: "linear",
        position: "left",
        min: -1,
        max: 1,
        title: {
          display: true,
          text: "Sentiment",
        },
        ticks: {
          callback(value) {
            return Number(value).toFixed(1);
          },
        },
      },
      yCount: {
        type: "linear",
        position: "right",
        beginAtZero: true,
        title: {
          display: true,
          text: "Articles",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="h-[320px] w-full">
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}