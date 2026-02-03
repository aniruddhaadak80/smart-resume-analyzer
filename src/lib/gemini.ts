import { GoogleGenAI } from "@google/genai";

export const analyzeResumeWithGemini = async (resumeText: string, jobDescription?: string) => {
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
        }
        
        Provide exactly 5 interviewQuestions.
        IMPORTANT: Return ONLY raw JSON. Do not include markdown formatting.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const text = response.text ?? "";

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error analyzing with Gemini:", error);
        throw new Error("Failed to analyze resume with Gemini AI");
    }
};
