import { MainNavigationMenu } from "@/components/layout/nav";
import { Separator } from "@/components/shared/ui/separator";

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
        ...
        </section>

    </div>
  );
}