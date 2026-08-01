/**
 * Calendar-day helpers.
 *
 * Every DATE column in this schema (`activity_date`, `due_on`, challenge dates)
 * stores a local calendar day, so it must never be derived from a UTC instant —
 * `toISOString()` would shift the day for anyone east or west of UTC.
 */

/** `YYYY-MM-DD` for a date, in local time. */
export const dayKey = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Today as a `YYYY-MM-DD` key. */
export const todayKey = () => dayKey(new Date());

export const addDays = (date, amount) => {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
};

/** Monday of the week the given date falls in — weeks run Monday to Sunday. */
export const startOfWeek = (date) => {
    const weekday = date.getDay();
    const offset = weekday === 0 ? -6 : 1 - weekday;
    const start = addDays(date, offset);
    start.setHours(0, 0, 0, 0);
    return start;
};

/** Normalise a MySQL DATE (driver-dependent: Date or string) to a day key. */
export const toDayKey = (value) => {
    if (!value) return null;
    return dayKey(value instanceof Date ? value : new Date(value));
};
