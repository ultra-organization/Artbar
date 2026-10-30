import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { INSTRUCTORS, ARTBAR_BOOKING_URL } from '@/constants';
import { JpText } from '@/components/JpText';
import { getPublishedCopyPayload } from '@/lib/copy/published';
import { mergePublishedLocaleIntoContent } from '@/lib/copy/resolve';
import { getPublishedMediaMap } from '@/lib/media/published';
import { mergeMediaIntoContent } from '@/lib/media/resolve';
import { stripJpSentinel } from '@/lib/jp-attr';
import { absoluteUrl, ORGANIZATION_ID, WEBSITE_ID, safeJsonLd } from '@/lib/jsonld';
import { publicUrlForPath, siteLanguageToRouteLocale, localizePath } from '@/lib/locale-routing';
import { buildLocalizedAlternates, buildOpenGraph, getRequestLang } from '@/lib/request-lang';
import type { SiteLanguage } from '@/lib/language';

type Props = { params: Promise<{ slug: string }> };

async function getInstructor(slug: string, lang: SiteLanguage) {
  if (!INSTRUCTORS.some((instructor) => instructor.id === slug)) return null;
  const content = mergeMediaIntoContent(
    mergePublishedLocaleIntoContent(lang, await getPublishedCopyPayload(lang)),
    await getPublishedMediaMap(),
  );
  return content.instructors.find((instructor) => instructor.id === slug) ?? null;
}

export function generateStaticParams() {
  return INSTRUCTORS.map((instructor) => ({ slug: instructor.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getRequestLang();
  const instructor = await getInstructor(slug, lang);
  if (!instructor) notFound();
  const name = stripJpSentinel(instructor.name);
  const title = instructor.id === 'glicinapeony'
    ? `${name} | Artbar Tokyo`
    : lang === 'jp' ? `${name}｜Artbar Tokyo インストラクター` : `${name} | Artbar Tokyo Instructor`;
  const description = stripJpSentinel(lang === 'jp' ? instructor.descJp : instructor.descEn);
  return {
    title: { absolute: title },
    description,
    alternates: buildLocalizedAlternates(`/instructors/${slug}`, lang),
    openGraph: buildOpenGraph({ lang, title, description, images: [absoluteUrl(instructor.profileImage)] }),
  };
}

export default async function InstructorProfilePage({ params }: Props) {
  const { slug } = await params;
  const lang = await getRequestLang();
  const instructor = await getInstructor(slug, lang);
  if (!instructor) notFound();
  const locale = siteLanguageToRouteLocale(lang);
  const path = `/instructors/${slug}`;
  const url = publicUrlForPath(path, locale);
  const name = stripJpSentinel(instructor.name);
  const role = stripJpSentinel(lang === 'jp' ? instructor.roleJp : instructor.roleEn);
  const bio = stripJpSentinel(lang === 'jp' ? instructor.descJp : instructor.descEn);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': `${url}#webpage`,
    url,
    name,
    inLanguage: locale,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: {
      '@type': instructor.id === 'glicinapeony' ? 'Organization' : 'Person',
      name,
      description: bio,
      image: absoluteUrl(instructor.profileImage),
      ...(instructor.id !== 'glicinapeony' && { jobTitle: role, worksFor: { '@id': ORGANIZATION_ID } }),
    },
  };
  return (
    <div className="grain min-h-screen bg-artbar-bg pt-32 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <Link href={localizePath('/instructors', locale)} className="inline-flex min-h-11 items-center text-sm font-bold text-artbar-navy underline underline-offset-4">
          {lang === 'jp' ? '← インストラクター一覧' : '← All instructors'}
        </Link>
        <div className="mt-6 overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-sm">
          <div className="relative h-64 bg-artbar-bg sm:h-80">
            <Image src={instructor.artworkImage} alt={lang === 'jp' ? `${name}の作品` : `${name}'s Art`} fill priority className="object-cover" sizes="100vw" />
          </div>
          <div className="relative px-6 pb-10 sm:px-10">
            <div className="relative -mt-16 mb-6 h-32 w-32 overflow-hidden rounded-full border-[6px] border-white bg-white shadow-md">
              <Image src={instructor.profileImage} alt={name} fill className="object-cover" sizes="128px" />
            </div>
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-artbar-taupe"><JpText>{role}</JpText></p>
            <h1 className="font-heading text-4xl font-heavy text-artbar-navy md:text-5xl"><JpText>{name}</JpText></h1>
            <p className="mt-4 text-sm font-bold text-artbar-navy">{instructor.languages}</p>
            <p className="mt-6 max-w-3xl whitespace-pre-line text-lg leading-relaxed text-artbar-gray"><JpText>{bio}</JpText></p>
            <a href={ARTBAR_BOOKING_URL} className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-artbar-taupe px-7 py-3 font-heading font-bold text-artbar-navy hover:opacity-90 focus-visible:outline-2 focus-visible:outline-artbar-navy">
              {lang === 'jp' ? 'クラスを探す' : 'Explore classes'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
