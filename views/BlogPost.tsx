'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useContent } from '../context/ContentContext';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { HERO_BLUR_DATA_URL } from '../constants';
import { WRAP } from '../components/premium/styles';
import { DecoSplat, PAINT } from '../components/premium/Paint';
import { localizeHrefForLanguage, publicUrlForPath, siteLanguageToRouteLocale } from '../lib/locale-routing';
import { ArrowLeft, ArrowRight, Facebook, Twitter, Linkedin } from 'lucide-react';
import type { BlogPost as BlogPostData } from '../types';
export const BlogPost: React.FC = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { content, lang, site, localizedCopy } = useContent();
  const blogPostCopy = localizedCopy.ui.blogPost;
  const [fetchedPost, setFetchedPost] = useState<BlogPostData | null>(null);
  const proseReveal = useScrollReveal();
  const moreReveal = useScrollReveal();

  const blogHref = localizeHrefForLanguage('/blog', lang);

  const contentPost = content.blog.find(p => p.slug === slug);
  const post = fetchedPost?.slug === slug && contentPost
    ? { ...contentPost, ...fetchedPost }
    : contentPost;
  const bodyContent = post ? (lang === 'en' ? post.contentEn : post.contentJp) : '';
  const needsBodyFetch = Boolean(post && !bodyContent);

  useEffect(() => {
    if (!needsBodyFetch) return;

    const controller = new AbortController();

    const loadPost = async () => {
      try {
        const response = await fetch(`/api/blog-post/${encodeURIComponent(slug)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) return;

        const data = (await response.json()) as { post?: BlogPostData };
        if (data.post?.slug === slug) {
          setFetchedPost(data.post);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('[blog-post] failed to load article body', error);
        }
      }
    };

    void loadPost();

    return () => controller.abort();
  }, [needsBodyFetch, slug]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-artbar-bg">
        <h1 className="text-4xl font-heading font-heavy text-artbar-navy mb-4"><JpText>{blogPostCopy.articleNotFoundTitle}</JpText></h1>
        <Link href={blogHref} className="text-artbar-taupe hover:underline"><JpText>{blogPostCopy.articleNotFoundCta}</JpText></Link>
      </div>
    );
  }

  const title = lang === 'en' ? post.titleEn : post.titleJp;
  const titleForAttr = lang === 'en' ? post.titleEn : stripJpSentinel(post.titleJp);
  const author = lang === 'en' ? post.authorEn : post.authorJp;
  const shareUrl = publicUrlForPath(`/blog/${slug}`, siteLanguageToRouteLocale(lang));
  const shareTitle = encodeURIComponent(titleForAttr);
  const shareLabel = blogPostCopy.shareLabel;

  const jp = lang === 'jp';
  const shareClass = 'flex h-11 w-11 items-center justify-center rounded-full border border-artbar-navy/20 text-artbar-navy transition-colors duration-300 hover:border-artbar-taupe hover:bg-artbar-taupe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-artbar-navy';

  return (
    <div className="hp relative min-h-screen bg-artbar-bg pb-24 text-artbar-navy md:pb-32">
      {/* ── Article header ─────────────────────────────────────────────── */}
      <header className="relative overflow-hidden pb-10 pt-28 md:pb-14 md:pt-40">
        <DecoSplat seed={post.id.length * 37} color={PAINT.lightTaupe} className="-right-24 top-10 h-64 w-64 md:right-[6%] md:h-80 md:w-80" opacity={0.45} />
        <div className="relative mx-auto w-full max-w-[920px] px-7 sm:px-8 md:px-12">
          <Link href={blogHref} className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold tracking-[0.04em] text-artbar-navy/80 transition-colors hover:text-artbar-navy">
            <ArrowLeft size={15} className="transition-transform duration-300 group-hover:-translate-x-1" aria-hidden /> <JpText>{site.blogPage.back}</JpText>
          </Link>
          {post.tags.length > 0 && (
            <p className="hp-in mt-8 flex flex-wrap gap-x-4 gap-y-1 text-[12px] tracking-[0.1em] text-artbar-taupe">
              {post.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </p>
          )}
          <h1 className={`hp-in mt-4 ${jp ? 'text-[clamp(1.6rem,6.4vw,2.8rem)] font-semibold leading-[1.5] tracking-[0.04em]' : 'font-heading text-[clamp(2.2rem,8vw,4rem)] font-semibold leading-[1.04] tracking-[-0.015em]'}`} style={{ animationDelay: '100ms' }}>
            <JpText>{title}</JpText>
          </h1>
          <p className="hp-in mt-7 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-artbar-navy/15 pt-5 text-sm text-artbar-gray" style={{ animationDelay: '200ms' }}>
            <span className="font-semibold text-artbar-navy"><JpText>{author}</JpText></span>
            <span className="h-px w-5 bg-artbar-taupe" aria-hidden />
            <span className="font-heading tracking-[0.06em]">{post.date}</span>
          </p>
        </div>
      </header>

      <div className={WRAP}>
        <div className="relative aspect-[16/10] overflow-hidden bg-artbar-light-taupe/40 md:aspect-[16/8]">
          <Image key={post.image} src={post.image} alt={titleForAttr} fill priority placeholder="blur" blurDataURL={HERO_BLUR_DATA_URL} className="hp-kb object-cover" sizes="100vw" />
          <div className="pointer-events-none absolute inset-3 border border-white/40 md:inset-5" aria-hidden />
        </div>
      </div>

      <article className="mx-auto w-full max-w-[760px] px-7 pt-14 sm:px-8 md:px-12 md:pt-20">
        <div
          ref={proseReveal.ref}
          className={`reveal artbar-prose max-w-none ${proseReveal.isVisible ? 'visible' : ''}`}
          dangerouslySetInnerHTML={{ __html: bodyContent }}
        />
        {needsBodyFetch && (
          <div className="space-y-4" aria-hidden="true">
            <div className="h-4 w-3/4 bg-artbar-light-taupe/40" />
            <div className="h-4 w-full bg-artbar-light-taupe/40" />
            <div className="h-4 w-5/6 bg-artbar-light-taupe/40" />
          </div>
        )}

        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-y border-artbar-navy/15 py-6">
          <p className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe"><JpText>{shareLabel}</JpText></p>
          <div className="flex gap-3">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className={shareClass} aria-label={stripJpSentinel(blogPostCopy.facebookShareLabel)}><Facebook size={17} strokeWidth={1.8} /></a>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareTitle}`} target="_blank" rel="noreferrer" className={shareClass} aria-label={stripJpSentinel(blogPostCopy.xShareLabel)}><Twitter size={17} strokeWidth={1.8} /></a>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" className={shareClass} aria-label={stripJpSentinel(blogPostCopy.linkedinShareLabel)}><Linkedin size={17} strokeWidth={1.8} /></a>
          </div>
        </div>
      </article>

      <section className="mx-auto mt-20 w-full max-w-[1080px] px-7 sm:px-8 md:mt-28 md:px-12">
        <h2 className={`${jp ? 'text-xl font-semibold tracking-[0.04em] md:text-2xl' : 'font-heading text-2xl font-semibold md:text-3xl'}`}>
          <JpText>{blogPostCopy.moreFromJournal}</JpText>
        </h2>
        <div ref={moreReveal.ref} className={`mt-8 grid gap-10 md:grid-cols-2 reveal-stagger ${moreReveal.isVisible ? 'visible' : ''}`}>
          {content.blog
            .filter((p) => p.id !== post.id)
            .slice(0, 2)
            .map((p) => (
              <Link key={p.id} href={localizeHrefForLanguage(`/blog/${p.slug}`, lang)} className="group grid grid-cols-[7rem_1fr] items-center gap-5 border-t border-artbar-navy/15 pt-6 sm:grid-cols-[9rem_1fr]">
                <div className="relative aspect-square overflow-hidden bg-artbar-light-taupe/40">
                  <Image src={p.image} alt={jp ? stripJpSentinel(p.titleJp) : p.titleEn} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="144px" />
                </div>
                <div>
                  <h3 className={`line-clamp-3 transition-colors group-hover:text-artbar-blue ${jp ? 'text-[15px] font-semibold leading-[1.7]' : 'font-heading text-lg font-semibold leading-snug'}`}>
                    <JpText>{jp ? p.titleJp : p.titleEn}</JpText>
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold tracking-[0.04em] text-artbar-taupe">
                    <JpText>{blogPostCopy.readStory}</JpText>
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
};
