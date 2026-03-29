import { Suspense, lazy } from "react";
import Loading from "@/pages/Loading";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout";
const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

const NotFound = lazy(() => import("@/pages/static/NotFound"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="results" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
    </Suspense>

  );
}