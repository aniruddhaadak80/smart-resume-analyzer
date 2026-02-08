'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveResume(data: {
    userId: string;
    fileName: string;
    jobTitle: string;
    matchScore: number;
    fileType: "PDF" | "DOCX";
    content: any; // The optimization JSON
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
            }
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
