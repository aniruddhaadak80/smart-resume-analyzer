```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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
