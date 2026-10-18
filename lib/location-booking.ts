import { ARTBAR_BOOKING_URL, getArtbarLocationScheduleEmbedUrl } from '../constants';
import { localizeHrefForLanguage, stripLocalePrefix } from './locale-routing';
import { getLocationBySlug, locationPath } from './location-pages';
import type { SiteLanguage } from './language';

export const STUDIO_CLASSES_ANCHOR = 'studio-classes';
const ARTBAR_OSAKA_SCHEDULE_URL = 'https://tickets.artbar.co.jp';

/** These full-schedule destinations intentionally show every studio in the region. */
export function getLocationFullScheduleUrl(locationId: string, lang: SiteLanguage): string {
  const locale = lang === 'jp' ? 'ja' : 'en';
  return locationId.startsWith('osaka_')
    ? `${ARTBAR_OSAKA_SCHEDULE_URL}/${locale}/artbar-osaka`
    : `${ARTBAR_BOOKING_URL}/${locale}`;
}

/** Shared schedule controls follow the region only on a known studio page. */
export function getScheduleUrlForPathname(pathname: string, lang: SiteLanguage): string {
  const match = stripLocalePrefix(pathname).match(/^\/locations\/([^/]+)$/);
  const location = match ? getLocationBySlug(match[1]) : null;
  return location ? getLocationFullScheduleUrl(location.id, lang) : ARTBAR_BOOKING_URL;
}

/** Tokyo studio links lead to the verified, location-filtered list on its page. */
export function getLocationBookingDestination(locationId: string, lang: SiteLanguage) {
  const hasStudioClasses = getArtbarLocationScheduleEmbedUrl(
    locationId,
    lang === 'jp' ? 'ja' : 'en',
  ) !== null;

  return {
    href: hasStudioClasses
      ? `${localizeHrefForLanguage(locationPath(locationId), lang)}#${STUDIO_CLASSES_ANCHOR}`
      : getLocationFullScheduleUrl(locationId, lang),
    hasStudioClasses,
  };
}
