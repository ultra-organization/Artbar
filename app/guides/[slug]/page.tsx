import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { JpText } from '@/components/JpText';
import { segmentJpDeep } from '@/lib/jp-segment';
import { PageHero, PrimaryAction, TextLink, Hairline } from '@/components/premium/Kit';
import { WRAP, h2Class } from '@/components/premium/styles';
import { DecoSplat, Splat } from '@/components/premium/Paint';
import { ARTBAR_BOOKING_URL } from '@/constants';
import { PageJsonLd } from '@/components/PageJsonLd';
import {
  SEO_GUIDE_SLUGS,
  getGuideBySlug,
  guideCopy,
  guidePath,
  guidePrimaryIntent,
} from '@/data/seo-guides';
import { buildOpenGraph, buildLocalizedAlternates, getRequestLang } from '@/lib/request-lang';
import { localizeHrefForLanguage, publicUrlForPath, siteLanguageToRouteLocale } from '@/lib/locale-routing';
import { buildServiceJsonLd, safeJsonLd, ORGANIZATION_ID, absoluteUrl } from '@/lib/jsonld';
import { nextImageSrcSet } from '@/lib/image-preload';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SEO_GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: 'Guide | Artbar Tokyo' };

  const lang = await getRequestLang();
  const copy = guideCopy(guide, lang);

  return {
    title: copy.title,
    description: copy.description,
    alternates: buildLocalizedAlternates(guidePath(guide.slug), lang),
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [encodeURI(guide.image)],
    },
    openGraph: buildOpenGraph({
      lang,
      title: copy.title,
      description: copy.description,
      type: 'article',
      images: [{ url: guide.image }],
    }),
  };
}

