'use server';

import { logActivity } from "@/lib/activity-logger";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function logLogin(providedUserId: string) {
    const { userId } = await auth();
    if (!userId || userId !== providedUserId) return { logged: false };

    // Use a short-lived cookie to strictly prevent spamming the database on every page load
    const cookieStore = await cookies();
    if (cookieStore.get('has_logged_in_session')) {
        return { logged: false };
    }

    try {
        await logActivity(userId, 'LOGIN');

        // Set cookie so we don't log them again for this session (expires in 12 hours)
        cookieStore.set('has_logged_in_session', 'true', { maxAge: 60 * 60 * 12 });
        return { logged: true };
    } catch (error) {
        console.error("Failed to log login event:", error);
        return { logged: false };
    }
}
