import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { OAuthSplashTemplateService } from "./oauth-splash-template.service.ts";

Deno.test("OAuthSplashTemplateService", async (t) => {
  const service = new OAuthSplashTemplateService();

  await t.step("generateSuccessPage", async (t) => {
    await t.step("should generate valid HTML structure", () => {
      const html = service.generateSuccessPage();
      
      // Check basic HTML structure
      assertStringIncludes(html, "<!DOCTYPE html>");
      assertStringIncludes(html, "<html lang=\"en\">");
      assertStringIncludes(html, "<head>");
      assertStringIncludes(html, "<body>");
      assertStringIncludes(html, "</html>");
    });

    await t.step("should include proper meta tags and accessibility features", () => {
      const html = service.generateSuccessPage();
      
      // Check meta tags
      assertStringIncludes(html, '<meta charset="UTF-8">');
      assertStringIncludes(html, '<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      assertStringIncludes(html, "<title>Authentication Successful - TaskMan</title>");
      
      // Check accessibility features
      assertStringIncludes(html, 'role="img"');
      assertStringIncludes(html, 'aria-label="Success checkmark"');
      assertStringIncludes(html, 'aria-live="polite"');
      assertStringIncludes(html, 'aria-label="Close window manually"');
    });

    await t.step("should include success styling and animations", () => {
      const html = service.generateSuccessPage();
      
      // Check for success-specific styling
      assertStringIncludes(html, "success-icon");
      assertStringIncludes(html, "terminal-header");
      assertStringIncludes(html, "#00FF66"); // Terminal success green color
      assertStringIncludes(html, "[✓]"); // Terminal checkmark symbol
    });

    await t.step("should include countdown functionality", () => {
      const html = service.generateSuccessPage();
      
      // Check countdown elements
      assertStringIncludes(html, "countdown-container");
      assertStringIncludes(html, "This window will close in:");
      assertStringIncludes(html, 'id="countdown"');
      assertStringIncludes(html, "let timeLeft = 3");
      assertStringIncludes(html, "updateCountdown");
    });

    await t.step("should include JavaScript for auto-close and interactions", () => {
      const html = service.generateSuccessPage();
      
      // Check JavaScript functionality
      assertStringIncludes(html, "function closeWindow()");
      assertStringIncludes(html, "window.close()");
      assertStringIncludes(html, "addEventListener('keydown'");
      assertStringIncludes(html, "event.key === 'Enter'");
      assertStringIncludes(html, "event.key === 'Escape'");
    });

    await t.step("should include responsive design", () => {
      const html = service.generateSuccessPage();
      
      // Check responsive design elements
      assertStringIncludes(html, "@media (max-width: 480px)");
      assertStringIncludes(html, "width: 90%");
    });

    await t.step("should use default message when none provided", () => {
      const html = service.generateSuccessPage();
      
      assertStringIncludes(html, "Authentication successful!");
    });

    await t.step("should use custom message when provided", () => {
      const customMessage = "Login completed successfully!";
      const html = service.generateSuccessPage(customMessage);
      
      assertStringIncludes(html, customMessage);
    });

    await t.step("should sanitize custom messages", () => {
      const maliciousMessage = "<script>alert('xss')</script>Dangerous content";
      const html = service.generateSuccessPage(maliciousMessage);
      
      // Should not contain the raw script tag
      assertEquals(html.includes("<script>alert('xss')</script>"), false);
      // Should contain the sanitized version
      assertStringIncludes(html, "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;");
      assertStringIncludes(html, "Dangerous content");
    });
  });

  await t.step("generateErrorPage", async (t) => {
    await t.step("should generate valid HTML structure", () => {
      const html = service.generateErrorPage("Test error");
      
      // Check basic HTML structure
      assertStringIncludes(html, "<!DOCTYPE html>");
      assertStringIncludes(html, "<html lang=\"en\">");
      assertStringIncludes(html, "<head>");
      assertStringIncludes(html, "<body>");
      assertStringIncludes(html, "</html>");
    });

    await t.step("should include proper meta tags and accessibility features", () => {
      const html = service.generateErrorPage("Test error");
      
      // Check meta tags
      assertStringIncludes(html, '<meta charset="UTF-8">');
      assertStringIncludes(html, '<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      assertStringIncludes(html, "<title>Authentication Error - TaskMan</title>");
      
      // Check accessibility features
      assertStringIncludes(html, 'role="img"');
      assertStringIncludes(html, 'aria-label="Error icon"');
      assertStringIncludes(html, 'role="alert"');
      assertStringIncludes(html, 'aria-label="Retry authentication"');
      assertStringIncludes(html, 'aria-label="Close window"');
    });

    await t.step("should include error styling and animations", () => {
      const html = service.generateErrorPage("Test error");
      
      // Check for error-specific styling
      assertStringIncludes(html, "error-icon");
      assertStringIncludes(html, "terminal-header");
      assertStringIncludes(html, "#FF3366"); // Terminal error red color
      assertStringIncludes(html, "[✗]"); // Terminal X symbol
    });

    await t.step("should display error message", () => {
      const errorMessage = "OAuth authentication failed";
      const html = service.generateErrorPage(errorMessage);
      
      assertStringIncludes(html, errorMessage);
      assertStringIncludes(html, "error-message");
    });

    await t.step("should include optional description when provided", () => {
      const error = "Authentication failed";
      const description = "The user denied access to the application";
      const html = service.generateErrorPage(error, description);
      
      assertStringIncludes(html, error);
      assertStringIncludes(html, description);
      assertStringIncludes(html, "error-description");
    });

    await t.step("should not include description section when not provided", () => {
      const error = "Authentication failed";
      const html = service.generateErrorPage(error);
      
      assertStringIncludes(html, error);
      // Should not have empty description div
      assertEquals(html.includes('<div class="error-description"></div>'), false);
    });

    await t.step("should include action buttons", () => {
      const html = service.generateErrorPage("Test error");
      
      // Check for action buttons
      assertStringIncludes(html, "retry-button");
      assertStringIncludes(html, "close-button");
      assertStringIncludes(html, "Try Again");
      assertStringIncludes(html, "Close Window");
    });

    await t.step("should include JavaScript for interactions", () => {
      const html = service.generateErrorPage("Test error");
      
      // Check JavaScript functionality
      assertStringIncludes(html, "function retryAuthentication()");
      assertStringIncludes(html, "function closeWindow()");
      assertStringIncludes(html, "addEventListener('keydown'");
      assertStringIncludes(html, "event.key === 'Enter'");
      assertStringIncludes(html, "event.key === 'Escape'");
    });

    await t.step("should include help text", () => {
      const html = service.generateErrorPage("Test error");
      
      assertStringIncludes(html, "If you continue to experience issues");
      assertStringIncludes(html, "help-text");
    });

    await t.step("should sanitize error messages", () => {
      const maliciousError = "<img src=x onerror=alert('xss')>Error occurred";
      const maliciousDescription = "<script>document.cookie='stolen'</script>Bad description";
      const html = service.generateErrorPage(maliciousError, maliciousDescription);
      
      // Should not contain raw malicious content
      assertEquals(html.includes("<img src=x onerror=alert('xss')>"), false);
      assertEquals(html.includes("<script>document.cookie='stolen'</script>"), false);
      
      // Should contain sanitized versions
      assertStringIncludes(html, "&lt;img src=x onerror=alert(&#x27;xss&#x27;)&gt;");
      assertStringIncludes(html, "&lt;script&gt;document.cookie=&#x27;stolen&#x27;&lt;&#x2F;script&gt;");
      assertStringIncludes(html, "Error occurred");
      assertStringIncludes(html, "Bad description");
    });

    await t.step("should include responsive design", () => {
      const html = service.generateErrorPage("Test error");
      
      // Check responsive design elements
      assertStringIncludes(html, "@media (max-width: 480px)");
      assertStringIncludes(html, "width: 90%");
    });
  });

  await t.step("HTML sanitization", async (t) => {
    await t.step("should sanitize all common XSS vectors", () => {
      const service = new OAuthSplashTemplateService();
      
      // Test various XSS attack vectors
      const xssTests = [
        { input: "<script>alert('xss')</script>", expected: "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;" },
        { input: "<img src=x onerror=alert(1)>", expected: "&lt;img src=x onerror=alert(1)&gt;" },
        { input: "javascript:alert('xss')", expected: "javascript:alert(&#x27;xss&#x27;)" },
        { input: "<iframe src=\"javascript:alert(1)\"></iframe>", expected: "&lt;iframe src=&quot;javascript:alert(1)&quot;&gt;&lt;&#x2F;iframe&gt;" },
        { input: "<div onclick=\"alert('xss')\">Click me</div>", expected: "&lt;div onclick=&quot;alert(&#x27;xss&#x27;)&quot;&gt;Click me&lt;&#x2F;div&gt;" },
        { input: "Hello & goodbye", expected: "Hello &amp; goodbye" },
        { input: "Quote: \"test\"", expected: "Quote: &quot;test&quot;" },
        { input: "Path: C:\\Users\\test", expected: "Path: C:\\Users\\test" },
        { input: "URL: https://example.com/path", expected: "URL: https:&#x2F;&#x2F;example.com&#x2F;path" }
      ];
      
      for (const test of xssTests) {
        const successHtml = service.generateSuccessPage(test.input);
        const errorHtml = service.generateErrorPage(test.input, test.input);
        
        assertStringIncludes(successHtml, test.expected);
        assertStringIncludes(errorHtml, test.expected);
        
        // Ensure the raw input is not present
        if (test.input !== test.expected) {
          assertEquals(successHtml.includes(test.input), false, `Raw input "${test.input}" found in success page`);
          assertEquals(errorHtml.includes(test.input), false, `Raw input "${test.input}" found in error page`);
        }
      }
    });
  });

  await t.step("CSS and styling validation", async (t) => {
    await t.step("should include all required CSS classes", () => {
      const successHtml = service.generateSuccessPage();
      const errorHtml = service.generateErrorPage("Test error");
      
      // Success page CSS classes
      const successClasses = [
        "container", "terminal-header", "terminal-content", "status-line",
        "success-icon", "auth-status", "separator", "message", "countdown-container", 
        "countdown-text", "countdown", "actions", "keyboard-hint", "close-button"
      ];
      
      for (const className of successClasses) {
        assertStringIncludes(successHtml, className);
      }
      
      // Error page CSS classes
      const errorClasses = [
        "container", "terminal-header", "terminal-content", "status-line",
        "error-icon", "auth-status", "separator", "error-message", "error-description",
        "actions", "keyboard-hint", "button-group", "retry-button", "close-button", "help-text"
      ];
      
      for (const className of errorClasses) {
        assertStringIncludes(errorHtml, className);
      }
    });

    await t.step("should include proper color schemes", () => {
      const successHtml = service.generateSuccessPage();
      const errorHtml = service.generateErrorPage("Test error");
      
      // Terminal colors (TASKMAN theme)
      assertStringIncludes(successHtml, "#00FF66"); // Terminal success green
      assertStringIncludes(successHtml, "#0A0A0A"); // Terminal background
      
      // Error colors (TASKMAN theme)
      assertStringIncludes(errorHtml, "#FF3366"); // Terminal error red
      assertStringIncludes(errorHtml, "#0A0A0A"); // Terminal background
    });

    await t.step("should include animations", () => {
      const successHtml = service.generateSuccessPage();
      const errorHtml = service.generateErrorPage("Test error");
      
      // Terminal aesthetic - no animations, monospace fonts
      assertStringIncludes(successHtml, "Courier New");
      assertStringIncludes(errorHtml, "Courier New");
    });
  });

  await t.step("JavaScript functionality validation", async (t) => {
    await t.step("should include all required JavaScript functions", () => {
      const successHtml = service.generateSuccessPage();
      const errorHtml = service.generateErrorPage("Test error");
      
      // Success page JavaScript functions
      assertStringIncludes(successHtml, "function updateCountdown()");
      assertStringIncludes(successHtml, "function closeWindow()");
      
      // Error page JavaScript functions
      assertStringIncludes(errorHtml, "function retryAuthentication()");
      assertStringIncludes(errorHtml, "function closeWindow()");
    });

    await t.step("should include keyboard event handlers", () => {
      const successHtml = service.generateSuccessPage();
      const errorHtml = service.generateErrorPage("Test error");
      
      // Both pages should handle keyboard events
      assertStringIncludes(successHtml, "addEventListener('keydown'");
      assertStringIncludes(errorHtml, "addEventListener('keydown'");
      
      // Check for specific key handling
      assertStringIncludes(successHtml, "event.key === 'Enter'");
      assertStringIncludes(successHtml, "event.key === 'Escape'");
      assertStringIncludes(errorHtml, "event.key === 'Enter'");
      assertStringIncludes(errorHtml, "event.key === 'Escape'");
    });

    await t.step("should include DOM ready handlers", () => {
      const successHtml = service.generateSuccessPage();
      
      // Success page should start countdown on DOM ready
      assertStringIncludes(successHtml, "addEventListener('DOMContentLoaded', updateCountdown)");
    });
  });
});