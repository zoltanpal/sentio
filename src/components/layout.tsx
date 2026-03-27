import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

const routeTitleMap: Record<string, string> = {
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
      <div className="flex w-full min-h-screen flex-col bg-gray-50">
        <header
          className="fixed top-0 z-10 w-full"
        >
        </header>  
        <main className="flex-1 overflow-y-auto pt-10">
          <Outlet context={{ pageTitle }} />
        </main>
        <footer className="bg-gray-100 py-2">
          <div className="container mx-auto px-4 py-3 gap-4 flex flex-col items-center">
            <div className="text-center">
              <a href="/" className="text-blue-500 hover:underline inline-block">
                Home
              </a>&nbsp;|&nbsp;
              <a href="/about" className="text-blue-500 hover:underline inline-block">
                About
              </a>
            
              <p className="text-center text-muted-foreground mt-2">
                &copy; {new Date().getFullYear()} Sentio. All rights reserved.
              </p>
             </div>
          </div>
        </footer>
      </div>
  );
} 