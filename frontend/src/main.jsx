// FILE PATH: frontend/src/main.jsx
// ENTRY POINT — React mounts the entire app here.
// This file is called automatically by Vite when the dev server starts.
// DO NOT add components or logic here — keep it clean.

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
