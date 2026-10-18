import 'server-only';
import { ARTBAR_BOOKING_URL, ARTBAR_TOKYO_EMAIL, SOCIAL_PROFILE_URLS } from '@/constants';
import type { Location } from '@/types';
import { studioDisplayName } from '@/lib/jp-display';
import { locationPath } from '@/lib/location-pages';
import { publicUrlForPath } from '@/lib/locale-routing';

/**
 * JSON.stringify with `</` escaped to `<\/` to prevent the JSON payload
 * from terminating the surrounding `<script>` tag if any field ever
 * contains the string `</script>`.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/<\/(?=script)/gi, '<\\/');
}

export const SITE_URL = 'https://artbar.co.jp';
export const SITE_NAME = 'Artbar Tokyo';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export function absoluteUrl(pathOrUrl: string): string {
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: 'Paint Garage LLC.',
    url: SITE_URL,
    logo: absoluteUrl('/brand/artbar-logo-dark.png'),
    image: absoluteUrl('/og-image.png'),
    email: ARTBAR_TOKYO_EMAIL,
    sameAs: SOCIAL_PROFILE_URLS,
    areaServed: [
      { '@type': 'City', name: 'Tokyo' },
      { '@type': 'City', name: 'Yokohama' },
    ],
    knowsAbout: [
      'Paint and sip classes',
      'Art workshops',
      'Private painting parties',
      'Corporate team building',
      'Bilingual art instruction',
    ],
  };
}

export function buildWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: ['ja', 'en'],
    potentialAction: {
      '@type': 'ReserveAction',
      target: ARTBAR_BOOKING_URL,
      name: 'View Artbar Tokyo schedule',
    },
  };
}

export function buildWebPageJsonLd({
  url,
  name,
  description,
  lang,
}: {
  url: string;
  name: string;
  description?: string;
  lang: 'ja' | 'en';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    ...(description && { description }),
    inLanguage: lang,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
  };
}

export function buildServiceJsonLd({
  url,
  name,
  description,
  serviceType,
}: {
  url: string;
  name: string;
  description?: string;
  serviceType: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    url,
    serviceType,
    provider: { '@id': ORGANIZATION_ID },
    areaServed: [
      { '@type': 'City', name: 'Tokyo' },
      { '@type': 'City', name: 'Yokohama' },
    ],
    ...(description && { description }),
  };
}

export function buildLocalBusinessJsonLd({
  location,
  lang,
}: {
  location: Location;
  lang: 'ja' | 'en';
}) {
  const name = studioDisplayName(lang === 'ja' ? location.nameJp : location.nameEn);
  const address = lang === 'ja' ? location.addressJp : location.addressEn;
  const path = locationPath(location.id);
  // A studio remains one physical entity across translations and listing/detail pages.
  const studioSite = location.id.startsWith('osaka_') ? 'https://osaka.artbar.co.jp' : SITE_URL;
  const studioId = `${studioSite}${path}#localbusiness`;
  const url = publicUrlForPath(path, lang);
  const postalCode = location.addressJp.match(/\d{3}-\d{4}/)?.[0];

  return {
    '@type': 'LocalBusiness',
    '@id': studioId,
    name,
    image: absoluteUrl(location.image),
    url,
    parentOrganization: location.id.startsWith('osaka_')
      ? { '@type': 'Organization', '@id': `${studioSite}/#organization`, name: 'Artbar Osaka' }
      : { '@id': ORGANIZATION_ID },
    email: location.id.startsWith('osaka_') ? 'osaka@artbar.co.jp' : ARTBAR_TOKYO_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressCountry: 'JP',
      ...(postalCode && { postalCode }),
    },
    ...(location.geo && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: location.geo.latitude,
        longitude: location.geo.longitude,
      },
    }),
    // Publish only verified, studio-specific values; class times are not opening hours.
    ...(location.openingHours?.length && { openingHours: location.openingHours }),
    ...(location.priceRange && { priceRange: location.priceRange }),
    ...(location.mapUrl && { hasMap: location.mapUrl }),
  };
}
