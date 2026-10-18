import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getArtbarLocationScheduleEmbedUrl,
  LOCATION_DEFAULT_OPENING_HOURS,
  LOCATION_DEFAULT_PRICE_RANGE,
} from '@/constants';
import { PageJsonLd } from '@/components/PageJsonLd';
import { buildOpenGraph, buildLocalizedAlternates, getRequestLang } from '@/lib/request-lang';
import { getLocationBySlug, getLocationPageSlugs, locationPath } from '@/lib/location-pages';
import { publicUrlForPath, siteLanguageToRouteLocale } from '@/lib/locale-routing';
import { buildLocalBusinessJsonLd, safeJsonLd } from '@/lib/jsonld';
import { nextImageSrcSet } from '@/lib/image-preload';
import { getPublishedMediaMap } from '@/lib/media/published';
import { mediaAssetUrl } from '@/lib/media/resolve';
import { PaintaScheduleEmbed } from '@/components/PaintaScheduleEmbed';
import { getLocationBookingDestination, getLocationFullScheduleUrl, STUDIO_CLASSES_ANCHOR } from '@/lib/location-booking';

type Props = { params: Promise<{ slug: string }> };

function locationCopy(location: NonNullable<ReturnType<typeof getLocationBySlug>>, lang: 'en' | 'jp') {
  const name = lang === 'jp' ? location.nameJp : location.nameEn;
  const address = lang === 'jp' ? location.addressJp : location.addressEn;
  const access = lang === 'jp' ? location.accessJp : location.accessEn;
  const title =
    lang === 'jp'
      ? `${name}｜アート体験・アクセス`
      : `${name} | Paint & Sip Classes & Access`;
  const description =
    lang === 'jp'
      ? `${name}へのアクセス、住所、最寄り駅案内。Artbarのペイント＆シップ体験を予約できます。`
      : `Find ${name}, including address, transit access, and booking links for Artbar paint and sip sessions.`;

  return { name, address, access, title, description };
}

export function generateStaticParams() {
  return getLocationPageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) notFound();

  const lang = await getRequestLang();
  const { title, description } = locationCopy(location, lang);
  const path = locationPath(location.id);

  return {
    title: { absolute: title },
    description,
    alternates: buildLocalizedAlternates(path, lang),
    openGraph: buildOpenGraph({ lang, title, description }),
  };
}

