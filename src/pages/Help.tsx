import {
  BarChart3Icon,
  CircleAlertIcon,
  CircleQuestionMarkIcon,
  Clock3Icon,
  LightbulbIcon,
  SearchIcon,
  SigmaIcon,
  TagsIcon,
} from "lucide-react";

import Header from "@/components/layout/Header";
import { Separator } from "@/components/shared/ui/separator";

const resultItems = [
  {
    title: "Trend",
    description:
      "Shows whether the overall news tone is improving, worsening, or remaining stable compared with the previous equivalent time window.",
  },
  {
    title: "Current",
    description:
      "Summarizes the current tone and shows the percentage of positive, neutral, and negative matching articles.",
  },
  {
    title: "Change",
    description:
      "The difference between the current average sentiment score and the previous equivalent period. Sentiment scores range from −1 to +1.",
  },
  {
    title: "Main reason",
    description:
      "The most prominent recent story contributing to the movement. The complete ranked list appears under “What’s driving this?”.",
  },
  {
    title: "Coverage",
    description:
      "The number of matching articles and distinct news sources found during the selected period.",
  },
  {
    title: "Sentiment over time",
    description:
      "The line shows average sentiment for each time bucket. The blue bars show how many matching articles appeared in that bucket.",
  },
  {
    title: "Most mentioned",
    description:
      "Frequently occurring people, companies, markets, events, and cryptocurrencies. Select an entity to start a new search for it.",
  },
  {
    title: "Latest headlines",
    description:
      "The recent matching articles behind the analysis, including their source, publication time, and sentiment classification.",
  },
];

export default function Help() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10">
        <Header />
        <Separator className="bg-slate-200/80" />

        <main className="mx-auto max-w-5xl pb-16 pt-10 sm:pb-20 sm:pt-14 lg:pt-16">
          <section className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
              <CircleQuestionMarkIcon className="h-3.5 w-3.5" />
              Help and methodology
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              How Sentio works
            </h1>
            <p className="mt-6 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Learn how to search, read the dashboard, and interpret the signal
              without giving it more certainty than the underlying news allows.
            </p>
          </section>

          <section className="mt-10 rounded-[1.25rem] border border-blue-100 bg-blue-50/70 p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 ring-1 ring-blue-100">
                <CircleQuestionMarkIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  What is Sentio?
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600 sm:text-base">
                  Sentio analyzes recent news coverage for a company, topic, or
                  keyword. It summarizes the current media tone, compares it with
                  the previous period, and shows the stories and entities behind
                  the movement.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Sentio measures the tone of available coverage. It does not
                  determine whether an event is objectively good or bad, predict
                  markets, or replace reading the underlying articles.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-14 sm:mt-16">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
              Getting started
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              From search to signal
            </h2>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <SearchIcon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-blue-200">01</span>
                </div>
                <h3 className="mt-4 font-bold text-slate-950">Search a topic</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Enter a company, market, person, technology, event, or other
                  focused keyword—for example, Tesla, Bitcoin, or oil prices.
                </p>
              </article>

              <article className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <Clock3Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-blue-200">02</span>
                </div>
                <h3 className="mt-4 font-bold text-slate-950">
                  Choose a time window
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Select how far back Sentio should look. Short windows react
                  faster; longer windows usually provide more context and volume.
                </p>
              </article>

              <article className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    <BarChart3Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold text-blue-200">03</span>
                </div>
                <h3 className="mt-4 font-bold text-slate-950">
                  Explore the evidence
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Start with the summary, then inspect the timeline, drivers,
                  entities, and headlines before drawing a conclusion.
                </p>
              </article>
            </div>
          </section>

          <section className="mt-14 sm:mt-16">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <LightbulbIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                  Dashboard guide
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Understanding the results
                </h2>
              </div>
            </div>

            <div className="mt-7 grid overflow-hidden rounded-[1.25rem] border border-slate-200/90 bg-white sm:grid-cols-2">
              {resultItems.map((item, index) => (
                <article
                  key={item.title}
                  className={`border-slate-100 p-5 sm:p-6 ${
                    index < resultItems.length - 1 ? "border-b" : ""
                  } ${
                    index < resultItems.length - 2
                      ? "sm:border-b"
                      : "sm:border-b-0"
                  } ${index % 2 === 0 ? "sm:border-r" : ""}`}
                >
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-2">
            <article className="rounded-[1.25rem] border border-slate-200/90 bg-white p-5 sm:p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                <SigmaIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                How sentiment is calculated
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>
                  Each matching article is analyzed and assigned a sentiment
                  score and a positive, neutral, or negative label.
                </p>
                <p>
                  Sentio aggregates those article-level results to calculate the
                  distribution, average sentiment, timeline, and change against
                  the immediately preceding window of the same length.
                </p>
              </div>
            </article>

            <article className="rounded-[1.25rem] border border-amber-200/80 bg-amber-50/70 p-5 sm:p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-amber-700 ring-1 ring-amber-200">
                <CircleAlertIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Things to keep in mind
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                <li>Results depend on the news sources and articles available.</li>
                <li>Small article counts can produce larger apparent swings.</li>
                <li>Repeated or closely related stories can influence the result.</li>
                <li>Automated sentiment can miss context, nuance, irony, or mixed tone.</li>
                <li>Media sentiment is not investment advice or objective truth.</li>
              </ul>
            </article>
          </section>

          <section className="mt-14 rounded-[1.25rem] border border-blue-100 bg-blue-50/70 p-5 sm:mt-16 sm:p-7">
            <div className="flex items-start gap-3">
              <TagsIcon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <p className="text-sm leading-7 text-slate-700 sm:text-base">
                Tip: selecting an item under <strong>Most mentioned</strong>
                starts a new search for that entity. Sentio keeps the selected
                time window so you can compare related topics consistently.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
