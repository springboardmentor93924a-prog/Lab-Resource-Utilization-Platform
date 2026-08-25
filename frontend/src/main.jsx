import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import "./bootstrap-lite.css";

import App from "./App.jsx";
import { SettingsProvider } from "./context/SettingsProvider";


createRoot(document.getElementById("root")).render(
  <StrictMode>

    <SettingsProvider>
      <App />
    </SettingsProvider>

  </StrictMode>
);