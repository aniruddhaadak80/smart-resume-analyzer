import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import TimelineClient from "@/components/TimelineClient";
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

    return (
        <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <TimelineClient serverActivities={activities} />
        </main>
    );
}
