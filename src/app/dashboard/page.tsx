import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";
import { DashboardStatsData } from "@/components/DashboardStats";
import { calculateActivityStreak } from "@/lib/streak";
import { redirect } from "next/navigation";

const EMPTY_STATS: DashboardStatsData = {
    analyzed: 0,
    optimized: 0,
    jobsTracked: 0,
    interviews: 0,
    streak: 0,
};

export default async function DashboardPage() {
    const { userId } = await auth();
    let serverHistory: any[] = [];
    let stats: DashboardStatsData = { ...EMPTY_STATS };

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
                content: {
                    company: job.company,
                    role: job.jobTitle,
                    status: job.status
                }
            }));

            serverHistory = [...serverHistory, ...formattedJobApps]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } catch (error) {
            console.error("Failed to fetch resumes:", error);
        }

        // Quick stats for the animated counters
        try {
            const [analyzed, optimized, jobsTracked, interviews, activityDates] = await Promise.all([
                prisma.resume.count({ where: { userId, actionType: 'ANALYZE' } }),
                prisma.resume.count({ where: { userId, actionType: 'OPTIMIZE' } }),
                prisma.jobApplication.count({ where: { userId } }),
                prisma.userActivity.count({ where: { userId, actionType: 'COACH' } }),
                prisma.userActivity.findMany({ where: { userId }, select: { createdAt: true } }),
            ]);

            stats = {
                analyzed,
                optimized,
                jobsTracked,
                interviews,
                streak: calculateActivityStreak(activityDates),
            };
        } catch (error) {
            console.error("Failed to fetch dashboard stats:", error);
        }
    } else {
        // Optional: Redirect to login or just show local history
        // redirect('/sign-in'); 
    }

    return <DashboardClient serverHistory={serverHistory} stats={stats} />;
}
