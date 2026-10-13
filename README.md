# 🌿 GramBank AI — Banking Knowledge for Everyone

**Making financial literacy simple, accessible, and inclusive.**

GramBank AI is an AI-powered financial literacy web application designed to help people understand everyday banking, digital payments, financial safety, and government schemes through a simple and approachable interface.

The project aims to make banking knowledge easier to access for users who prefer plain-language explanations and multilingual support.

🌐 **Live Demo:** [Open GramBank AI](https://gramabank.netlify.app/)

---

## ✨ Features

### 🤖 AI Banking Assistant
- Ask questions about common banking topics.
- Get easy-to-understand explanations.
- Designed for English, Hindi, Kannada, and Romanized or code-mixed questions.
- Connects to a backend service for AI-generated responses.

### 🛡️ Fraud Awareness
- Learn about common digital payment scams.
- Understand why you should never share your OTP, PIN, CVV, or banking password.
- Explore practical tips for safer online banking.

### 🏦 Banking Education
- Learn about opening bank accounts.
- Understand UPI and ATM basics.
- Explore financial literacy concepts in simple language.

### 📄 Policy Simplifier
- A dedicated interface for making financial information easier to understand.

### 🎙️ Voice Assistant
- A voice-oriented interface for making banking information more accessible.

### 🧭 Scheme Finder
- Explore information about financial assistance and government schemes.
- Always verify eligibility, deadlines, and requirements using official sources.

### 📚 Learning & User Tools
- Financial learning resources.
- Profile and AI settings.
- Administrative interface.

---

## 🧰 Technology Stack

The project uses a web-based frontend and a separate backend service.

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Frontend hosting | Netlify |
| Backend hosting | Render |
| AI integration | Google Gemini API |
| API communication | HTTP requests / JSON |

*The table describes the project's deployment architecture; exact dependencies may vary by repository version.*

---

## 🏗️ Architecture

```text
                 USER
                   |
                   v
          GramBank AI Frontend
             HTML / CSS / JS
                   |
                   v
             Backend API
             Hosted on Render
                   |
                   v
             Gemini API
                   |
                   v
          AI-Generated Response
                   |
                   v
           Displayed to User
```

The frontend and backend are deployed separately. The frontend sends requests to the backend, which handles AI requests and returns responses to the interface.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

Replace the placeholders with your repository URL and folder name.

### 2. Run the frontend locally

For a static HTML frontend, open `index.html` in your browser or use a local development server.

For example, if Python is installed:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

### 3. Configure the backend

Navigate to the backend directory and install the dependencies using the repository's package files.

```bash
cd backend
npm install
```

Create or configure your environment variables according to the backend implementation.

Example:

```env
GEMINI_API_KEY=your_private_api_key
GEMINI_MODEL=your_supported_gemini_model
PORT=10000
```

**Security:** Never commit your real API key to GitHub. Store secrets in environment variables on your hosting provider.

### 4. Start the backend

If the backend's `package.json` defines an `npm start` script:

```bash
npm start
```

Check the configured health endpoint, if available, to confirm that the service is running.

---

## ☁️ Deployment

### Frontend — Netlify
1. Connect your repository or upload the static frontend files.
2. Ensure `index.html` is in the published root directory.
3. Configure the frontend to use your deployed backend URL.
4. Deploy and test the website.

### Backend — Render
1. Create a web service linked to your repository.
2. Configure the backend root directory.
3. Set the appropriate build and start commands.
4. Add the required environment variables.
5. Deploy and inspect the service logs.
6. Test the API endpoints used by the frontend.

The frontend API paths and backend routes must match for the AI assistant to work correctly.

---

## 🔐 Responsible AI & Safety

GramBank AI is designed to support financial education, not replace professional financial advice.

- Never request or share a user's OTP, PIN, CVV, password, or full banking credentials.
- Keep API keys private and out of source control.
- Verify current banking rules and government scheme details through official sources.
- AI-generated answers can contain errors; verify important information before acting on it.
- Do not treat AI responses as guaranteed financial, legal, or investment advice.

---

## 🗺️ Roadmap

- [ ] Improve multilingual AI responses.
- [ ] Strengthen error handling and API reliability.
- [ ] Expand banking fraud awareness resources.
- [ ] Improve mobile responsiveness and accessibility.
- [ ] Add more verified financial learning resources.
- [ ] Expand support for regional languages.
- [ ] Improve testing and deployment documentation.

---

## 🤝 Contributing

Contributions, suggestions, bug reports, and educational content improvements are welcome.

1. Fork this repository.
2. Create a feature branch.
3. Make your changes.
4. Test the changes locally.
5. Submit a pull request describing your contribution.

Please avoid committing API keys, personal information, or confidential banking data.

---

## 🎯 Our Mission

**Financial knowledge should not be limited by language, technical experience, or background.**

GramBank AI aims to make banking education easier to understand so that more people can learn about digital payments, financial safety, and everyday banking with confidence.

---

## 📜 License

Add a `LICENSE` file to specify how others may use, modify, and distribute this project. If no license has been added, all rights remain with the copyright holder by default.

---

**Built with 💚 for accessible financial literacy.**

*GramBank AI — Ask. Understand. Verify.*
