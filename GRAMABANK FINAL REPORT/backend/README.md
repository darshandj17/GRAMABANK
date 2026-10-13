# GramBank shared Gemini backend

## Deploy (required before live AI works for all users)
1. Create a Node.js web service on a host such as Render, Railway, or your own server.
2. Upload/deploy the contents of this `backend` folder (not the frontend ZIP). Build command: none; Start command: `npm start`. Use Node 18+.
3. In the host's Environment settings, add `GEMINI_API_KEY` with your private Gemini API key and optionally `GEMINI_MODEL=gemini-2.5-flash`. Never put this key in the frontend, APK, or public repository.
4. After deployment, copy the HTTPS service URL. In the frontend ZIP, edit `backend-config.js` and replace `https://YOUR-BACKEND-URL.example.com` with that URL. Re-ZIP the frontend files with `index.html` at the ZIP root, then upload it to FreeWebToApk and rebuild the APK.
5. Set `ALLOWED_ORIGIN` to your published web origin if known; for testing it defaults to `*`. For native WebView origins, test the provider's CORS behavior.

## Important
- Backend is a starter implementation, not deployed by this ZIP. The service must be hosted online for all users to use live AI.
- Shared key usage creates shared quota/cost. Add authentication, per-user limits, monitoring and abuse controls before public launch. The included IP rate limit is only a basic safeguard and is not production-grade.
- A backend cannot bypass Google project/API restrictions; if Google denies the project, resolve that with Google first.
- Do not commit `.env` or real API keys.
