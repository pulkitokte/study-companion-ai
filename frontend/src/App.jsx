// FILE PATH: frontend/src/App.jsx
// REPLACES existing App.jsx
// Adds ToastProvider globally so any component can fire toasts.

import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
