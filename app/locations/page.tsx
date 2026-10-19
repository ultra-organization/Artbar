import { getPublishedCopyPayload } from '@/lib/copy/published';
import { mergePublishedLocaleIntoContent } from '@/lib/copy/resolve';
import { Locations } from '@/views/Locations';
import { PageJsonLd } from '@/components/PageJsonLd';
import {
  LOCATIONS,
} from '@/constants';
import { nextImageSrcSet } from '@/lib/image-preload';
import { getPublishedMediaMap } from '@/lib/media/published';
import { mediaAssetUrl } from '@/lib/media/resolve';
import type { Metadata } from 'next';
import { getRequestLang, buildOpenGraph, buildLocalizedAlternates } from '@/lib/request-lang';
import { buildLocalBusinessJsonLd, safeJsonLd } from '@/lib/jsonld';
import { siteLanguageToRouteLocale } from '@/lib/locale-routing';

export async function generateMetadata(): Promise<Metadata> {
  // No JP entries exist for the locations page hero/title — fall back to JP-equivalent
  // copy derived from the existing nav label. og:locale follows the route language.
  const lang = await getRequestLang();
  const title = lang === 'jp' ? 'スタジオアクセス' : 'Our Locations';
  const description =
    lang === 'jp'
      ? '代官山・原宿・銀座・横浜・大阪のArtbarペイント＆シップ・スタジオ案内。'
      : 'Find Artbar paint and sip studios in Daikanyama, Harajuku, Ginza, Yokohama, and Osaka.';
  return {
    title,
    description,
    alternates: buildLocalizedAlternates('/locations', lang),
    openGraph: buildOpenGraph({ lang, title, description }),
  };
}

export default async function LocationsPage() {
  const lang = await getRequestLang();
  const publishedMedia = await getPublishedMediaMap();
  const publishedContent = mergePublishedLocaleIntoContent(lang, await getPublishedCopyPayload(lang));
  const title = lang === 'jp' ? 'スタジオアクセス' : 'Our Locations';
  const description =
    lang === 'jp'
      ? '代官山・原宿・銀座・横浜・大阪のArtbarペイント＆シップ・スタジオ案内。'
      : 'Find Artbar paint and sip studios in Daikanyama, Harajuku, Ginza, Yokohama, and Osaka.';
  const routeLocale = siteLanguageToRouteLocale(lang);
  const schemaLang = routeLocale === 'ja' ? 'ja' : 'en';
  const locationsJsonLd = {
    '@context': 'https://schema.org',
    '@graph': publishedContent.locations.map((loc) => {
      const location = {
        ...loc,
        image: mediaAssetUrl(publishedMedia, `locations.${loc.id}`, loc.image),
      };
      return buildLocalBusinessJsonLd({
        location,
        lang: schemaLang,
      });
    }),
  };
  // Preload the first two location images (above the fold on most viewports)
  const preloadLocationImages = LOCATIONS.slice(0, 2).map((loc) =>
    mediaAssetUrl(publishedMedia, `locations.${loc.id}`, loc.image)
  );

  return (
    <>
      <PageJsonLd path="/locations" lang={lang} name={title} description={description} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(locationsJsonLd) }}
      />
      {preloadLocationImages.map((src) => (
        <link
          key={src}
          rel="preload"
          as="image"
          imageSrcSet={nextImageSrcSet(src)}
          imageSizes="(max-width: 1024px) 100vw, 40vw"
          fetchPriority="high"
        />
      ))}
      <Locations />
    </>
  );
}
