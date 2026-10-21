/**
 * Pure helpers for filtering timeline activity by a custom date range.
 *
 * Kept free of React/Next imports so the logic can be unit tested in isolation.
 */

export type ActivityLike = {
    createdAt: string | Date;
};

export type DateRange = {
    /** `YYYY-MM-DD` string taken from an `<input type="date">`. Empty means "no lower bound". */
    from: string;
    /** `YYYY-MM-DD` string taken from an `<input type="date">`. Empty means "no upper bound". */
    to: string;
};

export const EMPTY_DATE_RANGE: DateRange = { from: '', to: '' };

/**
 * Parses a `YYYY-MM-DD` string into a local `Date`.
 * `endOfDay` moves the timestamp to 23:59:59.999 so the whole day is included.
 */
function parseDateInput(value: string, endOfDay: boolean): Date | null {
    if (!value) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (month < 1 || month > 12 || day < 1 || day > 31) return null;

    const date = endOfDay
        ? new Date(year, month - 1, day, 23, 59, 59, 999)
        : new Date(year, month - 1, day, 0, 0, 0, 0);

    // Guard against roll-over dates such as 2024-02-31 -> March 2nd
    if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

    return date;
}

/** True when the range is usable: both bounds parse and `from` is not after `to`. */
export function isValidDateRange(range: DateRange): boolean {
    const { from, to } = range;

    if (!from && !to) return true;

    const start = parseDateInput(from, false);
    const end = parseDateInput(to, true);

    if (from && !start) return false;
    if (to && !end) return false;
    if (start && end && start.getTime() > end.getTime()) return false;

    return true;
}

/** True when at least one bound is set (i.e. the filter is active). */
export function hasDateRange(range: DateRange): boolean {
    return Boolean(range.from || range.to);
}

/**
 * Returns true when `date` falls inside the range.
 * Both boundaries are inclusive and the upper bound covers the whole selected day.
 */
export function isWithinDateRange(date: Date, range: DateRange): boolean {
    const start = parseDateInput(range.from, false);
    const end = parseDateInput(range.to, true);

    if (start && date.getTime() < start.getTime()) return false;
    if (end && date.getTime() > end.getTime()) return false;

    return true;
}

/**
 * Filters a list of activities down to the ones that happened inside the range.
 * An empty range returns the list untouched.
 */
export function filterActivitiesByDateRange<T extends ActivityLike>(
    activities: T[],
    range: DateRange
): T[] {
    if (!hasDateRange(range)) return activities;
    if (!isValidDateRange(range)) return [];

    return activities.filter((activity) => {
        const date = activity.createdAt instanceof Date
            ? activity.createdAt
            : new Date(activity.createdAt);

        if (Number.isNaN(date.getTime())) return false;

        return isWithinDateRange(date, range);
    });
}
