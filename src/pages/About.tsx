import { MainNavigationMenu } from "@/components/layout/nav";
import { Separator } from "@/components/shared/ui/separator"


export default function NotFound() {
    return (
        <div className="mx-auto w-full ">
            <section className="mx-auto max-w-4xl sm:px-4 sm:py-10 lg:px-10">
               
               <div className="grid items-end gap-4 md:grid-cols-[1fr_auto] items-center justify-between">
                    <div className="flex justify-between">
                        <div className="pb-4 items-center">
                            <a href="/" className="flex items-center gap-2 sm:gap-4">
                                <img
                                    src="/logo.png"
                                    alt="Sentio Logo"
                                    className="w-10 sm:w-14 md:w-16"
                                />
                                <h1 className="font-bold tracking-tight sm:text-4xl md:text-5xl">
                                    Sentio
                                </h1>
                            </a>
                        </div>
                        <div className="md:flex items-bottom">
                            <MainNavigationMenu></MainNavigationMenu>
                        </div>
                    </div>
                </div>
                <Separator className="mb-5" />

                <div className="mb-10">
                    <h1
                        className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl"
                    >
                        Turn news into signal, not noise.
                    </h1>

                    <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                        Sentio helps you quickly understand how companies, topics, and trends
                        are being talked about across recent news. Instead of manually reading
                        dozens of headlines, you get a fast view of the overall sentiment,
                        distribution, recent changes, and the stories driving the conversation.
                    </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <div className="text-sm font-medium text-red-800">Fast insight</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">
                        In seconds
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                        Search a topic and get an instant overview of recent sentiment.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <div className="text-sm font-medium text-blue-800">Clear signals</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">
                        Positive, negative, mixed
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                        Understand the tone behind the headlines without digging through
                        everything manually.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <div className="text-sm font-medium text-green-800">Useful direction</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-900">
                        Built from the MVP up
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">
                        Focused on the core experience today, with room to grow deeper over
                        time.
                        </p>
                    </div>
                    </div>

                    <div className="mt-14 space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        What Sentio does
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                        Sentio analyzes recent news coverage and helps you answer practical
                        questions fast. What is the current sentiment around a company or
                        topic? Is the tone improving, worsening, or staying stable? Are
                        headlines mostly positive, negative, or mixed? Which recent articles
                        are shaping the conversation?
                        </p>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                        The goal is not to replace human judgment, but to make it much
                        faster to spot patterns and react to them.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Why Sentio exists
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                        News moves quickly, and perception moves even faster. For founders,
                        analysts, communications teams, researchers, and curious readers,
                        understanding the tone behind the headlines can be just as important
                        as the headlines themselves.
                        </p>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                        Sentio was built to make that understanding immediate, visual, and
                        accessible.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Built for clarity
                        </h2>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border bg-green-100 border-slate-200 p-5">
                            <h3 className="font-medium text-slate-900">Fast search</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                            Find topics quickly and get immediate results.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-red-100 border-slate-200 p-5">
                            <h3 className="font-medium text-slate-900">Clear sentiment summaries</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                            See the overall tone without extra complexity.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-teal-100 border-slate-200 p-5">
                            <h3 className="font-medium text-slate-900">Recent headline analysis</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                            Understand what recent coverage is really saying.
                            </p>
                        </div>

                        <div className="rounded-2xl border bg-purple-100 border-slate-200 p-5">
                            <h3 className="font-medium text-slate-900">Readable trend signals</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                            Spot whether sentiment is improving, worsening, or stable.
                            </p>
                        </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Early version, clear direction
                        </h2>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                        <b>Sentio</b> is currently in its MVP stage. Right now, the product focuses
                        on the core experience: searching topics, analyzing recent
                        headlines, and presenting sentiment in a clean and useful way.
                        </p>
                        <p className="mt-4 text-base leading-7 text-slate-600">
                        Over time, it can grow with deeper trend analysis, stronger entity
                        understanding, richer filtering, and broader historical views. But
                        the main idea stays the same:
                        </p>

                        <div className="mt-6 rounded-2xl px-6 py-4 text-white">
                        <p className="text-xl font-semibold text-white leading-8 sm:text-2xl">
                            Help people understand the mood behind the news, in seconds.
                        </p>
                        </div>
                    </section>
                    </div>
                </section>
            
        </div>
    );
  }