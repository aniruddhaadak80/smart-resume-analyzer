'use server';

import { GoogleGenAI } from "@google/genai";
import { generateContentWithRetry, analyzeResumeWithGemini } from "@/lib/gemini";

export async function optimizeResume(
  resumeText: string,
  jobDescription: string,
  options: { includeToneCritique?: boolean } = {}
) {
  const { includeToneCritique = false } = options;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const prompt = `
    You are an expert Resume Writer and ATS Optimizer. 
    Your goal is to rewrite the candidate's resume to achieve a 100% Match Score against the provided Job Description.

    JOB DESCRIPTION:
    ${jobDescription}

    CURRENT RESUME:
    ${resumeText}

    INSTRUCTIONS:
    1. Analyze the Job Description for key hard skills, soft skills, and responsibilities.
    2. Rewrite the "Professional Summary" to immediately hook the recruiter and include top keywords.
    3. Rewrite "Experience" bullet points:
       - Use strong action verbs.
       - Quantify results where possible (e.g., "Increased X by Y%").
       - Naturally weave in the missing keywords from the JD.
       - Keep the *truth* of the candidate's experience, but frame it to match the JD.
    4. Update "Skills" to include all relevant technical and soft skills found in the JD that the candidate reasonably possesses based on their resume.
    5. Maintain a professional, clean tone.

    OUTPUT FORMAT:
    Return a single valid JSON object with this exact structure (no markdown):
    {
      "fullName": "Full Name in proper case",
      "contactInfo": {
         "email": "email@example.com",
         "phone": "+1 (xxx) xxx-xxxx",
         "linkedin": "linkedin.com/in/username",
         "website": "portfolio-url.com",
         "location": "City, State"
      },
      "professionalSummary": "A compelling 3-4 sentence summary that immediately hooks the reader, highlights key achievements with numbers, and includes top keywords from the JD. Make it impactful and specific.",
      "skills": ["Include 15-20 relevant skills from the JD that the candidate has", "Technical skills first", "Then soft skills"],
      "experience": [
        {
          "company": "Company Name",
          "role": "Job Title",
          "date": "Month Year - Month Year",
          "location": "City, State",
          "description": ["Write 4-5 strong bullet points per role", "Each bullet should start with a strong action verb", "Include metrics and quantified results (%, $, numbers)", "Naturally integrate missing keywords from the JD", "Focus on impact and achievements, not just duties"]
        }
      ],
      "education": [
        {
          "institution": "University or School Name",
          "degree": "Degree Type and Major",
          "date": "Graduation Year or Date Range",
          "gpa": "GPA if above 3.5 (optional)"
        }
      ],
      "projects": [
        {
           "name": "Project Name",
           "description": "2-3 sentence description highlighting the problem solved and impact",
           "techStack": ["Relevant", "Technologies", "Used"],
           "link": "project-url.com (if available)"
        }
      ],
      "certifications": ["List any relevant certifications", "AWS Certified", "Google Cloud", "etc."],
      "languages": ["English (Native)", "Spanish (Conversational)", "etc."],
      "achievements": ["Include 2-3 key achievements or awards", "Dean's List, Hackathon Winner, etc."]
    }

    IMPORTANT INSTRUCTIONS:
    - Generate at least 4-5 bullet points per experience entry
    - Include ALL relevant skills from the JD (aim for 15-20)
    - Make the professional summary compelling and keyword-rich
    - Add certifications if mentioned or relevant to the JD
    - Add languages if mentioned in original resume
    - Add achievements to fill any gaps
    - Every bullet point should be impactful with metrics where possible
    ${includeToneCritique ? `
    TONE & GRAMMAR CRITIQUE (include this extra key in your JSON output):
    Also analyse the rewritten resume bullets and summary for tone and grammar issues.
    Add the following key at the top level of the JSON object:
    "toneAndGrammar": {
      "overallToneScore": <integer 0-100>,
      "passiveVoiceCount": <integer — number of passive-voice phrases found>,
      "weakVerbCount": <integer — count of weak/vague verbs like "helped", "assisted", "worked on">,
      "summary": "<1-2 sentence overall critique>",
      "toneStrengths": ["<strength 1>", "<strength 2>"],
      "toneIssues": [
        { "original": "<original phrase>", "issue": "<why it's weak>", "suggestion": "<stronger rewrite>" }
      ],
      "grammarErrors": [
        { "original": "<original text>", "issue": "<grammar rule broken>", "correction": "<corrected text>" }
      ]
    }
    ` : ''}
    `;

  try {
    // Run optimization (and optionally tone analysis) in parallel
    const [optimizeResponse, toneAnalysis] = await Promise.all([
      generateContentWithRetry(ai, {
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      }),
      includeToneCritique
        ? analyzeResumeWithGemini(resumeText, jobDescription, { includeToneCritique: true })
        : Promise.resolve(null),
    ]);

    const text = optimizeResponse.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    // Attach tone & grammar analysis if requested
    if (toneAnalysis?.toneAndGrammar) {
      data.toneAndGrammar = toneAnalysis.toneAndGrammar;
    }

    return { success: true, data };

  } catch (error: any) {
    console.error("Optimization Error:", error);
    return { success: false, error: error.message || "Failed to optimize resume." };
  }
}
