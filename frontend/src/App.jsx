// FILE PATH: frontend/src/App.jsx
// ROOT COMPONENT — wraps the entire application.
// Provides the BrowserRouter context so every page can use React Router.
// All routing logic is delegated to AppRoutes.jsx — keeping this file clean.

import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
