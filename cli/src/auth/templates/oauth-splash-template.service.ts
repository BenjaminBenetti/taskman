/**
 * OAuth Splash Template Service
 * 
 * Generates styled HTML templates for OAuth authentication success and error pages.
 * Provides clean, modern UI with auto-close functionality and accessibility features.
 */
export class OAuthSplashTemplateService {
  
  /**
   * Generate a styled success page with terminal aesthetic
   * 
   * @param message Optional custom success message
   * @returns Complete HTML page as string
   */
  public generateSuccessPage(message = "Authentication successful!"): string {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Successful - TaskMan</title>
    <style>
        :root {
            --taskman-red: #FF3366;
            --taskman-yellow: #FFCC00;
            --taskman-green: #00FF66;
            --taskman-blue: #3366FF;
            --terminal-bg: #0A0A0A;
            --terminal-fg: #E5E5E5;
            --terminal-border: #333333;
            --terminal-success: #00FF66;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', 'Monaco', 'Menlo', 'DejaVu Sans Mono', monospace;
            background: var(--terminal-bg);
            color: var(--terminal-fg);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1.4;
            padding: 1rem;
        }
        
        .container {
            background: var(--terminal-bg);
            border: 2px solid var(--terminal-border);
            max-width: 600px;
            width: 100%;
            position: relative;
        }
        
        .terminal-header {
            background: var(--terminal-border);
            padding: 0.5rem 1rem;
            border-bottom: 1px solid var(--terminal-border);
            font-size: 0.8rem;
            color: var(--terminal-fg);
        }
        
        .terminal-content {
            padding: 2rem;
            font-size: 0.9rem;
        }
        
        .status-line {
            margin-bottom: 1.5rem;
            font-weight: bold;
        }
        
        .success-icon {
            color: var(--terminal-success);
            display: inline;
        }
        
        .auth-status {
            color: var(--terminal-success);
            margin-left: 0.5rem;
        }
        
        .separator {
            border-top: 1px solid var(--terminal-border);
            margin: 1.5rem 0;
        }
        
        .message {
            margin-bottom: 1.5rem;
            color: var(--terminal-fg);
        }
        
        
        
        @media (max-width: 480px) {
            .container {
                margin: 0.5rem;
                width: 90%;
            }
            
            .terminal-content {
                padding: 1.5rem;
            }
            
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="terminal-header">
        </div>
        <div class="terminal-content">
            <div class="status-line">
                <span class="success-icon" role="img" aria-label="Success checkmark">[✓]</span>
                <span class="auth-status">Taskman AUTHENTICATED</span>
            </div>
            
            <div class="separator"></div>
            
            <div class="message">${this.sanitizeHtml(message)}</div>
            
            
        </div>
    </div>
    
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Generate a styled error page with proper error message display
   * 
   * @param error Error message to display
   * @param description Optional detailed error description
   * @returns Complete HTML page as string
   */
  public generateErrorPage(error: string, description?: string): string {
    const sanitizedError = this.sanitizeHtml(error);
    const sanitizedDescription = description ? this.sanitizeHtml(description) : '';
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Error - TaskMan</title>
    <style>
        :root {
            --taskman-red: #FF3366;
            --taskman-yellow: #FFCC00;
            --taskman-green: #00FF66;
            --taskman-blue: #3366FF;
            --terminal-bg: #0A0A0A;
            --terminal-fg: #E5E5E5;
            --terminal-border: #333333;
            --terminal-error: #FF3366;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', 'Monaco', 'Menlo', 'DejaVu Sans Mono', monospace;
            background: var(--terminal-bg);
            color: var(--terminal-fg);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1.4;
            padding: 1rem;
        }
        
        .container {
            background: var(--terminal-bg);
            border: 2px solid var(--terminal-border);
            max-width: 650px;
            width: 100%;
            position: relative;
        }
        
        .terminal-header {
            background: var(--terminal-border);
            padding: 0.5rem 1rem;
            border-bottom: 1px solid var(--terminal-border);
            font-size: 0.8rem;
            color: var(--terminal-fg);
        }
        
        .terminal-content {
            padding: 2rem;
            font-size: 0.9rem;
        }
        
        .status-line {
            margin-bottom: 1.5rem;
            font-weight: bold;
        }
        
        .error-icon {
            color: var(--terminal-error);
            display: inline;
        }
        
        .auth-status {
            color: var(--terminal-error);
            margin-left: 0.5rem;
        }
        
        .separator {
            border-top: 1px solid var(--terminal-border);
            margin: 1.5rem 0;
        }
        
        .error-message {
            color: var(--terminal-error);
            margin-bottom: 1rem;
            font-weight: bold;
        }
        
        .error-description {
            background: rgba(51, 51, 51, 0.3);
            border: 1px solid var(--terminal-border);
            border-left: 3px solid var(--terminal-error);
            padding: 1rem;
            margin-bottom: 1.5rem;
            color: var(--terminal-fg);
        }
        
        
        .help-text {
            border-top: 1px solid var(--terminal-border);
            padding-top: 1rem;
            margin-top: 1.5rem;
            color: #888;
            font-size: 0.8rem;
        }
        
        @media (max-width: 480px) {
            .container {
                margin: 0.5rem;
                width: 90%;
            }
            
            .terminal-content {
                padding: 1.5rem;
            }
            
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="terminal-header">
        </div>
        <div class="terminal-content">
            <div class="status-line">
                <span class="error-icon" role="img" aria-label="Error icon">[✗]</span>
                <span class="auth-status">FAILED</span>
            </div>
            
            <div class="separator"></div>
            
            <div class="error-message" role="alert">${sanitizedError}</div>
            ${sanitizedDescription ? `<div class="error-description">${sanitizedDescription}</div>` : ''}
            
            
            <div class="help-text">
                If you continue to experience issues, please return to your terminal for more options.
            </div>
        </div>
    </div>
    
</body>
</html>`;
    
    return html;
  }
  
  /**
   * Sanitize HTML content to prevent XSS attacks
   * 
   * @param input Raw input string that may contain HTML
   * @returns Sanitized string safe for HTML output
   */
  private sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}