export default async function GuideDetailPage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const lang = await getRequestLang();
  const routeLocale = siteLanguageToRouteLocale(lang);
  const schemaLang = routeLocale === 'ja' ? 'ja' : 'en';
  const copy = guideCopy(guide, lang);
  const primaryIntent = guidePrimaryIntent(guide, lang);
  const path = guidePath(guide.slug);
  const url = publicUrlForPath(path, routeLocale);
  const guidesUrl = publicUrlForPath('/guides', routeLocale);

  const guideJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${url}#article`,
        headline: copy.title,
        description: copy.description,
        image: absoluteUrl(guide.image),
        author: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
        mainEntityOfPage: url,
        inLanguage: schemaLang,
        keywords: primaryIntent,
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: copy.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
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
            name: lang === 'jp' ? 'ガイド' : 'Guides',
            item: guidesUrl,
          },
          { '@type': 'ListItem', position: 3, name: copy.title, item: url },
        ],
      },
      buildServiceJsonLd({
        url,
        name: copy.title,
        description: copy.description,
        serviceType: primaryIntent,
      }),
    ],
  };

  const jp = lang === 'jp';
  const h2 = h2Class(lang);
  const view = jp ? segmentJpDeep(copy) : copy;
  const bestFor = view.bestFor.filter((x) => x.trim());

  return (
    <main className="hp relative min-h-screen bg-artbar-bg pb-24 text-artbar-navy md:pb-32">
      <PageJsonLd path={path} lang={lang} name={copy.title} description={copy.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(guideJsonLd) }} />
      <link
        rel="preload"
        as="image"
        imageSrcSet={nextImageSrcSet(guide.image)}
        imageSizes="100vw"
        fetchPriority="high"
      />

      <PageHero
        lang={lang}
        image={guide.image}
        alt={copy.title}
        eyebrow={<JpText>{view.eyebrow}</JpText>}
        title={<JpText>{view.title}</JpText>}
        subtitle={<JpText>{view.intro}</JpText>}
        actions={
          <>
            <PrimaryAction href={ARTBAR_BOOKING_URL}><JpText>{view.cta}</JpText></PrimaryAction>
            <TextLink tone="light" href={localizeHrefForLanguage('/guides', lang)}>{jp ? 'ガイド一覧' : 'All guides'}</TextLink>
          </>
        }
      />

      <div className={`${WRAP} grid gap-16 pt-16 md:pt-24 lg:grid-cols-12 lg:gap-12`}>
        <article className="min-w-0 lg:col-span-7">
          {bestFor.length > 0 && (
            <section>
              <p className="flex items-center gap-4 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
                <span className="h-px w-10 bg-current" aria-hidden />{jp ? 'こんな方におすすめ' : 'Best for'}
              </p>
              <ul className="mt-6 grid border-t border-artbar-navy/15 sm:grid-cols-2 sm:gap-x-10">
                {bestFor.map((item, i) => (
                  <li key={item} className="flex items-start gap-4 border-b border-artbar-navy/10 py-4 text-[15px] font-semibold leading-[1.7] md:text-base">
                    <Splat seed={510 + i * 13} color={i % 2 ? '#D1C7B8' : '#A39384'} className="mt-1 h-4 w-4 shrink-0" />
                    <span><JpText>{item}</JpText></span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-16 space-y-14 md:mt-20 md:space-y-16">
            {view.sections.map((section) => (
              <section key={section.title}>
                <h2 className={h2}><JpText>{section.title}</JpText></h2>
                <p className="mt-5 max-w-[68ch] text-[15px] leading-[2] text-artbar-gray md:text-[17px]"><JpText>{section.body}</JpText></p>
              </section>
            ))}
          </div>

          {view.faqs.length > 0 && (
            <section className="mt-20 md:mt-24">
              <h2 className={h2}>{jp ? 'よくある質問' : 'Common questions'}</h2>
              <dl className="mt-8 border-t border-artbar-navy/15">
                {view.faqs.map((faq) => (
                  <div key={faq.question} className="grid gap-3 border-b border-artbar-navy/10 py-7 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-10">
                    <dt className={`${jp ? 'text-[16px] font-semibold leading-[1.7] tracking-[0.03em]' : 'font-heading text-lg font-semibold leading-snug'}`}><JpText>{faq.question}</JpText></dt>
                    <dd className="text-[14px] leading-[1.95] text-artbar-gray md:text-[15px]"><JpText>{faq.answer}</JpText></dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </article>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="space-y-8 lg:sticky lg:top-28">
            <div className="relative overflow-hidden bg-artbar-navy px-7 py-9 text-white md:px-9 md:py-11">
              <Hairline tone="light" className="inset-2.5 md:inset-3" />
              <DecoSplat seed={93} color="#3E6686" className="-right-16 -top-16 h-48 w-48" opacity={0.55} />
              <div className="relative">
                <h2 className={`${jp ? 'text-xl font-semibold tracking-[0.04em]' : 'font-heading text-2xl font-semibold'}`}>{jp ? '次のステップ' : 'Next step'}</h2>
                <p className="mt-4 text-[14px] leading-[1.9] text-white/75 md:text-[15px]">
                  {jp
                    ? 'スケジュールから空き状況を確認して、参加したいセッションを選べます。'
                    : 'Check the schedule and choose the session that fits your plan.'}
                </p>
                <div className="mt-7"><PrimaryAction href={ARTBAR_BOOKING_URL} className="w-full"><JpText>{view.cta}</JpText></PrimaryAction></div>
              </div>
            </div>

            {guide.relatedLinks.length > 0 && (
              <nav aria-label={jp ? '関連ページ' : 'Related pages'}>
                <p className="flex items-center gap-4 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
                  <span className="h-px w-10 bg-current" aria-hidden />{jp ? '関連ページ' : 'Related pages'}
                </p>
                <ul className="mt-4 border-t border-artbar-navy/15">
                  {guide.relatedLinks.map((link) => (
                    <li key={link.href} className="border-b border-artbar-navy/10">
                      <Link
                        href={localizeHrefForLanguage(link.href, lang)}
                        className="group flex min-h-[52px] items-center justify-between gap-4 py-3 text-[15px] font-semibold transition-colors hover:text-artbar-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-artbar-navy"
                      >
                        {jp ? link.labelJp : link.labelEn}
                        <ArrowRight size={15} className="shrink-0 text-artbar-taupe transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
