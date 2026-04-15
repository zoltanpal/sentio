import { MainNavigationMenu } from "@/components/layout/nav";
import { Separator } from "@/components/shared/ui/separator";
import { 
  CircleQuestionMarkIcon, 
  SearchIcon,
  ShapesIcon,
  CircleAlertIcon,
  LightbulbIcon,
  SigmaIcon,
} from "lucide-react";

export default function Help() {
  return (
    <div className="mx-auto w-full">
      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-2 sm:gap-2">
              <img
                src="/logo.png"
                alt="Sentio Logo"
                className="w-10 sm:w-12 md:w-16"
              />
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">
                Sentio
              </h1>
            </a>
          </div>

          <div className="w-full md:w-auto">
            <MainNavigationMenu />
          </div>
        </div>
      
        <Separator className="my-5" />
    


        <div className="flex flex-col items-center">
          <div className="w-full max-w-3xl">
            {/* Header */}
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                How Sentio works
              </h1>
              <p className="mt-4 text-gray-600 text-lg">
                Understand what you’re seeing — and why it matters.
              </p>
            </div>

            <div className="mt-10 space-y-5 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  <CircleQuestionMarkIcon className="mr-2 inline-block" />What is Sentio?
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  Sentio analyzes recent news and shows how the tone around a topic
                  is changing in real time.
                </p>
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  It helps you quickly understand whether sentiment is becoming more
                  positive, negative, or staying stable — and what headlines are
                  driving it.
                </p>
              </section>

              <Separator className="my-5" />

              <section>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  <SearchIcon className="mr-2 inline-block" />How to search
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  You can search using keywords like <strong>Tesla</strong> or{" "}
                  <strong>Bitcoin</strong>, or ask a question like{" "}
                  <em>“How is sentiment on oil changing?”</em>.
                </p>
              </section>

              <Separator className="my-5" />

              <section>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  <LightbulbIcon className="mr-2 inline-block" />Understanding the results
                </h2>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="font-medium">Sentiment Trend</p>
                    <p className="text-sm text-gray-600">
                      Shows how the average sentiment changes over time.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Change</p>
                    <p className="text-sm text-gray-600">
                      Compares the current period to the previous one.
                    </p>
                    <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                      <li>Improving → becoming more positive</li>
                      <li>Worsening → becoming more negative</li>
                      <li>Stable → little or no change</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium">Overall Tone</p>
                    <p className="text-sm text-gray-600">
                      The dominant sentiment across all articles in the selected
                      time window.
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Headlines</p>
                    <p className="text-sm text-gray-600">
                      The news driving the sentiment. Use these to understand what’s
                      behind the trend.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-5" />
              
              <section>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  <SigmaIcon className="mr-2 inline-block" />How sentiment is calculated
                </h2>
                <p className="mt-2">
                  Each article is analyzed and classified as positive, neutral, or
                  negative.
                </p>
                <p className="mt-2">
                  These are aggregated to show average sentiment, distribution, and
                  changes over time.
                </p>
              </section>

              {/* Notes */}
              <section>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  <CircleAlertIcon className="mr-2 inline-block" />Things to keep in mind
                </h2>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside">
                  <li>Results depend on available news volume</li>
                  <li>Small datasets can cause larger swings</li>
                  <li>Sentiment reflects media tone, not absolute truth</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}