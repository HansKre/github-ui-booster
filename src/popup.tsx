import React from "react";
import { createRoot } from "react-dom/client";
import { Content } from "./popup/Content";
import "./styles.scss";
import { ThemeProvider } from "@primer/react";

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <ThemeProvider colorMode="dark">
      <Content />
    </ThemeProvider>
  </React.StrictMode>,
);
