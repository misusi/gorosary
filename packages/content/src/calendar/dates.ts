/**
 * Date helpers.
 *
 * Every date in the liturgical engine is handled in UTC and normalized to
 * midnight. A prayer app must never have "today" shift because the device
 * crossed a timezone boundary at 11pm, so we deal in whole days only.
 */

export const MS_PER_DAY = 86_400_000;

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export type WeekdayName = (typeof WEEKDAY_NAMES)[number];

export function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export function startOfUtcDay(date: Date): Date {
  // `getUTCMonth()` is 0-based; `utcDate()` takes a 1-based month.
  return utcDate(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
  );
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round(
    (startOfUtcDay(to).getTime() - startOfUtcDay(from).getTime()) / MS_PER_DAY,
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfUtcDay(a).getTime() === startOfUtcDay(b).getTime();
}

export function sundayOnOrAfter(date: Date): Date {
  const day = startOfUtcDay(date);
  return addDays(day, (7 - day.getUTCDay()) % 7);
}

export function sundayOnOrBefore(date: Date): Date {
  const day = startOfUtcDay(date);
  return addDays(day, -day.getUTCDay());
}

export function toIsoDate(date: Date): string {
  const day = startOfUtcDay(date);
  return day.toISOString().slice(0, 10);
}

/** Month/day key used to match fixed-date feasts, e.g. `09-15`. */
export function monthDayKey(date: Date): string {
  const day = startOfUtcDay(date);
  const month = `${day.getUTCMonth() + 1}`.padStart(2, '0');
  const dayOfMonth = `${day.getUTCDate()}`.padStart(2, '0');
  return `${month}-${dayOfMonth}`;
}

/**
 * The civil date of an instant, in the runtime's own timezone.
 *
 * The liturgical engine works in whole UTC days so that its arithmetic is
 * exact, but "today" has to mean *the user's* today. A device in New York at
 * 9pm is already on the next day in UTC; using UTC there would tell a
 * Catholic praying the Rosary the wrong mystery.
 *
 * So we take the local year/month/day from the instant and pin them to UTC
 * midnight, giving the engine a stable day while keeping the user's day.
 */
export function localToday(now: Date = new Date()): Date {
  return utcDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}
