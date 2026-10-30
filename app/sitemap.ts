import type { MetadataRoute } from 'next';
import { defaultContent } from '@/data/content';
import { INSTRUCTORS } from '@/constants';
import { THEME_PAGE_SLUGS } from '@/data/generated-image-paths';
import { getCanonicalThemeSlug } from '@/data/theme-details';
import { SEO_GUIDE_SLUGS, guidePath } from '@/data/seo-guides';
import { getLocationPageSlugs } from '@/lib/location-pages';
import { localizePath, type RouteLocale } from '@/lib/locale-routing';
import { isBlogPostAvailableForLanguage } from '@/lib/blog-language';

const BASE_URL = 'https://artbar.co.jp';

function localizedEntry(
  path: string,
  locale: RouteLocale,
  options: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>,
  alternates: { includeEnglish?: boolean } = {}
): MetadataRoute.Sitemap[number] {
  const includeEnglish = alternates.includeEnglish ?? true;
  return {
    url: `${BASE_URL}${localizePath(path, locale)}`,
    alternates: {
      languages: {
        ja: `${BASE_URL}${localizePath(path, 'ja')}`,
        ...(includeEnglish && { en: `${BASE_URL}${localizePath(path, 'en')}` }),
        'x-default': `${BASE_URL}${localizePath(path, 'ja')}`,
      },
    },
    ...options,
  };
}

function localizedEntries(
  path: string,
  options: Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'>
): MetadataRoute.Sitemap {
  return [localizedEntry(path, 'ja', options), localizedEntry(path, 'en', options)];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    ...localizedEntries('/', { priority: 1.0, changeFrequency: 'weekly' }),
    ...localizedEntries('/instructors', { priority: 0.8, changeFrequency: 'monthly' }),
    ...localizedEntries('/team-building', { priority: 0.9, changeFrequency: 'monthly' }),
    ...localizedEntries('/private-parties', { priority: 0.9, changeFrequency: 'monthly' }),
    ...localizedEntries('/locations', { priority: 0.8, changeFrequency: 'monthly' }),
    ...localizedEntries('/paint-your-pet', { priority: 0.8, changeFrequency: 'monthly' }),
    ...localizedEntries('/contact', { priority: 0.7, changeFrequency: 'yearly' }),
    ...localizedEntries('/blog', { priority: 0.7, changeFrequency: 'weekly' }),
    ...localizedEntries('/guides', { priority: 0.8, changeFrequency: 'monthly' }),
    ...localizedEntries('/privacy-policy', { priority: 0.3, changeFrequency: 'yearly' }),
    ...localizedEntries('/terms-of-service', { priority: 0.3, changeFrequency: 'yearly' }),
    ...localizedEntries('/specified-commercial-transactions', {
      priority: 0.3,
      changeFrequency: 'yearly',
    }),
  ];

  const instructorRoutes: MetadataRoute.Sitemap = INSTRUCTORS.flatMap((instructor) =>
    localizedEntries(`/instructors/${instructor.id}`, { priority: 0.6, changeFrequency: 'monthly' as const })
  );

  const themeRoutes: MetadataRoute.Sitemap = THEME_PAGE_SLUGS.flatMap((slug) =>
    localizedEntries(`/themes/${getCanonicalThemeSlug(slug)}`, {
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })
  );

  const locationRoutes: MetadataRoute.Sitemap = getLocationPageSlugs().flatMap((slug) =>
    localizedEntries(`/locations/${slug}`, {
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })
  );

  const blogRoutes: MetadataRoute.Sitemap = defaultContent.blog
    .filter((post) => post.published)
    .flatMap((post) => {
      const includeEnglish = isBlogPostAvailableForLanguage(post, 'en');
      const options = {
        priority: 0.6,
        changeFrequency: 'yearly' as const,
      };
      return [
        localizedEntry(`/blog/${post.slug}`, 'ja', options, { includeEnglish }),
        ...(includeEnglish ? [localizedEntry(`/blog/${post.slug}`, 'en', options)] : []),
      ];
    });

  const guideRoutes: MetadataRoute.Sitemap = SEO_GUIDE_SLUGS.flatMap((slug) =>
    localizedEntries(guidePath(slug), {
      priority: 0.75,
      changeFrequency: 'monthly' as const,
    })
  );

  return [...staticRoutes, ...instructorRoutes, ...locationRoutes, ...themeRoutes, ...guideRoutes, ...blogRoutes];
}