export default async function LocationDetailPage({ params }: Props) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);
  if (!location) notFound();

  const lang = await getRequestLang();
  const routeLocale = siteLanguageToRouteLocale(lang);
  const schemaLang = routeLocale === 'ja' ? 'ja' : 'en';
  const path = locationPath(location.id);
  const url = publicUrlForPath(path, routeLocale);
  const { name, address, access, description } = locationCopy(location, lang);
  const publishedMedia = await getPublishedMediaMap();
  const locationImage = mediaAssetUrl(publishedMedia, `locations.${location.id}`, location.image);
  const locationWithMedia = { ...location, image: locationImage };
  const scheduleEmbedUrl = getArtbarLocationScheduleEmbedUrl(
    location.id,
    lang === 'jp' ? 'ja' : 'en',
  );

  const bookingDestination = getLocationBookingDestination(location.id, lang);

  const locationJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      buildLocalBusinessJsonLd({
        location: locationWithMedia,
        pageUrl: url,
        lang: schemaLang,
        openingHours: location.openingHours ?? LOCATION_DEFAULT_OPENING_HOURS,
        priceRange: location.priceRange ?? LOCATION_DEFAULT_PRICE_RANGE,
      }),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: lang === 'jp' ? 'ホーム' : 'Home',
            item: publicUrlForPath('/', routeLocale),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: lang === 'jp' ? 'アクセス' : 'Locations',
            item: publicUrlForPath('/locations', routeLocale),
          },
          { '@type': 'ListItem', position: 3, name, item: url },
        ],
      },
    ],
  };

  return (
    <main className="grain min-h-screen bg-artbar-bg pt-32 pb-20">
      <PageJsonLd path={path} lang={lang} name={name} description={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(locationJsonLd) }} />
      <link
        rel="preload"
        as="image"
        imageSrcSet={nextImageSrcSet(locationImage)}
        imageSizes="(max-width: 1024px) 100vw, 50vw"
        fetchPriority="high"
      />

      <div className="mx-auto grid max-w-[1180px] gap-10 px-6 md:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-artbar-taupe">
            {lang === 'jp' ? 'Artbar スタジオ' : 'Artbar Studio'}
          </p>
          <h1 className="mb-6 font-heading text-4xl font-heavy leading-tight text-artbar-navy md:text-6xl">
            {name}
          </h1>
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-artbar-gray">{description}</p>

          <div className="space-y-6 rounded-lg border border-black/5 bg-white p-6 shadow-sm">
            <section>
              <h2 className="mb-2 font-heading text-lg font-bold text-artbar-navy">
                {lang === 'jp' ? '住所' : 'Address'}
              </h2>
              <p className="whitespace-pre-line text-artbar-gray">{address}</p>
            </section>
            <section>
              <h2 className="mb-2 font-heading text-lg font-bold text-artbar-navy">
                {lang === 'jp' ? 'アクセス' : 'Transit Access'}
              </h2>
              <p className="location-access-copy whitespace-pre-line text-artbar-gray">{access}</p>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={scheduleEmbedUrl ? `#${STUDIO_CLASSES_ANCHOR}` : bookingDestination.href}
              className="inline-flex min-h-[2.75rem] max-w-full items-center justify-center rounded-full bg-artbar-taupe px-6 py-2.5 text-center font-heading text-sm font-bold leading-snug text-artbar-navy shadow-sm transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artbar-navy focus-visible:ring-offset-2 sm:min-h-[3rem] sm:px-8 sm:text-base"
            >
              {bookingDestination.hasStudioClasses
                ? (lang === 'jp' ? 'このスタジオのクラスを見る' : 'View Studio Classes')
                : (lang === 'jp' ? '大阪のスケジュールを見る' : 'View Osaka Schedule')}
            </a>
            {location.mapUrl && (
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[2.75rem] max-w-full items-center justify-center rounded-full border border-artbar-navy px-6 py-2.5 text-center font-heading text-sm font-bold leading-snug text-artbar-navy transition hover:bg-artbar-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artbar-navy focus-visible:ring-offset-2 sm:min-h-[3rem] sm:px-8 sm:text-base"
              >
                {lang === 'jp' ? 'Google Map' : 'Open Map'}
              </a>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white shadow-xl">
          <Image
            src={locationImage}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>

      {scheduleEmbedUrl && (
        <section id={STUDIO_CLASSES_ANCHOR} className="mx-auto mt-16 scroll-mt-28 max-w-[1180px] px-4 sm:px-6 md:mt-20 md:px-10">
          {/* Card bg matches the Painta embed body (#F3F3ED), not white, so the
              iframe blends into the panel instead of showing a seam. */}
          <div className="overflow-hidden rounded-[2.5rem] bg-[#F3F3ED] py-10 shadow-sm sm:px-4 md:px-10 md:py-14">
            <div className="mx-4 mb-8 text-center sm:mx-0">
              <p className="mb-3 font-heading text-xs font-bold uppercase tracking-widest text-artbar-taupe">
                {lang === 'jp' ? 'このスタジオで予約する' : 'Book this studio'}
              </p>
              <h2 className="font-heading text-3xl font-heavy text-artbar-navy md:text-5xl">
                {lang === 'jp' ? `${name}の今後1週間のクラス` : `Upcoming classes at ${name}`}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base font-light leading-relaxed text-artbar-gray md:text-lg">
                {lang === 'jp'
                  ? 'このスタジオで現在予約できるクラスをご覧ください。'
                  : 'See what is available at this studio over the next seven days.'}
              </p>
            </div>
            <PaintaScheduleEmbed
              src={scheduleEmbedUrl}
              title={lang === 'jp' ? `${name}のクラススケジュール` : `${name} class schedule`}
            />
            <div className="mx-4 mt-8 text-center sm:mx-0">
              <a
                href={getLocationFullScheduleUrl(location.id, lang)}
                className="inline-flex min-h-[2.75rem] w-full max-w-full items-center justify-center rounded-full bg-artbar-taupe px-6 py-2.5 text-center font-heading text-sm font-bold leading-snug text-artbar-navy shadow-sm transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artbar-navy focus-visible:ring-offset-2 sm:min-h-[3rem] sm:w-auto sm:px-8 sm:text-base"
              >
                {lang === 'jp' ? '東京・横浜の全クラスを見る' : 'View all Tokyo & Yokohama classes'}
              </a>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
