'use client';

import { useEffect, useState } from 'react';

/**
 * Year-end party promotion window, in Tokyo time: 1 September to 7 January inclusive.
 * The studio team asked for it to appear every autumn and come down after New Year.
 */
export const YEAR_END_SEASON = { start: { month: 9, day: 1 }, end: { month: 1, day: 7 } } as const;

/** Season shown in the static HTML; the client re-checks the real date after hydration. */
const BUILD_SEASON = { active: true, year: 2026 };

export type YearEndSeason = { active: boolean; year: number };

export function yearEndSeasonAt(date: Date): YearEndSeason {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const { start, end } = YEAR_END_SEASON;

  const afterStart = month > start.month || (month === start.month && day >= start.day);
  const beforeEnd = month < end.month || (month === end.month && day <= end.day);
  if (afterStart) return { active: true, year };
  if (beforeEnd) return { active: true, year: year - 1 };
  return { active: false, year };
}

/** Whether the year-end promotion should show today, and which year's parties it is for. */
export function useYearEndSeason(): YearEndSeason {
  const [season, setSeason] = useState<YearEndSeason>(BUILD_SEASON);
  useEffect(() => {
    setSeason(yearEndSeasonAt(new Date()));
  }, []);
  return season;
}
