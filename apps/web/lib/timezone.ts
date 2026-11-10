import { cookies } from 'next/headers';

/**
 * The visitor's timezone.
 *
 * The server cannot know where a reader is, so the browser leaves a note in a
 * cookie and the server reads it back. Without it the server's own day is
 * used, which is wrong for anybody whose evening has already become
 * tomorrow.
 */
export async function visitorTimeZone(): Promise<string | undefined> {
  const value = (await cookies()).get('gorosary-tz')?.value;
  if (!value) return undefined;

  // Only accept a timezone the runtime actually knows, rather than trusting
  // whatever a cookie happens to say.
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone: value }).format();
    return value;
  } catch {
    return undefined;
  }
}
