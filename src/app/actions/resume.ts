'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";

export async function saveResume(data: {
    userId: string;
    fileName: string;
    jobTitle: string;
    matchScore: number;
    fileType: "PDF" | "DOCX" | "JSON";
    content: any; // The optimization or analysis JSON
    actionType?: "OPTIMIZE" | "ANALYZE" | "COACH";
}) {
    try {
        await prisma.resume.create({
            data: {
                userId: data.userId,
                fileName: data.fileName,
                jobTitle: data.jobTitle,
                matchScore: data.matchScore,
                fileType: data.fileType,
                fileUrl: "", // We can generate on fly from content for local dev
                content: JSON.stringify(data.content),
                actionType: data.actionType || "OPTIMIZE",
            }
        });

        await logActivity(data.userId, data.actionType || "OPTIMIZE", {
            action: 'SAVED_REPORT',
            fileName: data.fileName,
            score: data.matchScore
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Failed to save resume:", error);
        return { success: false, error: "Failed to save resume to database." };
    }
}

export async function getUserResumes(userId: string) {
    try {
        const resumes = await prisma.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: resumes };
    } catch (error) {
        console.error("Failed to fetch resumes:", error);
        return { success: false, error: "Failed to fetch resumes." };
    }
}
