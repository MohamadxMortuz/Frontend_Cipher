import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

// Optimize initial render
const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

// Add loading indicator while JS loads
root.innerHTML = '<div style="height:100vh;display:flex;align-items:center;justify-content:center;background:var(--auth-bg)"><div class="spinner"></div></div>';

// Render app
createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  </StrictMode>
);