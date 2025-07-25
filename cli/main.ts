import React from "react";
import { render } from "ink";
import { AuthPage } from "./src/ui/pages/auth-page.tsx";

// ============================================================================
// Application startup
// ============================================================================

function main() {
  //const authService = new BaseAuthService(config.session);
  
  // Check if user is authenticated
  const isAuthenticated = false // await authService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Show authentication page
    render(React.createElement(AuthPage));
  } else {
    // User is authenticated, continue with main application
    console.log("CLI started successfully!");
    console.log("User is authenticated");
    // TODO: Show main application interface
  }
}

main();
