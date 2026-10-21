import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import TimelineClient from "@/components/TimelineClient";
import EmptyState from "@/components/EmptyState";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Activity Timeline | careerzen",
};

export default async function TimelinePage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    // Fetch chronological activities
    const activities = await prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    // Nothing has happened yet — show a friendly illustrated empty state instead
    // of an empty timeline shell.
    if (activities.length === 0) {
        return (
            <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
                        Activity Timeline
                    </h1>
                    <p className="text-slate-400 mt-2">A comprehensive, step-by-step history of your journey.</p>
                </div>

                <EmptyState
                    variant="timeline"
                    title="Your timeline is empty"
                    description="Every action you take on careerzen — analyses, optimisations, applications and coaching sessions — is collected here so you can look back on your progress."
                    actionLabel="Analyse your first resume"
                    actionHref="/"
                />
            </main>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <TimelineClient serverActivities={activities} />
        </main>
    );
}
