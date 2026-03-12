'use server';

import { summarizeJobDescription } from "@/lib/gemini";

export async function summarizeJD(jobDescription: string): Promise<
  { success: true; data: string[] } | { success: false; error: string }
> {
  if (!jobDescription || jobDescription.trim().length < 50) {
    return { success: false, error: "Job description is too short to summarize." };
  }

  try {
    const requirements = await summarizeJobDescription(jobDescription);
    return { success: true, data: requirements };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
