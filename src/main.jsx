import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { CssBaseline } from "@mui/material";
import { ColorModeProvider } from "./context/ColorModeContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ColorModeProvider>
        <CssBaseline />
        <App />
      </ColorModeProvider>
    </LocalizationProvider>
  </React.StrictMode>
);
