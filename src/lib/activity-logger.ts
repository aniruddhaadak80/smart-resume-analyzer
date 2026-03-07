import { prisma } from './prisma';

export type ActivityActionType = 'LOGIN' | 'SIGNUP' | 'ANALYZE' | 'OPTIMIZE' | 'TRACKER' | 'COACH' | 'CHAT';

/**
 * Logs a user activity strictly to the new UserActivity table.
 * Used for the comprehensive chronological timeline view.
 */
export async function logActivity(userId: string, actionType: ActivityActionType, details?: any) {
    if (!userId) return;

    try {
        await prisma.userActivity.create({
            data: {
                userId,
                actionType,
                details: details ? JSON.stringify(details) : null
            }
        });
    } catch (error) {
        console.error('Failed to log user activity:', error);
    }
}
