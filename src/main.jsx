import React from "react";
import ReactDOM from "react-dom/client";
import { installStorageShim } from "./storageShim.js";
import App from "./App.jsx";

installStorageShim();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
