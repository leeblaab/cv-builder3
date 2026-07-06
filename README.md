<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# AI CV Builder & Tailorer

A full-stack AI-powered CV builder that helps you create, edit, and tailor your resumes to job descriptions for ATS compatibility. Built with React, TypeScript, Tailwind CSS, Express, Google Gemini AI, and Firebase.

Developed by **LeeBLaaB**

## Features

- **Manual CV Editor**: Edit every section of your CV (personal info, experience, education, skills, etc.)
- **Import CVs**: Upload PDF, DOCX, or TXT files to auto-populate your CV using AI parsing
- **AI Tailoring**: Tailor your CV to any job description with Google Gemini AI
- **Multiple Templates**: Choose from classic, modern, tech, or creative resume templates
- **PDF Export**: Download your CV as a high-quality PDF
- **Firebase Authentication**: Sign in/register with email/password or Google
- **Cloud Sync**: Automatically save your CVs to Firebase Firestore
- **Usage Tracking**: Track monthly CV generations and downloads with tiered limits
- **Guest Sandbox Mode**: Try the app without creating an account

## Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Vite
- html2canvas
- jsPDF
- Lucide React Icons

### Backend
- Express.js
- TypeScript
- Google Gemini AI (via @google/genai)
- pdf-parse (PDF parsing)
- mammoth (DOCX parsing)
- express-rate-limit (rate limiting)

### Authentication & Database
- Firebase Auth
- Firebase Firestore

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Google Cloud account with a Gemini API key
- A Firebase project with Auth and Firestore enabled

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd cv-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your `GEMINI_API_KEY` (get one from [Google AI Studio](https://ai.google.dev/))
   - Make sure your Firebase config is in `firebase-applet-config.json`

4. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable **Email/Password** and **Google** sign-in providers in Authentication > Sign-in method
3. Add `localhost` to the Authorized domains in Authentication > Settings
4. Create a Firestore database in Test mode (for development; update rules for production)
5. Download your Firebase config and update `firebase-applet-config.json`

## Building for Production

```bash
npm run build
```

This creates a `dist` directory with both client and server code.

## Project Structure

```
cv-builder/
├── assets/
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx
│   │   ├── BillingModal.tsx
│   │   ├── CVForm.tsx
│   │   ├── CVImport.tsx
│   │   ├── CVPreview.tsx
│   │   ├── JobTailor.tsx
│   │   ├── LandingPage.tsx
│   │   └── TailoredResult.tsx
│   ├── App.tsx
│   ├── firebase.ts
│   ├── initialCV.ts
│   ├── main.tsx
│   └── types.ts
├── .env.example
├── firebase-applet-config.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

## License

MIT
