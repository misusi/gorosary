'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Keeps the server and the reader in the same day.
 *
 * The server cannot know the reader's timezone, so the browser leaves one in
 * a cookie. If the day the server used is not the reader's day, the cookie
 * is written and the page is fetched again — which is what happens for a few
 * hours each evening, for anybody whose evening has already become
 * tomorrow.
 */
export function TimezoneSync({ serverDate }: { serverDate: string }) {
  const router = useRouter();

  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Intl.DateTimeFormat('en-CA', { timeZone }).format(
      new Date(),
    );
    if (today === serverDate) return;

    document.cookie = `gorosary-tz=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [serverDate, router]);

  return null;
}
