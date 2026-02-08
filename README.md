# careerzen 🧘‍♂️

> **AI-Powered Resume Optimization & Interview Prep**

![careerzen Hero](/public/logo.png)

**careerzen** is a next-generation career tool that helps you land your dream job. It uses Google's Gemini AI to analyze your resume against job descriptions, giving you a match score, ATS optimization tips, and even acts as an AI Interview Coach.

---

## ✨ Features

- **🎯 instant Analysis**: Get a Match Score & ATS Score in seconds using **Gemini 3.0 Flash Preview**.
- **� Multimodal Optimizer**: Upload your resume (**PDF/Word**) and target job descriptions (**PDF/Word/Image**).
- **👁️ AI-Powered OCR**: Automatically extract text from screenshots or photos of job vacancies.
- **🤖 AI Interview Coach**: Generates tailored interview questions based on your resume's weak spots.
- **🔍 Advanced Search**: Filter your history with granular time options (Yesterday, Last 30 Days, This Year, etc.).
- **🕒 Precision Timing**: All saved resumes are timestamped in **IST (India Standard Time)** for accurate tracking.
- **🎨 Premium UI**: Persistent Navbar, Footer, and a custom animated 404 page for a seamless experience.

---

## 🚀 How it Works

### 1. Upload
Drag & drop your resume (PDF/DOCX).
![Upload](/public/assets/upload_mockup.png)

### 2. Analyze
The AI scans your profile against 50+ ATS checkpoints.
![Analyze](/public/assets/analysis_mockup.png)

### 3. Improve
Get actionable feedback and prep for your interview.
![Results](/public/assets/results_mockup.png)

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion + Glassmorphism
- **AI Engine**: Google Gemini-3-Flash-Preview (Vision/OCR)
- **Database**: Prisma + PostgreSQL (Cloud) / LocalStorage (Client)
- **Auth**: Clerk Authentication
- **Parsing**: `pdf2json`, `mammoth` & AI-driven Multimodal Extraction
- **Language**: TypeScript

---

## 🏁 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/aniruddhaadak80/smart-resume-analyzer.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up API Key**
   Create a `.env.local` file:
   ```env
   GEMINI_API_KEY=your_google_api_key_here
   ```

4. **Run it!**
   ```bash
   npm run dev
   ```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

© 2026 careerzen. Built with ❤️ and AI.
