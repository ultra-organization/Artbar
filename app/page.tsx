import { defaultContent } from '@/data/content';
import { PageJsonLd } from '@/components/PageJsonLd';
import { HomePremium as Home } from '@/views/HomePremium';
import { HERO_HOME_VIDEO_DESKTOP, HERO_HOME_VIDEO_MOBILE } from '@/constants';
import { nextImageSrcSet } from '@/lib/image-preload';
import { getPublishedMediaMap } from '@/lib/media/published';
import { mediaAssetUrl } from '@/lib/media/resolve';
import type { Metadata } from 'next';
import { getRequestLang, buildOpenGraph, buildLocalizedAlternates } from '@/lib/request-lang';

function cleanCopy(s: string): string {
  return s.replace(/<wbr\s*\/?>/g, '').replace(/\s*\n\s*/g, ' ').trim();
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const c = defaultContent[lang];
  const title =
    lang === 'jp'
      ? `${c.home.hero.title}${c.home.hero.titleHighlight}`
      : 'Artbar Tokyo | Paint & Sip Studio';
  const description = cleanCopy(c.home.hero.subtitle);
  return {
    title: { absolute: title },
    description,
    alternates: buildLocalizedAlternates('/', lang),
    openGraph: buildOpenGraph({ lang, title, description }),
  };
}

export default async function HomePage() {
  const lang = await getRequestLang();
  const publishedMedia = await getPublishedMediaMap();
  const c = defaultContent[lang];
  const title =
    lang === 'jp'
      ? `${c.home.hero.title}${c.home.hero.titleHighlight}`
      : 'Artbar Tokyo | Paint & Sip Studio';
  const description = cleanCopy(c.home.hero.subtitle);
  const desktopHero = mediaAssetUrl(publishedMedia, 'home.hero.desktop', HERO_HOME_VIDEO_DESKTOP);
  const mobileHero = mediaAssetUrl(publishedMedia, 'home.hero.mobile', HERO_HOME_VIDEO_MOBILE);
  const isVideo = (src: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src);

  return (
    <>
      {isVideo(desktopHero) ? (
        <link
          rel="preload"
          as="video"
          href={desktopHero}
          type="video/mp4"
          media="(min-width: 768px)"
        />
      ) : (
        <link
          rel="preload"
          as="image"
          imageSrcSet={nextImageSrcSet(desktopHero)}
          imageSizes="100vw"
          media="(min-width: 768px)"
          fetchPriority="high"
        />
      )}
      {isVideo(mobileHero) ? (
        <link
          rel="preload"
          as="video"
          href={mobileHero}
          type="video/mp4"
          media="(max-width: 767px)"
        />
      ) : (
        <link
          rel="preload"
          as="image"
          imageSrcSet={nextImageSrcSet(mobileHero)}
          imageSizes="100vw"
          media="(max-width: 767px)"
          fetchPriority="high"
        />
      )}
      <PageJsonLd path="/" lang={lang} name={title} description={description} />
      <Home />
    </>
  );
}
