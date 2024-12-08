import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider, BaseStyles } from "@primer/react";
import { Options } from "./pages/Options";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <ThemeProvider colorMode="dark">
      <BaseStyles>
        <Options />
      </BaseStyles>
    </ThemeProvider>
  </React.StrictMode>,
);
