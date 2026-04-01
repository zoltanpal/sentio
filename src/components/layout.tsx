import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const routeTitleMap: Record<string, string> = {
  "/": "Home",
  "/results": "Dashboard",
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
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="fixed top-0 z-10 w-full"></header>

      <main className="flex-1 pt-2">
        <Outlet context={{ pageTitle }} />
      </main>

      <footer className="bg-gray-100 py-2">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-3">
          <div className="text-center">
            <a href="/" className="inline-block text-blue-500 hover:underline">
              Home
            </a>
            &nbsp;&bull;&nbsp;
            <a href="/about" className="inline-block text-blue-500 hover:underline">
              About
            </a>
            &nbsp;&bull;&nbsp;
            <a href="/contact" className="inline-block text-blue-500 hover:underline">
              Contact
            </a>
            <p className="mt-2 text-center text-muted-foreground">
              &copy; {new Date().getFullYear()} Sentio. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 