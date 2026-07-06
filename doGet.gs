/**
 * PU College Admission Management System
 * Web App Entry Point - doGet.gs
 * 
 * Serves the HTML interface when accessed as a web app.
 */

// ============================================================================
// WEB APP ENTRY POINT
// ============================================================================

/**
 * doGet function - Entry point for Google Apps Script web app
 * Returns the HTML file to be displayed
 * @param {Object} e - Event object from URL parameters
 * @return {HtmlOutput} HTML content to display
 */
function doGet(e) {
  try {
    // Determine which page to serve based on URL parameter
    const page = e.parameter.page || 'student'; // Default to student portal
    
    let htmlOutput;
    
    if (page === 'student') {
      // Serve student portal
      htmlOutput = HtmlService.createHtmlOutputFromFile('Index');
    } else if (page === 'dashboard') {
      // Serve admin dashboard
      htmlOutput = HtmlService.createHtmlOutputFromFile('Dashboard');
    } else {
      // Default to student portal
      htmlOutput = HtmlService.createHtmlOutputFromFile('Index');
    }
    
    // Set security and sizing options
    htmlOutput
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .setWidth(900)
      .setHeight(600);
    
    Logger.log(`✓ Web app served: ${page} portal`);
    return htmlOutput;
    
  } catch (error) {
    Logger.log(`✗ Error in doGet: ${error}`);
    
    // Return error page
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background: #f3f4f6;
              margin: 0;
            }
            .error-container {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #ef4444;
              margin: 0 0 20px 0;
            }
            p {
              color: #6b7280;
              margin: 10px 0;
            }
            .error-details {
              background: #fee2e2;
              color: #991b1b;
              padding: 15px;
              border-radius: 6px;
              margin-top: 20px;
              font-family: monospace;
              text-align: left;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>⚠️ Error Loading Portal</h1>
            <p>We encountered an error while loading the admission portal.</p>
            <div class="error-details">
              ${error.message || 'Unknown error'}
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">
              Please refresh the page or contact support if the problem persists.
            </p>
          </div>
        </body>
      </html>
    `;
    
    return HtmlService.createHtmlOutput(errorHtml)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * doPost function - Handle form submissions and data updates
 * @param {Object} e - Event object containing posted data
 * @return {TextOutput} JSON response
 */
function doPost(e) {
  try {
    const action = e.parameter.action;
    let result = { success: false, message: 'Unknown action' };
    
    switch(action) {
      case 'search':
        result = handleStudentSearch(e.parameter.appNumber);
        break;
      
      case 'getDashboard':
        result = getDashboardData();
        break;
      
      default:
        result = { success: false, message: 'Invalid action' };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log(`✗ Error in doPost: ${error}`);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle student search from portal
 * @param {string} appNumber - Application number to search
 * @return {Object} Search result
 */
function handleStudentSearch(appNumber) {
  try {
    if (!appNumber || appNumber.length < 4) {
      return {
        success: false,
        error: 'Please provide a valid application number'
      };
    }
    
    const student = getStudentDetails(appNumber);
    
    if (student.error) {
      return {
        success: false,
        error: student.error
      };
    }
    
    return {
      success: true,
      data: student
    };
    
  } catch (error) {
    Logger.log(`✗ Error in handleStudentSearch: ${error}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================================
// WEB APP DEPLOYMENT
// ============================================================================

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. In Google Apps Script Editor:
 *    - Click "Deploy" button (top right)
 *    - Select "New Deployment"
 *    - Choose type: "Web app"
 *    - Execute as: Your email
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 *
 * 2. Copy the deployment URL from the popup
 *    Example: https://script.google.com/macros/d/{DEPLOYMENT_ID}/usercontent
 *
 * 3. Share this URL with students to access the portal
 *
 * 4. For subsequent updates:
 *    - Make code changes
 *    - Click Deploy → Manage Deployments
 *    - Edit the existing deployment
 *    - Click "Deploy" in the edit dialog
 */

Logger.log('✓ doGet.gs loaded successfully');
Logger.log('✓ Web app entry points ready');
