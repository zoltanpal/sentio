import { Suspense, lazy } from "react";
import Loading from "@/pages/Loading";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout";

const NotFound = lazy(() => import("@/pages/static/NotFound"));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Layout />}>
        <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      
    </Suspense>


    // <div className="App">
    //   <h1 className="text-3xl font-bold underline">
    //     What is the news saying right now?
    //   </h1>
    //   <h4 className="text-lg text-gray-600">
    //     Search any topic and instantly see the tone of recent news coverage.
    //   </h4>
    //   <div className="mt-4">

    //   </div>
    //   <div className="mt-6">
    //     <label>Waiting for the good stuff ...</label>
    //   </div>
    // </div>
  );
}