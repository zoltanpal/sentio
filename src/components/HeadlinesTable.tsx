type Headline = {
  id: string;
  source_name: string;
  title: string;
  published_at: string;
  sentiment_label: "positive" | "neutral" | "negative";
};

const sentimentStyles = {
  positive: {
    bar: "bg-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
  },
  neutral: {
    bar: "bg-yellow-400",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  negative: {
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
};

function formatTimeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);

  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  return `${Math.floor(diff / 1440)} day ago`;
}

export default function HeadlinesTable({ items }: { items: Headline[] }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">

      <div className="divide-y">
        {items.map((item) => {
            console.log("Rendering headline:", item);
            const style = sentimentStyles[item.sentiment_label];

          return (



            <div
              key={item.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
            >



              <div className="flex items-start gap-4">
                {/* sentiment bar */}
                <div className={`w-1.5 h-10 rounded ${style.bar}`} />


                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    {item.source_name}
                  </div>

                  <div className="text-base font-medium text-gray-900 leading-snug">
                    {item.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {formatTimeAgo(item.published_at)}
                </div>

                <span
                  className={`px-3 py-1 text-md rounded-full font-medium capitalize ${style.badge}`}
                >
                  {item.sentiment_label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}