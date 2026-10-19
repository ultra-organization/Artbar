import { ARTBAR_BOOKING_URL, ARTBAR_BOOKING_LOCATION_IDS, getArtbarLocationScheduleEmbedUrl } from '../constants';
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

/** A studio's full schedule must retain its explicit booking-location filter. */
export function getLocationStudioScheduleUrl(locationId: string, lang: SiteLanguage): string {
  const ids = ARTBAR_BOOKING_LOCATION_IDS[locationId];
  if (!ids?.length) throw new Error(`Unknown Artbar studio: ${locationId}`);
  const url = new URL(getLocationFullScheduleUrl(locationId, lang));
  url.searchParams.set('locationId', ids.join(','));
  return url.toString();
}

/** Shared schedule controls follow the region only on a known studio page. */
export function getScheduleUrlForPathname(pathname: string, lang: SiteLanguage): string {
  const match = stripLocalePrefix(pathname).match(/^\/locations\/([^/]+)$/);
  const location = match ? getLocationBySlug(match[1]) : null;
  return location ? getLocationFullScheduleUrl(location.id, lang) : ARTBAR_BOOKING_URL;
}

/** Studio links lead to the verified, location-filtered list on its page. */
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
