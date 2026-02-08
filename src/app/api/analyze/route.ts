import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { analyzeResumeWithGemini } from "@/lib/gemini";
import fs from 'fs';
import path from 'path';

// Force dynamic to prevent ANY build-time evaluation
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
            try {
                const PDFParser = require("pdf2json");
                const pdfParser = new PDFParser(null, 1);

                resumeText = await new Promise((resolve, reject) => {
                    pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
                    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                        try {
                            // Custom text extraction to fix spacing issues
                            let text = "";
                            pdfData.formImage.Pages.forEach((page: any) => {
                                page.Texts.forEach((item: any) => {
                                    item.R.forEach((t: any) => {
                                        // decode and append with space
                                        text += decodeURIComponent(t.T) + " ";
                                    });
                                });
                                text += "\n";
                            });
                            resolve(text);
                        } catch (e) {
                            // Fallback
                            resolve(pdfParser.getRawTextContent());
                        }
                    });

                    pdfParser.parseBuffer(buffer);
                });
            } catch (pdfError: any) {
                console.error("PDF Parsing failed:", pdfError);
                return NextResponse.json({ error: `Failed to parse PDF: ${pdfError.message}` }, { status: 500 });
            }
        } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const result = await mammoth.extractRawText({ buffer });
            resumeText = result.value;
        } else {
            return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
        }

        const analysisResults = await analyzeResumeWithGemini(resumeText, jobDescription);

        return NextResponse.json({ ...analysisResults, resumeText }); // Return raw text for future re-use

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
