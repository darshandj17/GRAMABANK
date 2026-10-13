# GRAMABANK


GramBank is a web-based application with a Profile area, Admin Console, and optional Gemini AI integration through a shared Node.js backend.

Features
Responsive HTML/CSS/JavaScript frontend
Admin Console password lock
Profile & AI settings lock
Shared Gemini AI service (users do not enter their own API key)
Node.js backend suitable for deployment on Render
Root-level index.html for compatible static-site-to-APK builders
Repository structure
GRAMABANK/
├── index.html
├── app.js
├── style.css
├── manifest.json
├── backend-config.js
├── README.md
├── .gitignore
├── assistant.svg
├── fraud.svg
├── learn.svg
├── policy.svg
├── scheme.svg
├── voice.svg
└── backend/
    ├── package.json
    ├── server.js
    ├── .env.example
    └── README.md
Deploy the backend to Render
Push this repository to GitHub.
In Render, create New + → Web Service and connect this repository.
Set Root Directory to backend.
Set Build Command to npm install (this starter backend uses Node.js built-ins and has no external npm dependencies; npm install is also acceptable).
Set Start Command to npm start.
In Render's Environment settings, add GEMINI_API_KEY with your private Gemini API key. Optionally add GEMINI_MODEL (default: gemini-2.5-flash). Never commit a real key to GitHub.
Deploy and copy the service's HTTPS URL.
Edit backend-config.js and replace the example URL with the deployed service URL, without a trailing slash.
Commit and push that change, then rebuild the APK from the frontend files with index.html at the ZIP root.
Test the deployed service by opening <your-service-url>/api/health. It should return JSON with ok: true and whether the API key is configured.
Local backend development
Requirements: Node.js 18 or newer.

PowerShell / terminal:

cd backend
# Set GEMINI_API_KEY in your environment (do not put a real key in source control)
npm start
The server listens on PORT (defaults to 3000 locally) and binds to 0.0.0.0 for hosting.

API endpoints
GET /api/health — health and key-configuration status
GET /api/models — configured model
POST /api/generate — accepts JSON such as {"prompt":"Explain savings accounts"}
Security and costs
Keep GEMINI_API_KEY only in the hosting provider's secret/environment settings.
Do not publish .env files, API keys, passwords, or credentials.
The included rate limit is a basic safeguard, not full production abuse protection. Before public release, add appropriate authentication, stronger per-user quotas, monitoring, and cost controls.
A shared backend means AI requests consume your Google project's quota and may incur costs.
The backend cannot bypass Google project or API access restrictions. Resolve any Google 403 PERMISSION_DENIED restrictions with Google before expecting live AI to work.
The Admin/Profile password locks in the frontend are local UI protections, not server-grade authentication.
Publishing the frontend
After backend-config.js contains the real deployed HTTPS URL, package the frontend files with index.html at the ZIP root and upload that frontend ZIP to your chosen WebView-to-APK builder.

License
No license is granted 
