import { getPublishedCopyPayload } from '@/lib/copy/published';
import { mergePublishedLocaleIntoContent } from '@/lib/copy/resolve';
import { defaultContent } from '@/data/content';
import { PageJsonLd } from '@/components/PageJsonLd';
import { BlogList } from '@/views/BlogList';
import type { Metadata } from 'next';
import { getRequestLang, buildOpenGraph, buildLocalizedAlternates } from '@/lib/request-lang';
import { publicUrlForPath, siteLanguageToRouteLocale } from '@/lib/locale-routing';
import { absoluteUrl, ORGANIZATION_ID, safeJsonLd } from '@/lib/jsonld';
import { isBlogPostAvailableForLanguage } from '@/lib/blog-language';
import { getPublishedMediaMap } from '@/lib/media/published';
import { mediaAssetUrl } from '@/lib/media/resolve';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const c = defaultContent[lang];
  const title = lang === 'jp' ? 'Artbarジャーナル' : c.blogPage.title;
  return {
    title,
    description: c.blogPage.subtitle,
    alternates: buildLocalizedAlternates('/blog', lang),
    openGraph: buildOpenGraph({
      lang,
      title,
      description: c.blogPage.subtitle,
    }),
  };
}

export default async function BlogPage() {
  const lang = await getRequestLang();
  const publishedMedia = await getPublishedMediaMap();
  const publishedContent = mergePublishedLocaleIntoContent(lang, await getPublishedCopyPayload(lang));
  const c = defaultContent[lang];
  const title = lang === 'jp' ? 'Artbarジャーナル' : c.blogPage.title;
  const routeLocale = siteLanguageToRouteLocale(lang);
  const url = publicUrlForPath('/blog', routeLocale);
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${url}#blog`,
    publisher: { '@id': ORGANIZATION_ID },
    name: title,
    description: c.blogPage.subtitle,
    url,
    inLanguage: routeLocale === 'ja' ? 'ja' : 'en',
    blogPost: publishedContent.blog
      .filter((post) => isBlogPostAvailableForLanguage(post, lang))
      .slice(0, 12)
      .map((post) => ({
        '@type': 'BlogPosting',
        '@id': `${publicUrlForPath(`/blog/${post.slug}`, routeLocale)}#article`,
        inLanguage: routeLocale,
        publisher: { '@id': ORGANIZATION_ID },
        headline: lang === 'jp' ? post.titleJp : post.titleEn,
        url: publicUrlForPath(`/blog/${post.slug}`, routeLocale),
        image: absoluteUrl(mediaAssetUrl(publishedMedia, `blog.${post.slug}.cover`, post.image)),
        datePublished: post.date.replace(/\./g, '-'),
        author: { '@type': 'Person', name: lang === 'jp' ? post.authorJp : post.authorEn },
      })),
  };

  return (
    <>
      <PageJsonLd path="/blog" lang={lang} name={title} description={c.blogPage.subtitle} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(blogJsonLd) }} />
      <BlogList />
    </>
  );
}
