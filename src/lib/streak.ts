/**
 * Pure helpers for the dashboard activity streak.
 *
 * A "streak" is the number of consecutive days (ending today, or yesterday
 * when today has no activity yet) on which the user did something.
 */

/** Formats a date as a local `YYYY-MM-DD` key so days can be compared. */
export function toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Counts the consecutive days of activity.
 *
 * @param activities anything with a `createdAt` timestamp.
 * @param now the reference "today" (defaults to the current time).
 */
export function calculateActivityStreak(
    activities: Array<{ createdAt: Date | string }>,
    now: Date = new Date()
): number {
    const activeDays = new Set<string>();

    for (const activity of activities) {
        const date = activity.createdAt instanceof Date
            ? activity.createdAt
            : new Date(activity.createdAt);

        if (Number.isNaN(date.getTime())) continue;

        activeDays.add(toLocalDateKey(date));
    }

    if (activeDays.size === 0) return 0;

    const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // A streak stays alive until the end of the following day, so if there is
    // no activity yet today we look at yesterday.
    if (!activeDays.has(toLocalDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
        if (!activeDays.has(toLocalDateKey(cursor))) return 0;
    }

    let streak = 0;
    while (activeDays.has(toLocalDateKey(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}
