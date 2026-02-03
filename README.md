# 🚀 Smart Resume Analyzer

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Gemini AI](https://img.shields.io/badge/AI-Gemini_1.5-8E75B2)

A powerful, **AI-driven Resume Optimizer** that helps you land your dream job. It analyzes your resume against job descriptions (or generally) to provide ATS scores, missing keywords, and actionable improvements.

## ✨ Features

- **🤖 AI-Powered Analysis**: Uses Google's **Gemini 1.5 Flash** for deep understanding of your profile.
- **📄 Multi-Format Support**: Parses both **PDF** and **DOCX** resumes.
- **⚡ Instant Feedback**: Get a match score (0-100%) and ATS readiness score in seconds.
- **🎯 Targeted Keywords**: Identifies exactly which keywords you are missing for specific job roles.
- **🎨 Premium UI**: Built with a sleek "Neon Dark" aesthetic using **Tailwind CSS** & **GSAP** animations.
- **📱 Responsive**: Fully optimized for mobile and desktop.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [GSAP](https://gsap.com/)
- **AI Model**: [Google Gemini API](https://ai.google.dev/)
- **Parsing**: `pdf-parse` & `mammoth`

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/aniruddhaadak80/smart-resume-analyzer.git
cd smart-resume-analyzer
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env.local` file in the root directory and add your Google Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```
> Get your free key at [aistudio.google.com](https://aistudio.google.com/).

### 4. Run the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
