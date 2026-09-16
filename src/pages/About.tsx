import Header from "@/components/layout/Header";
import { Separator } from "@/components/shared/ui/separator";

export default function About() {
  return (
    <div className="mx-auto w-full">
      <section className="mx-auto max-w-7xl px-2 py-3">
        <Header />

        <Separator className="my-2" />
      <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Turn news into signal, not noise.
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Sentio helps you quickly understand how companies, topics, and trends
            are being talked about across recent news. Instead of manually reading
            dozens of headlines, you get a fast view of the overall sentiment,
            distribution, recent changes, and the stories driving the conversation.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="text-sm font-medium text-red-800">Fast insight</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
              In seconds
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Search a topic and get an instant overview of recent sentiment.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <div className="text-sm font-medium text-blue-800">Clear signals</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
              Positive, negative, mixed
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Understand the tone behind the headlines without digging through
              everything manually.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="text-sm font-medium text-green-800">Useful direction</div>
            <div className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
              Built from the MVP up
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Focused on the core experience today, with room to grow deeper over
              time.
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-10 sm:mt-14 sm:space-y-12">
          <section>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              What Sentio does
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Sentio analyzes recent news coverage and helps you answer practical
              questions fast. What is the current sentiment around a company or
              topic? Is the tone improving, worsening, or staying stable? Are
              headlines mostly positive, negative, or mixed? Which recent articles
              are shaping the conversation?
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              The goal is not to replace human judgment, but to make it much
              faster to spot patterns and react to them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Why Sentio exists
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              News moves quickly, and perception moves even faster. For founders,
              analysts, communications teams, researchers, and curious readers,
              understanding the tone behind the headlines can be just as important
              as the headlines themselves.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Sentio was built to make that understanding immediate, visual, and
              accessible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Built for clarity
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-green-100 p-5">
                <h3 className="font-medium text-slate-900">Fast search</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Find topics quickly and get immediate results.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-red-100 p-5">
                <h3 className="font-medium text-slate-900">
                  Clear sentiment summaries
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  See the overall tone without extra complexity.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-teal-100 p-5">
                <h3 className="font-medium text-slate-900">
                  Recent headline analysis
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Understand what recent coverage is really saying.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-purple-100 p-5">
                <h3 className="font-medium text-slate-900">
                  Readable trend signals
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Spot whether sentiment is improving, worsening, or stable.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Early version, clear direction
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              <b>Sentio</b> is currently in its MVP stage. Right now, the product
              focuses on the core experience: searching topics, analyzing recent
              headlines, and presenting sentiment in a clean and useful way.
            </p>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Over time, it can grow with deeper trend analysis, stronger entity
              understanding, richer filtering, and broader historical views. But
              the main idea stays the same:
            </p>

            <div className="mt-6 rounded-2xl bg-green-100 px-5 py-4 sm:px-6">
              <p className="text-lg font-semibold leading-7 text-white sm:text-2xl sm:leading-8">
                Help people understand the mood behind the news, in seconds.
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
