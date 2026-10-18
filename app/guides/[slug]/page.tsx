import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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

  return (
    <main className="grain min-h-screen bg-artbar-bg pb-20">
      <PageJsonLd path={path} lang={lang} name={copy.title} description={copy.description} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(guideJsonLd) }} />
      <link
        rel="preload"
        as="image"
        imageSrcSet={nextImageSrcSet(guide.image)}
        imageSizes="100vw"
        fetchPriority="high"
      />

      <section className="relative min-h-[70vh] overflow-hidden bg-artbar-navy pt-32 text-white">
        <Image
          src={guide.image}
          alt={copy.title}
          fill
          priority
          className="object-cover opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-artbar-navy/70 via-artbar-navy/45 to-artbar-bg" />
        <div className="relative z-10 mx-auto flex min-h-[58vh] max-w-[1120px] flex-col justify-end px-6 pb-16 md:px-10">
          <Link
            href={localizeHrefForLanguage('/guides', lang)}
            className="mb-8 inline-flex w-fit min-h-[44px] items-center rounded-full bg-white/15 px-4 py-2 font-heading text-sm font-bold uppercase tracking-wider text-white backdrop-blur transition hover:bg-white/25"
          >
            {lang === 'jp' ? 'ガイド一覧' : 'All guides'}
          </Link>
          <p className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-artbar-taupe">
            {copy.eyebrow}
          </p>
          <h1 className="max-w-4xl font-heading text-4xl font-heavy leading-tight md:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90 md:text-xl">{copy.intro}</p>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-[1120px] gap-8 px-6 md:px-10 lg:grid-cols-[1fr_330px]">
        <article className="relative z-10 rounded-lg bg-white p-7 shadow-xl md:p-10">
          <div className="mb-10">
            <h2 className="mb-4 font-heading text-2xl font-bold text-artbar-navy">
              {lang === 'jp' ? 'こんな方におすすめ' : 'Best for'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {copy.bestFor.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg bg-artbar-bg p-4 text-artbar-navy">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-artbar-taupe" />
                  <span className="font-heading font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            {copy.sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 font-heading text-3xl font-bold leading-tight text-artbar-navy">
                  {section.title}
                </h2>
                <p className="text-lg leading-relaxed text-artbar-gray">{section.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-12 border-t border-gray-100 pt-10">
            <h2 className="mb-6 font-heading text-3xl font-bold text-artbar-navy">
              {lang === 'jp' ? 'よくある質問' : 'Common questions'}
            </h2>
            <div className="space-y-5">
              {copy.faqs.map((faq) => (
                <div key={faq.question} className="rounded-lg border border-black/5 bg-artbar-bg p-5">
                  <h3 className="mb-2 font-heading text-lg font-bold text-artbar-navy">{faq.question}</h3>
                  <p className="leading-relaxed text-artbar-gray">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </article>

        <aside className="relative z-10 space-y-6 lg:pt-0">
          <div className="rounded-lg bg-artbar-navy p-6 text-white shadow-xl">
            <h2 className="mb-3 font-heading text-2xl font-bold">{lang === 'jp' ? '次のステップ' : 'Next step'}</h2>
            <p className="mb-5 text-white/80">
              {lang === 'jp'
                ? 'スケジュールから空き状況を確認して、参加したいセッションを選べます。'
                : 'Check the schedule and choose the session that fits your plan.'}
            </p>
            <a
              href={ARTBAR_BOOKING_URL}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-artbar-taupe px-6 pt-3 pb-2 font-heading font-bold text-artbar-navy transition hover:scale-[1.02]"
            >
              {copy.cta} <ArrowRight size={16} />
            </a>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-heading text-xl font-bold text-artbar-navy">
              {lang === 'jp' ? '関連ページ' : 'Related pages'}
            </h2>
            <div className="space-y-2">
              {guide.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={localizeHrefForLanguage(link.href, lang)}
                  className="flex min-h-[44px] items-center justify-between rounded-lg px-3 py-2 font-heading font-bold text-artbar-navy transition hover:bg-artbar-bg hover:text-artbar-taupe"
                >
                  {lang === 'jp' ? link.labelJp : link.labelEn}
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
