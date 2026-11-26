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
import { PageHero, PrimaryAction } from '@/components/premium/Kit';
import { WRAP } from '@/components/premium/styles';

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
  const jp = lang === 'jp';
  return (
    <div className="hp min-h-screen bg-artbar-bg pb-24 text-artbar-navy md:pb-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <PageHero
        lang={lang}
        image={instructor.artworkImage}
        alt={jp ? `${name}の作品` : `${name}'s Art`}
        eyebrow={<JpText>{role}</JpText>}
        title={<JpText>{name}</JpText>}
        subtitle={instructor.languages}
        actions={<PrimaryAction href={ARTBAR_BOOKING_URL}>{jp ? 'クラスを探す' : 'Explore classes'}</PrimaryAction>}
      />
      <section className="pt-16 md:pt-24">
        <div className={`${WRAP} grid gap-12 md:grid-cols-12 md:gap-16`}>
          <div className="md:col-span-4">
            <div className="relative aspect-[4/5] w-full max-w-xs overflow-hidden bg-white">
              <Image src={instructor.profileImage} alt={name} fill className="object-cover" sizes="(max-width: 768px) 80vw, 320px" />
              <div className="pointer-events-none absolute inset-3 border border-white/50" aria-hidden />
            </div>
          </div>
          <div className="md:col-span-8">
            <p className="whitespace-pre-line text-[16px] leading-[2.05] text-artbar-gray md:text-lg"><JpText>{bio}</JpText></p>
            <Link href={localizePath('/instructors', locale)} className="mt-10 inline-flex min-h-11 items-center gap-2 border-b border-artbar-navy/25 pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors hover:border-artbar-navy">
              {jp ? '← インストラクター一覧' : '← All instructors'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
