import { config } from "./src/config/index.ts";

// ============================================================================
// Application startup
// ============================================================================

console.log("CLI started successfully!");
console.log("Complete configuration loaded:");
console.log(JSON.stringify(config, null, 2));
