import { Suspense, lazy } from "react";
import Loading from "@/pages/Loading";
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/Layout";
import ScrollToTop from "./hooks/ScrollToTop";
const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Help = lazy(() => import("@/pages/Help"));
const Sources = lazy(() => import("@/pages/Sources"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
          <Route path="sources" element={<Sources />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
    </Suspense>

  );
}
