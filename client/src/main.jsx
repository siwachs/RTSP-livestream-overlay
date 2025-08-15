import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import LivestreamApp from "./LivestreamApp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LivestreamApp />
  </StrictMode>
);
