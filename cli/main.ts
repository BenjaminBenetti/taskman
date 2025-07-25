import React from "react";
import { render } from "ink";
import { AuthPage } from "./src/ui/pages/auth-page.tsx";
import { AuthServiceFactory } from "./src/auth/factories/auth-service.factory.ts";

// ============================================================================
// Application startup
// ============================================================================

async function main() {
  // Check if user is authenticated using the factory
  const isAuthenticated = await AuthServiceFactory.isAuthenticated();
  
  if (!isAuthenticated) {
    // Show authentication page
    render(React.createElement(AuthPage));
  } else {
    // User is authenticated, continue with main application
    const session = await AuthServiceFactory.getCurrentSession();
    console.log("CLI started successfully!");
    console.log(`Welcome back, ${session?.name || session?.email}!`);
    console.log(`Provider: ${AuthServiceFactory.getCurrentProvider()}`);
    // TODO: Show main application interface
  }
}

main();
