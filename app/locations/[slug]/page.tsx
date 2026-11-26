import { getPublishedCopyPayload } from '@/lib/copy/published';
import { mergePublishedLocaleIntoContent } from '@/lib/copy/resolve';
import { PageHero, PrimaryAction, TextLink } from '@/components/premium/Kit';
import { WRAP, h2Class } from '@/components/premium/styles';
import { LocationExperience } from '@/components/LocationExperience';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getArtbarLocationScheduleEmbedUrl,
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
import { getLocationBookingDestination, getLocationStudioScheduleUrl, STUDIO_CLASSES_ANCHOR } from '@/lib/location-booking';

type Props = { params: Promise<{ slug: string }> };

async function getPublishedLocationBySlug(slug: string, lang: 'en' | 'jp') {
  const sourceLocation = getLocationBySlug(slug);
  if (!sourceLocation) return null;
  const publishedContent = mergePublishedLocaleIntoContent(lang, await getPublishedCopyPayload(lang));
  return publishedContent.locations.find((location) => location.id === sourceLocation.id) ?? sourceLocation;
}

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
  const lang = await getRequestLang();
  const location = await getPublishedLocationBySlug(slug, lang);
  if (!location) notFound();
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
  const lang = await getRequestLang();
  const location = await getPublishedLocationBySlug(slug, lang);
  if (!location) notFound();
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
        lang: schemaLang,
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
    <main className="hp min-h-screen bg-artbar-bg pb-20 text-artbar-navy">
      <PageJsonLd path={path} lang={lang} name={name} description={description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(locationJsonLd) }} />
      <link
        rel="preload"
        as="image"
        imageSrcSet={nextImageSrcSet(locationImage)}
        imageSizes="(max-width: 1024px) 100vw, 50vw"
        fetchPriority="high"
      />

      <PageHero
        lang={lang}
        image={locationImage}
        alt={name}
        eyebrow={lang === 'jp' ? 'Artbar スタジオ' : 'Artbar Studio'}
        title={name}
        subtitle={description}
        actions={
          <>
            <PrimaryAction href={scheduleEmbedUrl ? `#${STUDIO_CLASSES_ANCHOR}` : bookingDestination.href}>
              {lang === 'jp' ? `${name}のクラスを見る` : `View ${name} classes`}
            </PrimaryAction>
            {location.mapUrl && (
              <TextLink tone="light" href={location.mapUrl} target="_blank" rel="noopener noreferrer">
                {lang === 'jp' ? 'Google Map' : 'Open Map'}
              </TextLink>
            )}
          </>
        }
      />

      <section className="py-16 md:py-24">
        <div className={WRAP}><dl className="grid border-t border-artbar-navy/15 md:grid-cols-2">
          <div className="border-b border-artbar-navy/10 py-7 md:border-b-0 md:pr-10">
            <dt className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe">{lang === 'jp' ? '住所' : 'Address'}</dt>
            <dd className="mt-3 whitespace-pre-line text-[16px] leading-[1.9] md:text-lg">{address}</dd>
          </div>
          <div className="py-7 md:border-l md:border-artbar-navy/10 md:pl-10">
            <dt className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe">{lang === 'jp' ? 'アクセス' : 'Transit Access'}</dt>
            <dd className="location-access-copy mt-3 whitespace-pre-line text-[15px] leading-[1.9] text-artbar-gray md:text-base">{access}</dd>
          </div>
        </dl></div>
      </section>

      <LocationExperience locationId={location.id} lang={lang} />

      {scheduleEmbedUrl && (
        <section id={STUDIO_CLASSES_ANCHOR} className="mt-16 scroll-mt-20 bg-[#F3F3ED] py-16 md:mt-24 md:py-24">
          {/* The transparent embed canvas lets this studio band supply its background. */}
          <div className={WRAP}>
            <p className="text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
              {lang === 'jp' ? 'このスタジオで予約する' : 'Book this studio'}
            </p>
            <h2 className={`mt-4 ${h2Class(lang)}`}>
              {lang === 'jp' ? `${name}の今後1週間のクラス` : `Upcoming classes at ${name}`}
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.95] text-artbar-gray md:text-base">
              {lang === 'jp'
                ? 'このスタジオで現在予約できるクラスをご覧ください。'
                : 'See what is available at this studio over the next seven days.'}
            </p>
            <div className="-mx-7 mt-10 sm:-mx-8 md:mx-0">
              <PaintaScheduleEmbed
                src={scheduleEmbedUrl}
                title={lang === 'jp' ? `${name}のクラススケジュール` : `${name} class schedule`}
              />
            </div>
            <div className="mt-10">
              <PrimaryAction href={getLocationStudioScheduleUrl(location.id, lang)}>
                {lang === 'jp' ? `${name}のすべてのクラスを見る` : `All classes at ${name}`}
              </PrimaryAction>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
