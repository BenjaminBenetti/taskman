/**
 * OAuth Splash Template Service
 * 
 * Generates styled HTML templates for OAuth authentication success and error pages.
 * Provides clean, modern UI with auto-close functionality and accessibility features.
 */
export class OAuthSplashTemplateService {
  
  /**
   * Generate a styled success page with auto-close countdown
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 3rem 2rem;
            text-align: center;
            max-width: 400px;
            width: 90%;
            position: relative;
            overflow: hidden;
        }
        
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #10b981, #3b82f6);
        }
        
        .success-icon {
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            animation: checkmark-bounce 0.6s ease-out;
        }
        
        .success-icon::after {
            content: '✓';
            color: white;
            font-size: 2.5rem;
            font-weight: bold;
        }
        
        @keyframes checkmark-bounce {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        h1 {
            color: #1f2937;
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .message {
            color: #6b7280;
            font-size: 1rem;
            margin-bottom: 2rem;
        }
        
        .countdown-container {
            background: #f3f4f6;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1.5rem;
        }
        
        .countdown-text {
            color: #374151;
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .countdown {
            font-size: 2rem;
            font-weight: bold;
            color: #10b981;
            font-variant-numeric: tabular-nums;
        }
        
        .close-button {
            background: #10b981;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .close-button:hover {
            background: #059669;
            transform: translateY(-1px);
        }
        
        .close-button:active {
            transform: translateY(0);
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 2rem 1.5rem;
            }
            
            h1 {
                font-size: 1.5rem;
            }
            
            .success-icon {
                width: 60px;
                height: 60px;
            }
            
            .success-icon::after {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="success-icon" role="img" aria-label="Success checkmark"></div>
        <h1>Success!</h1>
        <p class="message">${this.sanitizeHtml(message)}</p>
        <div class="countdown-container">
            <div class="countdown-text">This window will close in:</div>
            <div class="countdown" id="countdown" aria-live="polite">3</div>
        </div>
        <button class="close-button" onclick="closeWindow()" aria-label="Close window manually">
            Close Window
        </button>
    </div>
    
    <script>
        let timeLeft = 3;
        const countdownElement = document.getElementById('countdown');
        
        function updateCountdown() {
            if (timeLeft <= 0) {
                closeWindow();
                return;
            }
            
            countdownElement.textContent = timeLeft;
            timeLeft--;
            setTimeout(updateCountdown, 1000);
        }
        
        function closeWindow() {
            try {
                // Try to close the window/tab
                window.close();
                
                // If window.close() doesn't work (e.g., not opened by script), 
                // show a message to the user
                setTimeout(() => {
                    document.body.innerHTML = \`
                        <div class="container">
                            <div class="success-icon" role="img" aria-label="Success checkmark"></div>
                            <h1>All Done!</h1>
                            <p class="message">You can safely close this browser tab and return to your terminal.</p>
                        </div>
                    \`;
                }, 100);
            } catch (error) {
                console.log('Window close not available:', error);
            }
        }
        
        // Start the countdown when the page loads
        document.addEventListener('DOMContentLoaded', updateCountdown);
        
        // Handle keyboard navigation
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                closeWindow();
            } else if (event.key === 'Escape') {
                closeWindow();
            }
        });
    </script>
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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
            line-height: 1.6;
        }
        
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 3rem 2rem;
            text-align: center;
            max-width: 450px;
            width: 90%;
            position: relative;
            overflow: hidden;
        }
        
        .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #ef4444, #dc2626);
        }
        
        .error-icon {
            width: 80px;
            height: 80px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            animation: shake 0.6s ease-out;
        }
        
        .error-icon::after {
            content: '✕';
            color: white;
            font-size: 2.5rem;
            font-weight: bold;
        }
        
        @keyframes shake {
            0%, 100% {
                transform: translateX(0);
            }
            25% {
                transform: translateX(-5px);
            }
            75% {
                transform: translateX(5px);
            }
        }
        
        h1 {
            color: #1f2937;
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        
        .error-message {
            color: #ef4444;
            font-size: 1.1rem;
            margin-bottom: 1rem;
            font-weight: 500;
        }
        
        .error-description {
            color: #6b7280;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
        }
        
        .actions {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            align-items: center;
        }
        
        .retry-button {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-block;
        }
        
        .retry-button:hover {
            background: #2563eb;
            transform: translateY(-1px);
        }
        
        .close-button {
            background: #6b7280;
            color: white;
            border: none;
            padding: 0.5rem 1.5rem;
            border-radius: 6px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .close-button:hover {
            background: #374151;
        }
        
        .help-text {
            color: #9ca3af;
            font-size: 0.85rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e5e7eb;
        }
        
        @media (max-width: 480px) {
            .container {
                padding: 2rem 1.5rem;
            }
            
            h1 {
                font-size: 1.5rem;
            }
            
            .error-icon {
                width: 60px;
                height: 60px;
            }
            
            .error-icon::after {
                font-size: 2rem;
            }
            
            .actions {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon" role="img" aria-label="Error icon"></div>
        <h1>Authentication Failed</h1>
        <div class="error-message" role="alert">${sanitizedError}</div>
        ${sanitizedDescription ? `<div class="error-description">${sanitizedDescription}</div>` : ''}
        
        <div class="actions">
            <button class="retry-button" onclick="retryAuthentication()" aria-label="Retry authentication">
                Try Again
            </button>
            <button class="close-button" onclick="closeWindow()" aria-label="Close window">
                Close Window
            </button>
        </div>
        
        <div class="help-text">
            If you continue to experience issues, please return to your terminal for more options.
        </div>
    </div>
    
    <script>
        function retryAuthentication() {
            // Close the window and let the user retry from the terminal
            alert('Please return to your terminal and try the authentication process again.');
            closeWindow();
        }
        
        function closeWindow() {
            try {
                window.close();
                
                setTimeout(() => {
                    document.body.innerHTML = \`
                        <div class="container">
                            <div class="error-icon" role="img" aria-label="Error icon"></div>
                            <h1>Authentication Failed</h1>
                            <p class="error-message">You can safely close this browser tab and return to your terminal.</p>
                        </div>
                    \`;
                }, 100);
            } catch (error) {
                console.log('Window close not available:', error);
            }
        }
        
        // Handle keyboard navigation
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                retryAuthentication();
            } else if (event.key === 'Escape') {
                closeWindow();
            }
        });
    </script>
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