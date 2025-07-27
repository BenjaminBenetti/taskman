import React from "react";
import { render } from "ink";
import { AuthPage } from "./src/ui/pages/auth/auth-method-select-page.tsx";
import { DashboardLayout } from "./src/ui/components/dashboard-layout.component.tsx";
import { AuthServiceFactory } from "./src/auth/factories/auth-service.factory.ts";

// ================================================
// Application startup
// ================================================

async function main() {
  // Check if user is authenticated using the factory
  const isAuthenticated = await AuthServiceFactory.isAuthenticated();
  
  if (!isAuthenticated) {
    // Show authentication page
    render(React.createElement(AuthPage));
  } else {
    // User is authenticated, show dashboard
    const session = await AuthServiceFactory.getCurrentSession();
    console.log("CLI started successfully!");
    console.log(`Welcome back, ${session?.name || session?.email}!`);
    console.log(`Provider: ${AuthServiceFactory.getCurrentProvider()}`);
    
    // Start the main dashboard interface
    render(React.createElement(DashboardLayout));
  }
}

main();
