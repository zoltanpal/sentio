import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { UserSessionProvider } from "@/auth/UserSessionContext";
import { AuthProvider } from "@/auth/AuthContext";
import ScrollToTop from "./hooks/ScrollToTop";

import AppLayout from "@/components/layout/Layout";
import Loading from "@/pages/Loading";
import Dashboard from "@/pages/Dashboard";


const Register = lazy(() => import("@/pages/Register"));
const Login = lazy(() => import("@/pages/Login"));
const Home = lazy(() => import("@/pages/Home"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Help = lazy(() => import("@/pages/Help"));
const Sources = lazy(() => import("@/pages/Sources"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const Watchlist = lazy(() => import("@/pages/Watchlist"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <AuthProvider>
      <UserSessionProvider>
        <Suspense fallback={<Loading />}>
          <ScrollToTop />
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="statistics" element={<Statistics />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="help" element={<Help />} />
                <Route path="sources" element={<Sources />} />
                <Route path="watchlist" element={<Watchlist />} />
                <Route path="register" element={<Register />} />
                <Route path="login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
        </Suspense>
    </UserSessionProvider>
    </AuthProvider>
  );
}
