import { Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartOptions,
  type Plugin,
} from "chart.js";
import { useMemo } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  distribution: {
    positive_count: number;
    neutral_count: number;
    negative_count: number;
  };
  summaryLabel: string;
};

export default function SentimentDoughnut({
  distribution,
  summaryLabel,
}: Props) {
  const data = useMemo(
    () => ({
      labels: ["Positive", "Neutral", "Negative"],
      datasets: [
        {
          data: [
            distribution.positive_count,
            distribution.neutral_count,
            distribution.negative_count,
          ],
          backgroundColor: ["#34d399", "#fbbf24", "#f87171"],
          borderWidth: 4,
          hoverOffset: 6,
          hoverBorderWidth: 2,
        },
      ],
    }),
    [distribution]
  );

  const options = useMemo<ChartOptions<"doughnut">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      layout: {
        padding: 0,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = Number(context.raw ?? 0);
            //   const total = context.dataset.data.reduce(
            //     (sum, item) => sum + Number(item),
            //     0
            //   );
            //   const pct = total ? ((value / total) * 100).toFixed(1) : "0.0";
            //   return `${context.label}: ${value} (${pct}%)`;
              return ` ${context.label}: ${value}`;
            },
          },
        },
      },
    }),
    []
  );

  const centerTextPlugin = useMemo<Plugin<"doughnut">>(
    () => ({
      id: "centerText",
      beforeDraw(chart) {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const { left, top, width, height } = chartArea;
        const centerX = left + width / 2;
        const centerY = top + height / 2;

        ctx.save();

        const normalized = summaryLabel.replace(/_/g, " ");
        const words = normalized.split(" ");
        const lines =
          words.length > 1
            ? [words[0], words.slice(1).join(" ")]
            : [normalized];

        const fontSize = Math.max(11, Math.min(width / 11, 18));
        const lineHeight = fontSize + 2;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#111827";
        ctx.font = `600 ${fontSize}px sans-serif`;

        if (lines.length === 1) {
          ctx.fillText(lines[0], centerX, centerY);
        } else {
          ctx.fillText(lines[0], centerX, centerY - lineHeight / 2);
          ctx.fillText(lines[1], centerX, centerY + lineHeight / 2);
        }

        ctx.restore();
      },
    }),
    [summaryLabel]
  );

  return <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />;
}
