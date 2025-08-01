import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Safe root mounting with error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found! Make sure there's a div with id='root' in your HTML.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("✅ XPSwap React app mounted successfully");
  } catch (error) {
    console.error("❌ Failed to mount React app:", error);
    // Fallback: show a basic error message
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial;">
        <h2>XPSwap Loading Error</h2>
        <p>Failed to load the application. Please refresh the page.</p>
        <p style="color: red; font-size: 12px;">Error: ${error}</p>
      </div>
    `;
  }
}
