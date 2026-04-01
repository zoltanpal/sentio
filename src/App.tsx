import { Suspense, lazy } from "react";
import Loading from "@/pages/Loading";
import { Routes, Route } from "react-router-dom";
import AppLayout from "@/components/shared/layout/AppLayout";
const Home = lazy(() => import("@/pages/Home"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));

const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="results" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
    </Suspense>

  );
}
