import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeResumeWithGemini = async (resumeText: string, jobDescription: string) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert ATS (Applicant Tracking System) and Resume Analyzer.
        I will provide you with a Resume text and a Job Description.
        
        Your task is to analyze the resume against the job description and provide a detailed report in valid JSON format.
        
        Resume Text:
        "${resumeText}"
        
        Job Description:
        "${jobDescription}"
        
        Strictly output only JSON with the following structure (no markdown code blocks):
        {
            "matchPercentage": "integer from 0 to 100",
            "atsScore": "integer from 0 to 100 (based on keyword matching and formatting)",
            "missingKeywords": ["array", "of", "important", "keywords", "missing"],
            "skillsFound": ["array", "of", "matched", "skills"],
            "improvements": ["array", "of", "specific", "suggestions", "to", "improve", "the", "resume"],
            "candidateSummary": "A brief summary of the candidate's fit for the role."
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanedText);

    } catch (error) {
        console.error("Error analyzing with Gemini:", error);
        throw new Error("Failed to analyze resume with Gemini AI");
    }
};
