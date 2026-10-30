import { defaultContent } from '@/data/content';
import { PageJsonLd } from '@/components/PageJsonLd';
import { Instructors } from '@/views/Instructors';
import { getPublishedCopyPayload } from '@/lib/copy/published';
import { mergePublishedLocaleIntoContent } from '@/lib/copy/resolve';
import { getPublishedMediaMap } from '@/lib/media/published';
import { mergeMediaIntoContent } from '@/lib/media/resolve';
import { absoluteUrl, safeJsonLd } from '@/lib/jsonld';
import { publicUrlForPath, siteLanguageToRouteLocale } from '@/lib/locale-routing';
import { stripJpSentinel } from '@/lib/jp-attr';
import type { Metadata } from 'next';
import { getRequestLang, buildOpenGraph, buildLocalizedAlternates } from '@/lib/request-lang';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const c = defaultContent[lang];
  return {
    title: c.instructorsPage.title,
    description: c.instructorsPage.subtitle,
    alternates: buildLocalizedAlternates('/instructors', lang),
    openGraph: buildOpenGraph({
      lang,
      title: c.instructorsPage.title,
      description: c.instructorsPage.subtitle,
    }),
  };
}

export default async function InstructorsPage() {
  const lang = await getRequestLang();
  const publishedContent = mergeMediaIntoContent(
    mergePublishedLocaleIntoContent(lang, await getPublishedCopyPayload(lang)),
    await getPublishedMediaMap(),
  );
  const c = publishedContent[lang];
  const pageUrl = publicUrlForPath('/instructors', siteLanguageToRouteLocale(lang));
  const instructorList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: c.instructorsPage.title,
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    numberOfItems: publishedContent.instructors.length,
    itemListElement: publishedContent.instructors.map((instructor, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Person',
        name: stripJpSentinel(instructor.name),
        url: publicUrlForPath(`/instructors/${instructor.id}`, siteLanguageToRouteLocale(lang)),
        jobTitle: stripJpSentinel(lang === 'jp' ? instructor.roleJp : instructor.roleEn),
        description: stripJpSentinel(lang === 'jp' ? instructor.descJp : instructor.descEn),
        image: absoluteUrl(instructor.profileImage),
      },
    })),
  };

  return (
    <>
      <PageJsonLd
        path="/instructors"
        lang={lang}
        name={c.instructorsPage.title}
        description={c.instructorsPage.subtitle}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(instructorList) }}
      />
      <Instructors />
    </>
  );
}
