'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useContent } from '../context/ContentContext';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { isBlogPostAvailableForLanguage } from '../lib/blog-language';
import { SEO_GUIDES, guideCopy, guidePath, guidePrimaryIntent } from '../data/seo-guides';
import { ArrowRight } from 'lucide-react';
import { WRAP } from '../components/premium/styles';
import { DecoSplat, PAINT, Tilt } from '../components/premium/Paint';
export const BlogList: React.FC = () => {
  const { content, site, lang, localizedCopy } = useContent();
  const posts = content.blog.filter(p => isBlogPostAvailableForLanguage(p, lang));
  const gridReveal = useScrollReveal();

  const jp = lang === 'jp';
  const [featured, ...rest] = posts;
  const postBits = (post: (typeof posts)[number]) => ({
    title: jp ? post.titleJp : post.titleEn,
    titleForAttr: jp ? stripJpSentinel(post.titleJp) : post.titleEn,
    excerpt: jp ? post.excerptJp : post.excerptEn,
    author: jp ? post.authorJp : post.authorEn,
    href: localizeHrefForLanguage(`/blog/${post.slug}`, lang),
  });
  const Meta = ({ post, author }: { post: (typeof posts)[number]; author: string }) => (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] tracking-[0.08em] text-artbar-taupe">
      <span className="font-heading font-semibold">{post.date}</span>
      <span className="h-px w-4 bg-current opacity-60" aria-hidden />
      <span><JpText>{author}</JpText></span>
      {post.tags.slice(0, 2).map((tag) => <span key={tag} className="text-artbar-gray">#{tag}</span>)}
    </p>
  );

  return (
    <div className="hp relative min-h-screen bg-artbar-bg pb-24 text-artbar-navy md:pb-32">
      {/* ── Masthead ───────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-44">
        <DecoSplat seed={44} color={PAINT.lightTaupe} className="-right-24 top-16 h-72 w-72 md:right-[8%] md:h-96 md:w-96" opacity={0.5} />
        <div className={`${WRAP} relative`}>
          <p className="hp-in flex items-center gap-4 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]"><span className="h-px w-10 bg-current" aria-hidden /><JpText>{site.nav.blog}</JpText></p>
          <h1 className={`hp-in mt-5 max-w-4xl ${jp ? 'text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[1.35] tracking-[0.04em]' : 'font-heading text-[clamp(2.8rem,10vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.02em]'}`} style={{ animationDelay: '100ms' }}>
            <JpText>{site.blogPage.title}</JpText>
          </h1>
          <p className="hp-in mt-6 max-w-2xl text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]" style={{ animationDelay: '200ms' }}><JpText>{site.blogPage.subtitle}</JpText></p>
        </div>
      </header>

      <div className={WRAP}>
        {/* ── Featured story ───────────────────────────────────────────── */}
        {featured && (() => {
          const b = postBits(featured);
          return (
            <article className="group grid items-center gap-8 border-t border-artbar-navy/15 pt-10 md:grid-cols-12 md:gap-12 md:pt-14">
              <Link href={b.href} className="md:col-span-7" tabIndex={-1} aria-hidden>
                <Tilt max={3}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-artbar-light-taupe/40">
                    <Image src={featured.image} alt="" fill priority className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]" sizes="(max-width: 768px) 100vw, 58vw" />
                    <div className="pointer-events-none absolute inset-3 border border-white/40 md:inset-4" aria-hidden />
                  </div>
                </Tilt>
              </Link>
              <div className="md:col-span-5">
                <Meta post={featured} author={b.author} />
                <h2 className={`mt-4 ${jp ? 'text-[clamp(1.4rem,5.5vw,2rem)] font-semibold leading-[1.55] tracking-[0.04em]' : 'font-heading text-[clamp(1.9rem,6vw,2.8rem)] font-semibold leading-[1.08]'}`}>
                  <Link href={b.href} className="transition-colors hover:text-artbar-blue"><JpText>{b.title}</JpText></Link>
                </h2>
                <p className="mt-5 line-clamp-4 text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{b.excerpt}</JpText></p>
                <Link href={b.href} className="group/l mt-6 inline-flex min-h-11 items-center gap-2 border-b border-artbar-navy/25 pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors hover:border-artbar-navy">
                  <JpText>{site.blogPage.readMore}</JpText>
                  <span className="sr-only">: {b.titleForAttr}</span>
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover/l:translate-x-1" aria-hidden />
                </Link>
              </div>
            </article>
          );
        })()}

        {/* ── Guides ───────────────────────────────────────────────────── */}
        <section className="mt-20 bg-white p-7 md:mt-28 md:p-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[12px] font-medium tracking-[0.16em] text-artbar-taupe"><JpText>{jp ? '東京アートガイド' : 'Tokyo Art Guides'}</JpText></p>
              <h2 className={`mt-3 ${jp ? 'text-2xl font-semibold tracking-[0.04em] md:text-[28px]' : 'font-heading text-3xl font-semibold md:text-4xl'}`}>
                <JpText>{jp ? '目的に合う体験を探す' : 'Start with the right experience'}</JpText>
              </h2>
            </div>
            <Link href={localizeHrefForLanguage('/guides', lang)} className="group inline-flex min-h-11 w-fit items-center gap-2 border-b border-artbar-navy/25 pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors hover:border-artbar-navy">
              <JpText>{jp ? 'すべてのガイド' : 'All guides'}</JpText>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid border-t border-artbar-navy/15 md:grid-cols-3">
            {SEO_GUIDES.slice(0, 3).map((guide, i) => {
              const g = guideCopy(guide, lang);
              return (
                <Link key={guide.slug} href={localizeHrefForLanguage(guidePath(guide.slug), lang)} className={`group block border-b border-artbar-navy/10 py-6 md:border-b-0 md:py-8 ${i ? 'md:border-l md:pl-8' : ''} ${i < 2 ? 'md:pr-8' : ''}`}>
                  <p className="text-[11px] font-medium tracking-[0.14em] text-artbar-taupe">{guidePrimaryIntent(guide, lang)}</p>
                  <h3 className={`mt-2 transition-colors group-hover:text-artbar-blue ${jp ? 'text-[17px] font-semibold leading-[1.6] tracking-[0.03em]' : 'font-heading text-xl font-semibold leading-snug'}`}><JpText>{g.title}</JpText></h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-[1.85] text-artbar-gray"><JpText>{g.description}</JpText></p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── All stories ──────────────────────────────────────────────── */}
        <div ref={gridReveal.ref} className={`mt-20 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 md:mt-28 reveal-stagger ${gridReveal.isVisible ? 'visible' : ''}`}>
          {rest.map((post) => {
            const b = postBits(post);
            return (
              <article key={post.id} className="group flex flex-col">
                <Link href={b.href} tabIndex={-1} aria-hidden className="block">
                  <div className="hp-wipe relative aspect-[4/3] overflow-hidden bg-artbar-light-taupe/40">
                    <Image src={post.image} alt="" fill className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="pointer-events-none absolute inset-2.5 border border-white/0 transition-colors duration-500 group-hover:border-white/60 md:inset-3" aria-hidden />
                  </div>
                </Link>
                <div className="mt-5"><Meta post={post} author={b.author} /></div>
                <h2 className={`mt-3 ${jp ? 'text-[17px] font-semibold leading-[1.65] tracking-[0.03em] md:text-lg' : 'font-heading text-xl font-semibold leading-snug md:text-2xl'}`}>
                  <Link href={b.href} className="transition-colors hover:text-artbar-blue"><JpText>{b.title}</JpText></Link>
                </h2>
                <p className="mt-3 line-clamp-3 text-[14px] leading-[1.9] text-artbar-gray md:text-[15px]"><JpText>{b.excerpt}</JpText></p>
                <Link href={b.href} className="group/l mt-auto inline-flex min-h-11 w-fit items-center gap-2 pt-4 text-sm font-semibold tracking-[0.04em] text-artbar-navy">
                  <span className="border-b border-artbar-navy/25 pb-0.5 transition-colors group-hover/l:border-artbar-navy"><JpText>{site.blogPage.readMore}</JpText></span>
                  <span className="sr-only">: {b.titleForAttr}</span>
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover/l:translate-x-1" aria-hidden />
                </Link>
              </article>
            );
          })}
        </div>

        {posts.length === 0 && (
          <p className="py-20 text-center text-xl font-semibold text-artbar-navy/60"><JpText>{localizedCopy.ui.blogList.comingSoon}</JpText></p>
        )}
      </div>
    </div>
  );
};
