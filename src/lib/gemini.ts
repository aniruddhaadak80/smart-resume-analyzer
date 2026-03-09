import { GoogleGenAI } from "@google/genai";

export const generateContentWithRetry = async (ai: GoogleGenAI, options: any, maxRetries = 3) => {
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            return await ai.models.generateContent(options);
        } catch (error: any) {
            const errorString = JSON.stringify(error) + String(error);
            if (errorString.includes("503") || errorString.includes("429") || errorString.includes("UNAVAILABLE") || errorString.includes("high demand")) {
                attempt++;
                if (attempt >= maxRetries) throw error;
                const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500; // Exponential backoff + jitter
                console.warn(`[Gemini] API busy (503/429). Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error("Max retries exceeded");
};

export interface ToneIssue {

    original: string;

    issue: string;

    suggestion: string;
}

export interface GrammarError {
    /** The exact text containing the error */
    original: string;
    /** A plain-English explanation of the grammatical mistake */
    issue: string;
    /** The corrected version */
    correction: string;
}

export interface ToneAndGrammarAnalysis {
    overallToneScore: number;          // 0-100: higher = more active/assertive
    passiveVoiceCount: number;         // total passive-voice constructions found
    weakVerbCount: number;             // total weak verbs (e.g. "was responsible for")
    toneIssues: ToneIssue[];           // per-bullet breakdown
    grammarErrors: GrammarError[];     // grammatical errors found
    toneStrengths: string[];           // positive observations about tone
    summary: string;                   // one-paragraph human-readable overall assessment
}

export interface AnalysisResult {
    matchPercentage: number;
    atsScore: number;
    candidateSummary: string;
    missingKeywords: string[];
    skillsFound: string[];
    improvements: string[];
    interviewQuestions: { question: string; answer: string }[];
    /** Present only when `includeToneCritique` is true */
    toneAndGrammar?: ToneAndGrammarAnalysis;
}

export interface AnalyzeResumeOptions {
    /** When true, Gemini will also critique tone & grammar */
    includeToneCritique?: boolean;
}

export const analyzeResumeWithGemini = async (
    resumeText: string,
    jobDescription?: string,
    options: AnalyzeResumeOptions = {}
): Promise<AnalysisResult> => {
    const { includeToneCritique = false } = options;

    // Initialize client inside the function to avoid build-time errors
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    try {
        let prompt = "";
        const isJobDescProvided = jobDescription && jobDescription.trim().length > 0;

        if (isJobDescProvided) {
            prompt = `
            You are an expert AI Resume Scanner & Technical Recruiter.
            
            Compare the following Resume with the Job Description.

            RESUME:
            ${resumeText}

            JOB DESCRIPTION:
            ${jobDescription}
            `;
        } else {
            prompt = `
            You are an expert AI Resume Auditor.
            
            Analyze the following Resume for general best practices, impact, and clarity. 
            Assume the candidate is aiming for a senior role in their apparent field.

            RESUME:
            ${resumeText}
            `;
        }

        // ── Core JSON schema (always present) ─────────────────────────────────
        prompt += `
        Provide a JSON output with the following structure:
        {
            "matchPercentage": (integer 0-100),
            "atsScore": (integer 0-100),
            "candidateSummary": "2-3 sentences summary",
            "missingKeywords": ["list", "of", "missing", "keywords"],
            "skillsFound": ["list", "of", "skills", "found"],
            "improvements": ["list", "of", "improvements"],
            "interviewQuestions": [
                {
                    "question": "Technical/Behavioral question based on resume gaps",
                    "answer": "Ideal brief answer"
                }
            ]
        `;

        // ── Optional tone & grammar block ──────────────────────────────────────
        if (includeToneCritique) {
            prompt += `,
            "toneAndGrammar": {
                "overallToneScore": (integer 0-100, where 100 means every bullet starts with a strong action verb and there is zero passive voice),
                "passiveVoiceCount": (integer — total passive-voice constructions found across all bullets),
                "weakVerbCount": (integer — count of weak/vague verbs like "was responsible for", "helped with", "worked on", "assisted in"),
                "toneIssues": [
                    {
                        "original": "exact bullet or phrase from the resume that has a tone problem",
                        "issue": "plain-English explanation: is it passive voice? a weak verb? filler language?",
                        "suggestion": "rewritten version starting with a strong action verb and quantified impact if possible"
                    }
                ],
                "grammarErrors": [
                    {
                        "original": "exact text containing the grammatical error",
                        "issue": "plain-English explanation of the grammar mistake",
                        "correction": "corrected version"
                    }
                ],
                "toneStrengths": ["list of 2-4 positive observations about the resume's language"],
                "summary": "A 2-3 sentence overall assessment of the resume's tone and grammar quality, with the most impactful advice."
            }
            `;
        }

        prompt += `
        }
        
        Provide between 10 to 20 unique interviewQuestions. Mix technical, behavioral, and situational questions.
        IMPORTANT: Return ONLY raw JSON. Do not include markdown formatting or code fences.
        `;

        const response = await generateContentWithRetry(ai, {
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const text = response.text ?? "";

        // Strip any accidental markdown code fences
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanedText) as AnalysisResult;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Gemini Analysis Failed: ${errorMessage}`);
    }
};
