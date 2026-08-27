import { Link } from "react-router-dom";
import { MainNavigationMenu } from "@/components/layout/RightSimpleNav";
import { getSearchSession } from "@/lib/searchSession";

export default function Header() {
  const session = getSearchSession();

  let homeUrl = "/";
  if (session) {
    homeUrl = "/results";
  }

  return (
    <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
      
      <div className="flex items-center justify-between gap-4">
        <Link to={homeUrl} className="flex items-center gap-2 sm:gap-2" title={session ? "Go back to your last search" : "Start a new search"}>
          <img
            src="/logo/sentio_logo.png"
            alt="Sentio Logo"
            className="w-60 sm:w-32 md:w-64"
          />
        </Link>
      </div>

      <div className="w-full md:w-auto">
        <MainNavigationMenu />
      </div>
    </div>
  );
}
