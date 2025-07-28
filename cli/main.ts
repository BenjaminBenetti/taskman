import React from "react";
import { render } from "ink";
import { App } from "./src/ui/app.tsx";

// ================================================
// Application startup
// ================================================

async function main() {
  // Render the main app component which handles page state
  render(React.createElement(App));
}

main();
