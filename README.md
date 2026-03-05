<div align="center">

# careerzen 🧘‍♂️

<p align="center">
  <b>AI-Powered Resume Optimization & Intelligent Interview Prep</b>
</p>

![careerzen Hero Banner](/public/assets/hero_banner.png)

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini API](https://img.shields.io/badge/Google_Gemini-3.0_Flash-orange?logo=google)](https://ai.google.dev/)
[![Sarvam AI](https://img.shields.io/badge/Sarvam_AI-Speech_To_Text-purple?logo=ai)](https://www.sarvam.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Live Demo] | [Report Bug] | [Request Feature] | [Contributing Guide]

</div>

---

## ⚡ Overview

**careerzen** is a next-generation, open-source career tool designed to help you land your dream job efficiently. It leverages Google's **Gemini 3.0 Flash Preview** to analyze your resume against job descriptions, producing an instant ATS match score and optimization tips. 

But it doesn't stop there. careerzen features an **AI Interview Coach** that uses **Sarvam AI** for advanced Speech-to-Text (STT) processing, allowing you to practice mock interviews by *speaking* your answers out loud before receiving real-time AI feedback.

---

## 🌟 Visual Workflow Guide

Our clean, modern interface makes it incredibly simple to optimize your application.

### 1. Resume Match Analysis
Simply drag and drop your Resume (PDF/Word) and paste the Job Description (Text/Screenshot). Our AI engine does the rest.

<div align="center">
  <img src="/public/assets/resume_workflow.png" alt="Resume Analysis Workflow" width="800">
</div>

### 2. AI Interview Coach (with Sarvam STT)
Practice tailored interview questions specifically targeted at your weak spots. Speak your answers naturally using our Sarvam AI Speech-to-Text integration.

<div align="center">
  <img src="/public/assets/interview_coach.png" alt="Interview Coach Illustration" width="800">
</div>

---

## 🧠 System Architecture

Beneath the simple UI lies a robust, multimodal AI architecture. Here is how the text and audio logic flows:

```mermaid
graph TD
    %% Styling
    classDef user fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef ai fill:#a855f7,stroke:#7e22ce,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef ext fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff,rx:8px,ry:8px;
    classDef db fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff,rx:8px,ry:8px;

    %% Nodes
    UserUpload[User Uploads Resume\n(PDF/DOCX)]:::user
    UserJob[User Provides Job Listing\n(Text/Image)]:::user
    UserSpeech[User Speaks Answer\n(Voice Audio)]:::user
    
    Parser[Text/OCR Parsing Engine]:::ext
    SarvamSTT[Sarvam AI\nSpeech-to-Text API]:::ai
    Gemini[Google Gemini 3.0\nFlash AI Engine]:::ai
    
    Analysis(ATS Optimization Analysis):::ext
    Questions(Generated Interview Scenarios):::ext
    Feedback(Voice Answer Feedback):::ext
    
    DB[(PostgreSQL + Prisma)]:::db
    Dashboard(User Dashboard UI):::user

    %% Edges
    UserUpload --> Parser
    UserJob --> Parser
    UserSpeech --> SarvamSTT
    
    Parser --> |Parsed Text| Gemini
    SarvamSTT --> |Transcribed Text| Gemini
    
    Gemini -.-> |Calculates| Analysis
    Gemini -.-> |Creates| Questions
    Gemini -.-> |Evaluates| Feedback
    
    Analysis --> DB
    Questions --> DB
    Feedback --> DB
    
    DB --> Dashboard
```

---

## ✨ Core Features Matrix

| Feature | Description | Why It matters |
| :--- | :--- | :--- |
| **🎯 Instant ATS Score** | Detailed parsing against job requirements | Stop guessing if your resume will pass the filters |
| **🖼️ Multimodal OCR** | Upload PDF/DOCX or Images of job postings | Total flexibility no matter where you find the job |
| **🎙️ Voice Mock Interviews** | Uses Sarvam AI to transcribe spoken answers | Practice physically speaking out loud, not just typing |
| **🤖 Dynamic AI Coach** | Uses Gemini to provide constructive feedback | Iteratively improve how you sell your experiences |
| **👨‍💻 Modern Dashobard** | Fully responsive dashboard with history tracking | Maintain a central hub for your job hunt |

---

## 🛠️ Technology Stack

We've built careerzen using modern, production-ready tools:

<details>
<summary><b>Click to expand Tech Stack</b></summary>

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4
- **Animations:** Framer Motion, GSAP
- **Database:** PostgreSQL, Prisma ORM
- **Authentication:** Clerk Auth
- **AI / LLM:** Google Gemini-3-Flash-Preview (`@google/genai`)
- **Speech-to-Text:** Sarvam AI
- **Parsing Utilities:** `pdf2json`, `mammoth`, `@react-pdf/renderer`
</details>

---

## 🚀 Local Development Setup

Want to run careerzen on your own machine? Follow these step-by-step instructions.

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v20+ recommended)
- [Git](https://git-scm.com/)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- A [Sarvam AI API Key](https://www.sarvam.ai/)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/aniruddhaadak80/smart-resume-analyzer.git
   cd smart-resume-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**  
   Create a `.env.local` file in the root directory. You will need to populate it with your specific API credentials:
   ```env
   # Database (PostgreSQL)
   DATABASE_URL="your_database_connection_string"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   SARVAM_API_KEY=your_sarvam_api_key
   ```

4. **Initialize the Database**  
   Push the Prisma schema to your connected database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *Your app will now be running at `http://localhost:3000`.*

---

## 🤝 Contributing

We ❤️ our contributors! Whether it's squashing bugs, adding new integrations, or fixing typos, we'd love your help.

Please read our comprehensive [**CONTRIBUTING.md**](./CONTRIBUTING.md) guide to learn how to:
1. Fork the repo and set up your branch
2. Find beginner-friendly "good first issues"
3. Submit a Pull Request properly

---

<div align="center">
  <p>© 2026 careerzen. Built with ❤️ and Open Source logic.</p>
</div>
