import { getPublishedCopyPayload } from '@/lib/copy/published';
import { mergePublishedLocaleIntoContent } from '@/lib/copy/resolve';
import { defaultContent } from '@/data/content';
import { BlogPost } from '@/views/BlogPost';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { nextImageSrcSet } from '@/lib/image-preload';
import { getRequestLang, buildOpenGraph, buildLocalizedAlternates } from '@/lib/request-lang';
import { absoluteUrl, ORGANIZATION_ID, WEBSITE_ID, safeJsonLd } from '@/lib/jsonld';
import { publicUrlForPath, siteLanguageToRouteLocale } from '@/lib/locale-routing';
import { isBlogPostAvailableForLanguage } from '@/lib/blog-language';
import { metaDescription } from '@/lib/seo-text';
import { getPublishedMediaMap } from '@/lib/media/published';
import { mediaAssetUrl } from '@/lib/media/resolve';

type Props = { params: Promise<{ slug: string }> };

function getPostBySlug(slug: string) {
  return defaultContent.blog.find(p => p.slug === slug && p.published);
}

export function generateStaticParams() {
  return defaultContent.blog
    .filter((post) => post.published)
    .map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sourcePost = getPostBySlug(slug);
  if (!sourcePost) return { title: 'Blog | Artbar Tokyo' };
  const lang = await getRequestLang();
  const publishedContent = mergePublishedLocaleIntoContent(lang, await getPublishedCopyPayload(lang));
  const post = publishedContent.blog.find((item) => item.slug === slug) ?? sourcePost;
  const publishedMedia = await getPublishedMediaMap();
  const postImage = mediaAssetUrl(publishedMedia, `blog.${post.slug}.cover`, post.image);
  const title = lang === 'jp' ? post.titleJp : post.titleEn;
  const isIndexable = isBlogPostAvailableForLanguage(post, lang);
  const hasEnglishVersion = isBlogPostAvailableForLanguage(post, 'en');
  const description = metaDescription(lang === 'jp' ? post.excerptJp : post.excerptEn, lang === 'jp' ? 110 : 155);
  const twitterImage = encodeURI(postImage || '/og-image.png');
  return {
    title,
    description,
    alternates: hasEnglishVersion
      ? buildLocalizedAlternates(`/blog/${slug}`, lang)
      : {
          canonical: `/blog/${slug}`,
          languages: { ja: `/blog/${slug}`, 'x-default': `/blog/${slug}` },
        },
    ...(!isIndexable && { robots: { index: false, follow: true } }),
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twitterImage],
    },
    openGraph: buildOpenGraph({
      lang,
      title,
      description,
      type: 'article',
      images: postImage ? [{ url: postImage }] : undefined,
    }),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const sourcePost = getPostBySlug(slug);
  if (!sourcePost) notFound();
  const lang = await getRequestLang();
  const publishedContent = mergePublishedLocaleIntoContent(lang, await getPublishedCopyPayload(lang));
  const post = publishedContent.blog.find((item) => item.slug === slug) ?? sourcePost;
  const publishedMedia = await getPublishedMediaMap();
  const postImage = mediaAssetUrl(publishedMedia, `blog.${post.slug}.cover`, post.image);
  const headline = lang === 'jp' ? post.titleJp : post.titleEn;
  const authorName = lang === 'jp' ? post.authorJp : post.authorEn;
  const routeLocale = siteLanguageToRouteLocale(lang);
  const postUrl = publicUrlForPath(`/blog/${slug}`, routeLocale);
  const blogUrl = publicUrlForPath('/blog', routeLocale);
  const homeUrl = publicUrlForPath('/', routeLocale);

  // post.date arrives as "YYYY.MM.DD" in source data; normalize to ISO 8601 for schema.org.
  const isoDate = post.date.replace(/\./g, '-');

  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${postUrl}#article`,
    url: postUrl,
    inLanguage: routeLocale,
    isPartOf: { '@id': `${blogUrl}#blog` },
    headline,
    ...(postImage && { image: absoluteUrl(postImage) }),
    datePublished: isoDate,
    author: { '@type': 'Person', name: authorName },
    publisher: { '@id': ORGANIZATION_ID },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${postUrl}#webpage`,
      url: postUrl,
      inLanguage: routeLocale,
      isPartOf: { '@id': WEBSITE_ID },
    },
    ...(post.tags?.length ? { keywords: post.tags.join(', ') } : {}),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: lang === 'jp' ? 'ホーム' : 'Home', item: homeUrl },
      { '@type': 'ListItem', position: 2, name: lang === 'jp' ? 'ブログ' : 'Blog', item: blogUrl },
      { '@type': 'ListItem', position: 3, name: headline, item: postUrl },
    ],
  };

  return (
    <>
      {isBlogPostAvailableForLanguage(post, lang) && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(blogJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      {postImage && (
        <link
          rel="preload"
          as="image"
          imageSrcSet={nextImageSrcSet(postImage)}
          imageSizes="100vw"
          fetchPriority="high"
        />
      )}
      <BlogPost />
    </>
  );
}
