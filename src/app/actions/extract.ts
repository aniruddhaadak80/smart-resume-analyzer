'use server';

import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";

export async function extractText(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = "";

        if (file.type === "application/pdf") {
            try {
                const PDFParser = require("pdf2json");
                const pdfParser = new PDFParser(null, 1);

                extractedText = await new Promise((resolve, reject) => {
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
                return { success: false, error: `Failed to parse PDF: ${pdfError.message}` };
            }
        }
        else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            try {
                const result = await mammoth.extractRawText({ buffer });
                extractedText = result.value;
            } catch (wordError) {
                console.error("Word Parsing failed:", wordError);
                return { success: false, error: "Failed to parse Word document." };
            }
        }
        else if (file.type.startsWith("image/")) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

                const prompt = "Extract all text from this job description image. Maintain the structure and key details. Output only the extracted text.";

                const response = await ai.models.generateContent({
                    model: "gemini-3-flash-preview",
                    contents: [{
                        role: "user",
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    data: buffer.toString("base64"),
                                    mimeType: file.type,
                                }
                            }
                        ]
                    }]
                });

                extractedText = response.text || "";
            } catch (ocrError) {
                console.error("OCR failed:", ocrError);
                return { success: false, error: "Failed to extract text from image." };
            }
        }
        else {
            return { success: false, error: "Unsupported file type. Please upload PDF, Word, or Image." };
        }

        return { success: true, text: extractedText.trim() };

    } catch (error: any) {
        console.error("Extraction Error:", error);
        return { success: false, error: error.message || "Failed to extract text." };
    }
}
