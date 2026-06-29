import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import { enableMocking } from "./mocks";
import "./styles/index.css";

async function bootstrap() {
  await enableMocking();

  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();
