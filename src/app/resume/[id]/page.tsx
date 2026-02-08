import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ResumeDetailClient from '@/components/ResumeDetailClient';

export default async function ResumeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
        redirect('/sign-in');
    }

    const resume = await prisma.resume.findUnique({
        where: { id },
    });

    if (!resume || resume.userId !== userId) {
        redirect('/dashboard');
    }

    return <ResumeDetailClient resume={resume} />;
}
