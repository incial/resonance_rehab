import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/globals.css";
import App from "./App.jsx";

const rawBase = (import.meta && import.meta.env && import.meta.env.BASE_URL)
  ? import.meta.env.BASE_URL
  : "/";
const basename = rawBase.replace(/\/$/, "") || "/";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
