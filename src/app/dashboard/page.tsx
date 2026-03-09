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
                    actionType: true,
                    content: true // Needed for re-generating docs
                }
            });

            // Fetch job applications to show in history
            const jobApps = await prisma.jobApplication.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    company: true,
                    jobTitle: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            // Format job applications to match the Resume UI shape
            const formattedJobApps = jobApps.map(job => ({
                id: job.id,
                fileName: `${job.jobTitle} at ${job.company}`,
                jobTitle: job.status,
                matchScore: null,
                createdAt: job.createdAt,
                fileType: 'JOB',
                actionType: 'TRACKER',
                content: JSON.stringify({
                    company: job.company,
                    role: job.jobTitle,
                    status: job.status
                })
            }));

            serverHistory = [...serverHistory, ...formattedJobApps]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error("Failed to fetch resumes:", error);
        }
    } else {
        // Optional: Redirect to login or just show local history
        // redirect('/sign-in'); 
    }

    return <DashboardClient serverHistory={serverHistory} />;
}
