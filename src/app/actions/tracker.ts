'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { logActivity } from '@/lib/activity-logger';

export type JobApplicationData = {
    jobTitle: string;
    company: string;
    location?: string;
    jobUrl?: string;
    status?: string;
    notes?: string;
    salary?: string;
    color?: string;
};

// Get all applications for the current user
export async function getApplications() {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Not authenticated', data: [] };

    try {
        const applications = await prisma.jobApplication.findMany({
            where: { userId },
            orderBy: [{ position: 'asc' }, { updatedAt: 'desc' }],
        });
        return { success: true, data: applications };
    } catch (error) {
        console.error('Failed to fetch applications:', error);
        return { success: false, error: 'Failed to fetch applications', data: [] };
    }
}

// Create a new application
export async function createApplication(data: JobApplicationData) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        const application = await prisma.jobApplication.create({
            data: {
                userId,
                jobTitle: data.jobTitle,
                company: data.company,
                location: data.location || null,
                jobUrl: data.jobUrl || null,
                status: data.status || 'wishlist',
                notes: data.notes || null,
                salary: data.salary || null,
                color: data.color || null,
                appliedDate: data.status === 'applied' ? new Date() : null,
            },
        });
        await logActivity(userId, 'TRACKER', {
            action: 'CREATED_JOB',
            jobTitle: data.jobTitle,
            company: data.company
        });
        revalidatePath('/tracker');
        return { success: true, data: application };
    } catch (error) {
        console.error('Failed to create application:', error);
        return { success: false, error: 'Failed to create application' };
    }
}

// Update an application (e.g., move to another column)
export async function updateApplication(id: string, data: Partial<JobApplicationData> & { position?: number }) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        const updateData: any = { ...data };

        // If moving to "applied" status, set the applied date
        if (data.status === 'applied') {
            updateData.appliedDate = new Date();
        }

        const application = await prisma.jobApplication.update({
            where: { id, userId },
            data: updateData,
        });

        await logActivity(userId, 'TRACKER', {
            action: 'UPDATED_JOB_STATUS',
            status: updateData.status || 'unknown',
            jobTitle: application.jobTitle
        });

        revalidatePath('/tracker');
        return { success: true, data: application };
    } catch (error) {
        console.error('Failed to update application:', error);
        return { success: false, error: 'Failed to update application' };
    }
}

// Delete an application
export async function deleteApplication(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Not authenticated' };

    try {
        const app = await prisma.jobApplication.delete({
            where: { id, userId },
        });
        await logActivity(userId, 'TRACKER', {
            action: 'DELETED_JOB',
            jobTitle: app.jobTitle,
            company: app.company
        });
        revalidatePath('/tracker');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete application:', error);
        return { success: false, error: 'Failed to delete application' };
    }
}
