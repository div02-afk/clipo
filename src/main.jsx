import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Suspense } from "react";
import Loader from "./components/loader";
ReactDOM.createRoot(document.getElementById("root")).render(
  <Suspense fallback={<Loader />}>
    <App />
  </Suspense>
);
