'use client';

import { useEffect, useState } from 'react';

/**
 * Holiday decorations on the home page: string lights on the hero, holly accents and a
 * gift certificate banner. Evaluated in Tokyo time.
 *
 * - `enabled` is the one switch: set it to `false` to take everything down early.
 * - Outside `start`–`end` the decorations hide themselves, so they come down after 31 December
 *   and return next November without anyone touching the code.
 * - Add `?holiday=on` (or `?holiday=off`) to any URL to preview the theme out of season.
 */
export const HOLIDAY_THEME = {
  enabled: true,
  start: { month: 11, day: 1 },
  end: { month: 12, day: 31 },
} as const;

export function holidayThemeActiveAt(date: Date): boolean {
  if (!HOLIDAY_THEME.enabled) return false;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric' }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const md = get('month') * 100 + get('day');
  const { start, end } = HOLIDAY_THEME;
  return md >= start.month * 100 + start.day && md <= end.month * 100 + end.day;
}

/**
 * Whether the holiday theme shows. Static HTML renders without it; the client turns it on after
 * hydration, so a cached page never shows decorations after the season ends.
 */
export function useHolidayTheme(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const preview = new URLSearchParams(window.location.search).get('holiday');
    setActive(preview === 'on' ? true : preview === 'off' ? false : holidayThemeActiveAt(new Date()));
  }, []);
  return active;
}
