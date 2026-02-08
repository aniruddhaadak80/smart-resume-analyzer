import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const { userId } = await auth();
    let serverHistory: any[] = [];

    if (userId) {
        try {
            serverHistory = await prisma.resume.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    fileName: true,
                    jobTitle: true,
                    matchScore: true,
                    createdAt: true,
                    fileType: true,
                    content: true // Needed for re-generating docs
                }
            });
        } catch (error) {
            console.error("Failed to fetch resumes:", error);
        }
    } else {
        // Optional: Redirect to login or just show local history
        // redirect('/sign-in'); 
    }

    return <DashboardClient serverHistory={serverHistory} />;
}
