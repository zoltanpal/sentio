import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Footer from "./Footer";

const routeTitleMap: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/statistics": "Statistics",
  "/about": "About",
  "/help": "Help",
  "/contact": "Contact",
  "/sources": "Sources",
  "/privacy": "Privacy Policy",
};


export default function Layout() {
  const location = useLocation();
  const pageTitle = routeTitleMap[location.pathname] || "Page Not Found";
  const metaTitle = pageTitle;

  useEffect(() => {
    document.title = `${metaTitle} | Sentio`;
  }, [metaTitle]);


  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="fixed top-0 z-10 w-full"></header>

      <main className="flex-1 pb-10">
        <Outlet context={{ pageTitle }} />
      </main>

      <div className="mx-auto w-full">
        <Footer />
      </div>
      
    </div>
  );
} 
