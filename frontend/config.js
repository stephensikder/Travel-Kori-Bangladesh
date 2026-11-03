// ===================================================
// TRAVEL KORI BANGLADESH - CLIENT CONFIGURATION
// Configure restricted browser keys here.
// ===================================================

// Dynamic API Base URL: Automatically works on both localhost and Render production
window.API_BASE = (window.location.origin && window.location.origin !== "null") ? window.location.origin : "http://localhost:5000";

// Google Maps API Key
// If empty, the Route Map page seamlessly uses high-resolution CartoDB Voyager tiles with full marker routing.
// To use official Google Maps JavaScript API:
// 1. Obtain an API key from Google Cloud Console (https://console.cloud.google.com).
// 2. Enable "Maps JavaScript API" and "Directions API".
// 3. Set Application Restriction to "HTTP referrers (web sites)" with "http://localhost:*/*".
// 4. Paste the restricted key below:
window.GOOGLE_MAPS_API_KEY = "";
