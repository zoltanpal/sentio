import { Link } from "react-router-dom";
import {
  useSearchSession,
} from "@/hooks/useSearchSession";
import { MainNavigationMenu } from "@/components/layout/MainNavigationMenu";

export default function Header() {
  const { getSession } = useSearchSession();

  const session = getSession();

  let homeUrl = "/";
  if (session) {
    homeUrl = "/results";
  }

  return (
    <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
      
      <div className="flex items-center justify-between gap-4">
        <Link to={homeUrl} className="flex items-center gap-2 sm:gap-2">
          <img
            src="/logo.png"
            alt="Sentio Logo"
            className="w-10 sm:w-12 md:w-16"
          />
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">
            Sentio
          </h1>
        </Link>
      </div>

      <div className="w-full md:w-auto">
        <MainNavigationMenu />
      </div>
    </div>
  );
}