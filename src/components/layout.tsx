import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppNavbar } from "@/components/navbar";

const routeTitleMap: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/tech_stack": "Tech Stack",
  "/contact": "Contact",
};


export default function Layout() {
  const location = useLocation();
  const pageTitle = routeTitleMap[location.pathname] || "Page Not Found";
  const metaTitle = pageTitle

  useEffect(() => {
    document.title = `${metaTitle} | Sentio`;
  }, [metaTitle]);


  return (
      <div className="flex w-full min-h-screen flex-col">
        <header
          className="fixed top-0 z-10 w-full bg-white "
        >
          <AppNavbar />
        </header>  
        <main className="flex-1 overflow-y-auto pt-20">
          <Outlet context={{ pageTitle }} />
        </main>
      </div>
  );
} 