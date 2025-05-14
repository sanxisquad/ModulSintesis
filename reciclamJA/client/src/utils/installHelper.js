/**
 * Utility functions to help with app installation and download features
 */

/**
 * Creates a downloadable app shortcut (.url for Windows or .desktop for Linux)
 * @param {string} appName The name of the application
 * @param {string} appUrl The URL of the application
 * @param {string} iconUrl The URL of the application icon
 * @returns {string} The content of the shortcut file
 */
export const createShortcutFileContent = (appName, appUrl, iconUrl) => {
  // Detect OS - simplified, only checks for Windows vs Others
  const isWindows = navigator.userAgent.indexOf('Windows') !== -1;
  
  if (isWindows) {
    // Create a Windows .url shortcut
    return `[InternetShortcut]
URL=${appUrl}
IconFile=${iconUrl}
IconIndex=0
`;
  } else {
    // Create a Linux .desktop shortcut
    return `[Desktop Entry]
Type=Application
Name=${appName}
Exec=xdg-open ${appUrl}
Icon=${iconUrl}
Terminal=false
Categories=Web;
`;
  }
};

/**
 * Create a downloadable HTML launcher for the app
 * @param {string} appName The name of the application
 * @param {string} appUrl The URL of the application
 * @param {string} description A description of the app
 * @param {string} logoUrl The URL of the app logo
 * @returns {string} HTML content for the launcher
 */
export const createHtmlLauncher = (appName, appUrl, description, logoUrl) => {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${appName}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f0f9f4;
            color: #333;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-width: 80%;
            width: 500px;
        }
        .logo {
            width: 120px;
            height: 120px;
            margin-bottom: 1rem;
        }
        h1 {
            color: #10B981;
            margin-bottom: 1rem;
        }
        p {
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            background-color: #10B981;
            color: white;
            padding: 0.75rem 2rem;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 1rem;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background-color: #0e9f6e;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="${logoUrl}" alt="${appName} Logo" class="logo">
        <h1>${appName}</h1>
        <p>${description}</p>
        <a href="${appUrl}" class="btn">Obrir ${appName}</a>
        <p><small>Si el botó no funciona, copia i enganxa aquesta URL al navegador: ${appUrl}</small></p>
    </div>
    <script>
        // Auto-redirect after 1 second
        setTimeout(function() {
            window.location.href = "${appUrl}";
        }, 1000);
    </script>
</body>
</html>`;
};

/**
 * Helper function to trigger a file download
 * @param {string} content The content of the file to download
 * @param {string} fileName The name of the file
 * @param {string} mimeType The MIME type of the file
 */
export const downloadFile = (content, fileName, mimeType) => {
  // Create a blob with the file content
  const blob = new Blob([content], { type: mimeType });
  
  // Create a download link and trigger the download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};
