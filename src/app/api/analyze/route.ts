import { NextRequest, NextResponse } from "next/server";
import { analyzeResumeWithGemini } from "@/lib/gemini";
const pdf = require("pdf-parse");
import mammoth from "mammoth";

// Force dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File;
        const jobDescription = formData.get("jobDescription") as string;

        if (!file) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let resumeText = "";

        if (file.type === "application/pdf") {
            const pdfData = await pdf(buffer);
            resumeText = pdfData.text;
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer });
            resumeText = result.value;
        } else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        const analysisResults = await analyzeResumeWithGemini(resumeText, jobDescription);

        return NextResponse.json(analysisResults);

    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
