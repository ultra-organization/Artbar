import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { JpText } from '@/components/JpText';
import { segmentJpDeep } from '@/lib/jp-segment';
import { WRAP } from '@/components/premium/styles';
import { DecoSplat, Tilt } from '@/components/premium/Paint';
import { PageJsonLd } from '@/components/PageJsonLd';
import { SEO_GUIDES, guideCopy, guidePath, guidePrimaryIntent } from '@/data/seo-guides';
import { buildOpenGraph, buildLocalizedAlternates, getRequestLang } from '@/lib/request-lang';
import { localizeHrefForLanguage, publicUrlForPath, siteLanguageToRouteLocale } from '@/lib/locale-routing';
import { safeJsonLd } from '@/lib/jsonld';

function guideIndexCopy(lang: 'en' | 'jp') {
  return lang === 'jp'
    ? {
        title: 'Artbar Tokyo ガイド',
        description: '東京の雨の日デート、アート体験、絵画体験、ワークショップ、貸切イベントを探すためのArtbar Tokyoガイド集です。',
        eyebrow: 'Journal Guides',
        intro: '日本語でよく探される目的別にArtbar Tokyoの体験を見つけられるガイドです。雨の日デート、アート体験、ワークショップなど、検索から予約まで自然に進めます。',
        read: 'ガイドを見る',
      }
    : {
        title: 'Artbar Tokyo Guides',
        description: 'Guides to paint and sip, art and wine, beginner art classes, private events, and creative Tokyo experiences.',
        eyebrow: 'Journal Guides',
        intro: 'Use these guides to choose the right Artbar Tokyo experience by intent, occasion, location, and theme.',
        read: 'Read guide',
      };
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getRequestLang();
  const copy = guideIndexCopy(lang);

  return {
    title: copy.title,
    description: copy.description,
    alternates: buildLocalizedAlternates('/guides', lang),
    openGraph: buildOpenGraph({ lang, title: copy.title, description: copy.description }),
  };
}

export default async function GuidesPage() {
  const lang = await getRequestLang();
  const routeLocale = siteLanguageToRouteLocale(lang);
  const copy = guideIndexCopy(lang);
  const url = publicUrlForPath('/guides', routeLocale);
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    name: copy.title,
    description: copy.description,
    url,
    inLanguage: routeLocale === 'ja' ? 'ja' : 'en',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SEO_GUIDES.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: guideCopy(guide, lang).title,
        url: publicUrlForPath(guidePath(guide.slug), routeLocale),
      })),
    },
  };

  const jp = lang === 'jp';
  const [featured, ...rest] = SEO_GUIDES;
  const seg = <T,>(v: T): T => (jp ? segmentJpDeep(v) : v);
  const fCopy = seg(guideCopy(featured, lang));

  return (
    <main className="hp relative min-h-screen bg-artbar-bg pb-24 text-artbar-navy md:pb-32">
      <PageJsonLd path="/guides" lang={lang} name={copy.title} description={copy.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(itemListJsonLd) }} />

      {/* Masthead */}
      <header className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-44">
        <DecoSplat seed={71} color="#D1C7B8" className="-right-24 top-16 h-72 w-72 md:right-[8%] md:h-96 md:w-96" opacity={0.5} />
        <div className={`${WRAP} relative`}>
          <p className="hp-in flex items-center gap-4 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
            <span className="h-px w-10 bg-current" aria-hidden />{jp ? 'ガイド' : 'Guides'}
          </p>
          <h1 className={`hp-in mt-5 max-w-4xl ${jp ? 'text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[1.35] tracking-[0.04em]' : 'font-heading text-[clamp(2.8rem,10vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.02em]'}`} style={{ animationDelay: '100ms' }}>
            <JpText>{seg(copy.title)}</JpText>
          </h1>
          <p className="hp-in mt-6 max-w-2xl text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]" style={{ animationDelay: '200ms' }}><JpText>{seg(copy.intro)}</JpText></p>
        </div>
      </header>

      <div className={WRAP}>
        {/* Featured guide */}
        <article className="group grid items-center gap-8 border-t border-artbar-navy/15 pt-10 md:grid-cols-12 md:gap-12 md:pt-14">
          <Link href={localizeHrefForLanguage(guidePath(featured.slug), lang)} className="md:col-span-7" tabIndex={-1} aria-hidden>
            <Tilt max={3}>
              <div className="relative aspect-[4/3] overflow-hidden bg-artbar-light-taupe/40">
                <Image src={featured.image} alt="" fill priority className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 58vw" />
                <div className="pointer-events-none absolute inset-3 border border-white/40 md:inset-4" aria-hidden />
              </div>
            </Tilt>
          </Link>
          <div className="md:col-span-5">
            <p className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe">{guidePrimaryIntent(featured, lang)}</p>
            <h2 className={`mt-4 ${jp ? 'text-[clamp(1.4rem,5.5vw,2rem)] font-semibold leading-[1.55] tracking-[0.04em]' : 'font-heading text-[clamp(1.9rem,6vw,2.8rem)] font-semibold leading-[1.08]'}`}>
              <Link href={localizeHrefForLanguage(guidePath(featured.slug), lang)} className="transition-colors hover:text-artbar-blue"><JpText>{fCopy.title}</JpText></Link>
            </h2>
            <p className="mt-5 line-clamp-4 text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{fCopy.description}</JpText></p>
            <Link href={localizeHrefForLanguage(guidePath(featured.slug), lang)} className="group/l mt-6 inline-flex min-h-11 items-center gap-2 border-b border-artbar-navy/25 pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors hover:border-artbar-navy">
              {copy.read}<span className="sr-only">: {guideCopy(featured, lang).title}</span>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover/l:translate-x-1" aria-hidden />
            </Link>
          </div>
        </article>

        {/* Index of the remaining guides: a register of rows, not another card grid. */}
        <ol className="mt-20 border-t border-artbar-navy/15 md:mt-28 lg:grid lg:grid-cols-2 lg:gap-x-14">
          {rest.map((guide) => {
            const g = seg(guideCopy(guide, lang));
            const href = localizeHrefForLanguage(guidePath(guide.slug), lang);
            return (
              <li key={guide.slug} className="border-b border-artbar-navy/10">
                <Link href={href} className="group grid grid-cols-[88px_1fr] items-start gap-5 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy sm:grid-cols-[132px_1fr] sm:gap-7 md:py-9">
                  <div className="relative aspect-square overflow-hidden bg-artbar-light-taupe/40">
                    <Image src={guide.image} alt="" fill className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.08]" sizes="(max-width: 640px) 88px, 132px" />
                    <div className="pointer-events-none absolute inset-1.5 border border-white/0 transition-colors duration-500 group-hover:border-white/60" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium tracking-[0.14em] text-artbar-taupe md:text-[12px]">{guidePrimaryIntent(guide, lang)}</p>
                    <h2 className={`mt-2 transition-colors group-hover:text-artbar-blue ${jp ? 'text-[16px] font-semibold leading-[1.65] tracking-[0.03em] md:text-lg' : 'font-heading text-lg font-semibold leading-snug md:text-[22px]'}`}><JpText>{g.title}</JpText></h2>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-[1.85] text-artbar-gray md:text-sm"><JpText>{g.description}</JpText></p>
                    <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.04em] text-artbar-navy">
                      <span className="border-b border-artbar-navy/25 pb-0.5 transition-colors group-hover:border-artbar-navy">{copy.read}</span>
                      <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
