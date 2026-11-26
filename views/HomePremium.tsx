'use client';

/**
 * Home page, premium pass ("The Original", Nov 2026).
 *
 * Same section order, copy, embeds and tracked booking / inquiry / gift
 * actions as `views/Home.tsx`. Only Artbar's own palette (navy, taupe, light
 * taupe, off-white), Josefin Sans and the existing photos and footage. The
 * visual idea is the mounted print: hairline mounts, square photo corners,
 * tracked Josefin eyebrows on a taupe rule, generous whitespace, and a turning
 * ten-year seal that says "first and best" with facts instead of decoration.
 */

import React, { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { cleanDisplayText } from '../lib/jp-display';
import { useContent } from '../context/ContentContext';
import {
  ARTBAR_BOOKING_URL,
  GROUP_EVENT_IMAGE,
  PRIVATE_PARTY_INQUIRY_URL,
  TEAM_BUILDING_INQUIRY_URL,
  SITE_IMAGES,
  CONCEPT_BLOCK_YOUTUBE_URL,
  PARTNER_LOGOS,
  PAINTA_EMBED_ORIGIN,
  getArtbarBookingThemeUrl,
} from '../constants';
import { mediaAssetUrl } from '../lib/media/resolve';
import { themeSlugFromItem } from '../lib/theme-slugs';
import { trackBookingClick, trackGiftCertificateClick, trackInquiryClick, type BookingClickLocation } from '../lib/analytics';
import { withBrowserAcquisition } from '../lib/painta-acquisition';
import { PartnerLogo } from '../components/PartnerLogo';
import { formatGuestCountCompactK, formatGuestCountDisplay, formatGuestConceptLabel } from '../lib/guest-count';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useMediaMinMd } from '../hooks/useMediaMinMd';
import { useNearViewport } from '../hooks/useNearViewport';
import { GI } from '../data/generated-image-paths';
import { PrefetchHeroes } from '../components/PrefetchHeroes';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { HolidayLights } from '../components/HolidayDecor';
import { useHolidayTheme } from '../lib/holiday-season';
import { GIFT_CERTIFICATES_URL, HOLIDAY_GIFT_BLOG_PATH, HOLIDAY_GIFT_COPY } from '../data/holiday-theme';
import { YEAR_END_HOME_COPY } from '../data/year-end-parties';
import { useYearEndSeason } from '../lib/year-end-season';

const HOW_IT_WORKS_IMAGES = [
  GI.featureAllInclusive,
  '/media/experience/step-cheers.jpg',
  '/media/experience/step-create.jpg',
  '/media/experience/step-finished.jpg',
];

const PARTNER_LOGO_SCALE_BOOSTS: Partial<Record<(typeof PARTNER_LOGOS)[number]['name'], number>> = {
  GE: 1.2,
  Toyota: 1.15,
  Apple: 1.2,
};

const CONCEPT_SOCIAL_AVATAR_URLS = [
  '/media/testimonials/avatar-20260517-1.jpg',
  '/media/testimonials/avatar-20260517-2.jpg',
  '/media/testimonials/avatar-20260517-3.jpg',
  '/media/testimonials/avatar-20260517-4.jpg',
  '/media/testimonials/avatar-20260517-5.jpg',
  '/media/testimonials/avatar-20260517-6.jpg',
] as const;

const YEAR_END_SECTION_ID = 'year-end-parties';
const withYear = (text: string, year: number | null) =>
  year === null ? text.replace(/\s*\{year\}年?(<wbr>)?/, '').trim() : text.replace('{year}', String(year));

/* ───────────────────────────── Shared pieces ───────────────────────────── */

const WRAP = 'mx-auto w-full max-w-[1320px] px-6 md:px-12';

function Stars({ className = '', size = 'h-3.5 w-3.5' }: { className?: string; size?: string }) {
  return (
    <span className={`inline-flex gap-[3px] text-artbar-taupe ${className}`} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`${size} fill-current`}>
          <path d="M10 1.5l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L10 14.8l-5.4 2.9 1.2-5.9L1.4 7.7l6-.7z" />
        </svg>
      ))}
    </span>
  );
}

/** Rotating anniversary seal: tracked Josefin caps around a "10". */
function Seal({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`aspect-square ${tone === 'light' ? 'text-white' : 'text-artbar-navy'} ${className}`} role="img" aria-label="Artbar Tokyo, est. 2016, tenth anniversary">
      <div className="relative h-full w-full">
        <svg viewBox="0 0 200 200" className="hp-spin absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <path id={id} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
          </defs>
          <text fill="currentColor" fontSize="11.5" fontFamily="var(--font-josefin)" fontWeight="600">
            <textPath href={`#${id}`} textLength="496" lengthAdjust="spacing">
              ARTBAR TOKYO · EST. 2016 · TENTH ANNIVERSARY ·
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full border border-current/40" aria-hidden>
          <span className="font-heading text-[2.6em] font-semibold leading-none tracking-tight">10</span>
          <span className="mt-1 font-heading text-[0.55em] font-semibold uppercase tracking-[0.35em] opacity-80">Years</span>
        </div>
      </div>
    </div>
  );
}

/** Eyebrow on a short taupe rule. Latin labels set in tracked Josefin caps. */
function Eyebrow({ children, tone = 'dark', latin = false, className = '' }: { children: React.ReactNode; tone?: 'dark' | 'light'; latin?: boolean; className?: string }) {
  return (
    <p className={`flex items-center gap-4 ${tone === 'light' ? 'text-artbar-light-taupe' : 'text-artbar-taupe'} ${latin ? 'font-heading text-[11px] font-semibold uppercase tracking-[0.32em] md:text-xs' : 'text-[12px] font-medium tracking-[0.16em] md:text-[13px]'} ${className}`}>
      <span className="h-px w-10 shrink-0 bg-current opacity-80" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function useH2(lang: 'en' | 'jp') {
  return lang === 'jp'
    ? 'font-semibold text-[clamp(1.6rem,6.4vw,2.1rem)] leading-[1.45] tracking-[0.04em] md:text-[clamp(2.1rem,3vw,2.75rem)]'
    : 'font-heading font-semibold text-[clamp(2rem,7.5vw,2.6rem)] leading-[1.06] tracking-[-0.015em] md:text-[clamp(2.6rem,3.8vw,3.6rem)]';
}

/** Underlined text link used for every secondary action. */
function TextLink({ children, tone = 'dark', className = '', ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { tone?: 'dark' | 'light' }) {
  const toneClass = tone === 'light'
    ? 'border-white/40 text-white/90 hover:border-white hover:text-white focus-visible:outline-white'
    : 'border-artbar-navy/25 text-artbar-navy hover:border-artbar-navy focus-visible:outline-artbar-navy';
  return (
    <a {...rest} className={`group inline-flex min-h-11 items-center gap-2 border-b pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[15px] ${toneClass} ${className}`}>
      {children}
      <ArrowRight size={15} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
    </a>
  );
}

const PILL_BASE = 'group inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-9 text-[15px] font-bold tracking-[0.04em] transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 md:min-h-[3.75rem] md:text-base';
const PILL_TAUPE = `${PILL_BASE} bg-artbar-taupe text-artbar-navy shadow-[0_18px_40px_-18px_rgba(163,147,132,0.9)] hover:bg-artbar-light-taupe focus-visible:outline-artbar-taupe`;
const PILL_NAVY = `${PILL_BASE} bg-artbar-navy text-white hover:bg-artbar-blue focus-visible:outline-artbar-navy`;
const PILL_GHOST_LIGHT = `${PILL_BASE} border border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white`;

/* ───────────────────────────── Page ───────────────────────────── */

export const HomePremium: React.FC = () => {
  const { content, site, lang, localizedCopy, media } = useContent();
  const router = useRouter();
  const jp = lang === 'jp';
  const h2 = useH2(lang);
  const [hasMounted, setHasMounted] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const holiday = useHolidayTheme();
  const yearEnd = useYearEndSeason();
  useEffect(() => setHasMounted(true), []);

  const priorityThemes = ['paint-pouring', 'paint-your-pet', 'texture-painting'];
  const orderedThemes = [...site.home.themes.items].sort((a, b) => {
    const rank = (item: typeof a) => { const i = priorityThemes.indexOf(themeSlugFromItem(item)); return i < 0 ? priorityThemes.length : i; };
    return rank(a) - rank(b);
  });

  const guestCountFormatted = formatGuestCountDisplay(lang);
  const guestConceptLabel = formatGuestConceptLabel(site.home.concept.guestsLabel, lang, guestCountFormatted);

  const mdUp = useMediaMinMd();
  const conceptVideoLazy = useNearViewport<HTMLDivElement>({ rootMargin: '520px' });

  const firstVisitReveal = useScrollReveal();
  const themesReveal = useScrollReveal();
  const featuredReveal = useScrollReveal();
  const conceptReveal = useScrollReveal();
  const groupReveal = useScrollReveal();
  const howReveal = useScrollReveal();
  const reviewsReveal = useScrollReveal();
  const pressReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  const goBook = (location: BookingClickLocation) => {
    trackBookingClick(location);
    window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
  };
  const scrollToPopularThemes = () => document.getElementById('popular-themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* Hero media: same sources and loading rules as the live home page. */
  const heroImages = content.images.hero as { home: string; homeMobile?: string; video?: string; videoMobile?: string };
  const heroVideoDesktop = (heroImages.video ?? '').trim();
  const heroVideoMobile = (heroImages.videoMobile ?? '').trim() || heroVideoDesktop;
  const hasConceptVideo = Boolean(heroVideoDesktop || heroImages.videoMobile?.trim());
  const encMediaSrc = (path: string) => (path.includes(' ') ? encodeURI(path) : path);
  const isVideoMedia = (path: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(path);
  const usableHeroMedia = (path: string) => path && !path.includes('toolandtea.com');
  const rawHeroHome = (heroImages.home ?? '').trim();
  const heroBgDesktopSrc = usableHeroMedia(rawHeroHome) ? rawHeroHome : SITE_IMAGES.hero.home;
  const rawHeroHomeMobile = (heroImages.homeMobile ?? '').trim();
  const heroBgMobileSrc = usableHeroMedia(rawHeroHomeMobile) ? rawHeroHomeMobile : SITE_IMAGES.hero.homeMobile ?? heroBgDesktopSrc;
  const heroDesktopIsVideo = isVideoMedia(heroBgDesktopSrc);
  const heroMobileIsVideo = isVideoMedia(heroBgMobileSrc);
  const heroDesktopSrc = hasMounted && mdUp ? encMediaSrc(heroBgDesktopSrc) : undefined;
  const heroMobileSrc = hasMounted && !mdUp ? encMediaSrc(heroBgMobileSrc) : undefined;
  const conceptDesktopSrc = hasMounted && conceptVideoLazy.near && mdUp ? encMediaSrc(heroVideoDesktop || heroVideoMobile) : undefined;
  const conceptMobileSrc = hasMounted && conceptVideoLazy.near && !mdUp ? encMediaSrc(heroVideoMobile || heroVideoDesktop) : undefined;

  const carouselTestimonials = site.home.testimonials.carousel;
  const featuredTestimonials = site.home.testimonials.featured;
  const featuredAuthors = new Set(featuredTestimonials.map((t) => t.author));
  const reviewWall = carouselTestimonials.filter((t) => !featuredAuthors.has(t.author) && t.text.length <= 120).slice(0, 6);

  const homeUiCopy = localizedCopy.ui.home;
  const heroCopy = site.home.hero;
  const heroBadge = stripJpSentinel(heroCopy.badge).replace(/[「」]/g, '');
  const tagline = jp ? '2016年創業・日本初のペイント＆シップスタジオ' : "Japan's first paint & sip studio, est. 2016";

  const quickInfo = jp
    ? {
        eyebrow: 'はじめての方へ', title: 'すべて込みの、気軽なアート体験。', priceLabel: '料金', priceValue: '¥4,620〜', priceNote: 'フリードリンク・おつまみ・画材込み',
        items: [
          { label: '所要時間', value: '約2時間' },
          { label: '開催エリア', value: '代官山・原宿・銀座・横浜' },
          { label: 'はじめての方', value: '初心者OK・手ぶらOK' },
          { label: '作品のお持ち帰り', value: 'ほとんどの作品は当日お持ち帰り' },
        ],
      }
    : {
        eyebrow: 'Your first visit', title: "Everything's included.", priceLabel: 'Price', priceValue: '¥4,620+', priceNote: 'free-flow drinks, snacks & materials included',
        items: [
          { label: 'Duration', value: 'Around 2 hours' },
          { label: 'Studios', value: 'Daikanyama · Harajuku · Ginza · Yokohama' },
          { label: 'Who it’s for', value: 'Beginners welcome, nothing to bring' },
          { label: 'Take-home', value: 'Most artwork goes home with you the same day' },
        ],
      };
  const upcomingSessions = jp
    ? { title: '直近のセッション', subtitle: '当日でも空きがあればご予約可能です。', allLink: 'すべての日程を見る', iframeTitle: '今日・明日の空きセッション一覧', laterIframeTitle: 'この先の開催セッション一覧' }
    : { title: 'Coming up at Artbar', subtitle: 'Same-day booking is available while spots last.', allLink: 'See the full schedule', iframeTitle: 'Artbar sessions today and tomorrow', laterIframeTitle: 'Artbar sessions later this week' };
  const embedLocale = jp ? 'ja' : 'en';
  const upcomingFromDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(new Date(Date.now() + 2 * 86_400_000));

  const gift = HOLIDAY_GIFT_COPY[lang];
  const yearEndCopy = YEAR_END_HOME_COPY[lang];

  const heroTitle = jp
    ? 'text-[clamp(1.5rem,7.3vw,2.6rem)] leading-[1.38] tracking-[0.03em] md:text-[clamp(2.75rem,4.6vw,4.4rem)]'
    : 'font-heading text-[clamp(2.6rem,10vw,3.4rem)] leading-[0.98] tracking-[-0.02em] md:text-[clamp(3.5rem,6.4vw,6rem)]';

  return (
    <div className="hp w-full bg-artbar-bg text-artbar-navy">
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative z-[1] h-[100svh] min-h-[640px] w-full overflow-hidden bg-artbar-navy">
        {heroDesktopIsVideo ? (
          <video autoPlay muted loop playsInline preload={mdUp ? 'auto' : 'none'} src={heroDesktopSrc} className="hp-hero-media absolute inset-0 hidden h-full w-full object-cover object-[center_30%] md:block" aria-hidden />
        ) : (
          <Image src={heroBgDesktopSrc} alt={stripJpSentinel(homeUiCopy.heroImageAlt)} fill sizes="100vw" className="hidden object-cover md:block" />
        )}
        {heroMobileIsVideo ? (
          <video autoPlay muted loop playsInline preload={mdUp ? 'none' : 'auto'} src={heroMobileSrc} className="hp-hero-media hp-hero-media-m absolute inset-0 h-full w-full object-cover object-[center_30%] md:hidden" aria-hidden />
        ) : (
          <Image src={heroBgMobileSrc} alt={stripJpSentinel(homeUiCopy.heroImageAlt)} fill sizes="100vw" className="object-cover md:hidden" />
        )}
        {/* Two-layer wash: navy from below (plus a left fall-off behind the copy), taupe from the top. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-artbar-navy via-artbar-navy/45 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-artbar-navy/70 via-artbar-navy/10 to-transparent md:block" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-artbar-taupe/55 to-transparent" aria-hidden />
        {holiday && <HolidayLights />}
        {/* Mounted-print hairline */}
        <div className="pointer-events-none absolute inset-3 z-[2] border border-white/20 md:inset-6" aria-hidden />

        <div className={`${WRAP} absolute inset-x-0 bottom-0 z-[3] pb-8 md:pb-12`}>
          <div className="flex items-end justify-between gap-10">
            <div className="min-w-0 max-w-[46rem] text-white">
              <p className="hp-in flex items-center gap-3 text-[11px] tracking-[0.1em] text-artbar-light-taupe md:gap-4 md:text-[13px] md:tracking-[0.18em]" style={{ animationDelay: '150ms' }}>
                <span className="h-px w-6 shrink-0 bg-artbar-taupe md:w-10" aria-hidden />
                <span className={jp ? '' : 'font-heading font-semibold uppercase'}>{tagline}</span>
              </p>
              <h1 className={`hp-in mt-5 font-semibold text-white md:mt-7 ${heroTitle}`} style={{ animationDelay: '300ms' }}>
                <span className="block whitespace-nowrap">{stripJpSentinel(heroCopy.title)}</span>
                <span className="block whitespace-nowrap">{stripJpSentinel(heroCopy.titleHighlight)}</span>
              </h1>
              <p className="hp-in mt-5 max-w-xl whitespace-pre-line text-[15px] leading-[1.9] text-white/80 md:mt-6 md:text-lg" style={{ animationDelay: '450ms' }}>
                <JpText>{heroCopy.subtitle.replace(/<wbr\s*\/?>/gi, '')}</JpText>
              </p>
              <div className="hp-in mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8 md:mt-9" style={{ animationDelay: '600ms' }}>
                <button type="button" onClick={() => goBook('home_hero')} className={`${PILL_TAUPE} w-full sm:w-auto`}>
                  <JpText>{heroCopy.ctaSchedule}</JpText>
                  <ArrowRight size={17} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </button>
                <button type="button" onClick={scrollToPopularThemes} className="group inline-flex min-h-11 items-center gap-2 border-b border-white/40 pb-0.5 text-sm font-medium text-white/90 transition-colors hover:border-white hover:text-white md:text-[15px]">
                  <JpText>{site.home.hero.ctaFindPainting}</JpText>
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </button>
              </div>
            </div>
            <Seal className="hp-in relative mb-2 hidden w-40 shrink-0 text-[15px] lg:block xl:w-44" />
          </div>

          {/* Facts rail: proof and first-visit facts, above the fold (HB 4-1/4-2). */}
          <dl className="hp-in mt-8 hidden grid-cols-5 border-t border-white/20 pt-5 text-white md:mt-10 md:grid" style={{ animationDelay: '800ms' }}>
            {[
              { v: <span className="flex items-center gap-2.5"><Stars /><span className="font-heading text-lg font-semibold">{heroCopy.ratingScore}</span></span>, l: jp ? 'Google 口コミ' : 'Google reviews' },
              { v: <span className="font-heading text-lg font-semibold tabular-nums">{guestCountFormatted}</span>, l: jp ? '名が体験' : 'guests so far' },
              { v: <span className="font-heading text-lg font-semibold">{quickInfo.priceValue}</span>, l: jp ? 'ドリンク・画材込み' : 'drinks & materials included' },
              { v: <span className="text-[15px] font-semibold">{quickInfo.items[0].value}</span>, l: quickInfo.items[0].label },
              { v: <span className="text-[15px] font-semibold">{jp ? '4スタジオ' : '4 studios'}</span>, l: quickInfo.items[1].value },
            ].map((f, i) => (
              <div key={i} className={`flex flex-col-reverse gap-1 ${i ? 'border-l border-white/15 pl-6' : ''}`}>
                <dt className="text-xs tracking-[0.06em] text-white/60">{f.l}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          <div className="hp-in mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/75 md:hidden" style={{ animationDelay: '800ms' }}>
            <Stars /><span className="font-heading font-semibold text-white">{heroCopy.ratingScore}</span>
            <span className="text-white/35">|</span><span>{jp ? `${guestCountFormatted}名が体験` : `${guestCountFormatted}+ guests`}</span>
            <span className="text-white/35">|</span><span>{quickInfo.priceValue}</span>
          </div>
        </div>
      </section>

      {/* ── 2. Holiday gift certificate (seasonal) ─────────────────────── */}
      {holiday && (
        <section aria-labelledby="hp-gift-title" className="holiday-fade-in bg-artbar-bg pt-16 md:pt-24">
          <div className={WRAP}>
            <div className="relative grid overflow-hidden bg-white ring-1 ring-artbar-navy/10 md:grid-cols-[5fr_7fr]">
              <div className="pointer-events-none absolute inset-2.5 z-[1] border border-artbar-taupe/35 md:inset-3.5" aria-hidden />
              <div className="relative flex min-h-[15rem] items-center justify-center bg-artbar-navy md:min-h-[22rem]">
                <div className="relative h-[78%] w-[78%] -rotate-3 transition-transform duration-700 hover:rotate-0">
                  <Image src={gift.image} alt={cleanDisplayText(gift.imageAlt)} fill className="object-contain [filter:drop-shadow(0_16px_20px_rgba(0,0,0,0.45))]" sizes="(max-width: 768px) 80vw, 34vw" />
                </div>
              </div>
              <div className="relative z-[2] flex flex-col justify-center px-7 py-10 md:px-14 md:py-14">
                <Eyebrow><JpText>{gift.stub}</JpText></Eyebrow>
                <h2 id="hp-gift-title" className={`mt-5 ${h2}`}><JpText>{gift.title}</JpText></h2>
                <p className="mt-4 max-w-[34rem] text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{gift.body}</JpText></p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
                  <button type="button" className={`${PILL_NAVY} w-full sm:w-auto`} onClick={() => { trackGiftCertificateClick('home_holiday_banner'); window.location.href = withBrowserAcquisition(GIFT_CERTIFICATES_URL); }}>
                    <JpText>{gift.cta}</JpText>
                  </button>
                  <TextLink href={localizeHrefForLanguage(HOLIDAY_GIFT_BLOG_PATH, lang)}><JpText>{gift.ideasLink}</JpText></TextLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. First visit (HB 4-2) ─────────────────────────────────────── */}
      <section className="bg-artbar-bg pb-16 pt-20 md:pb-24 md:pt-28">
        <div ref={firstVisitReveal.ref} className={`${WRAP} reveal ${firstVisitReveal.isVisible ? 'visible' : ''}`}>
          <div className="grid gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-5">
              <Eyebrow><JpText>{quickInfo.eyebrow}</JpText></Eyebrow>
              <h2 className={`mt-5 ${h2}`}><JpText>{quickInfo.title}</JpText></h2>
            </div>
            <p className="self-end text-[15px] leading-[2] text-artbar-gray md:col-span-6 md:col-start-7 md:text-[17px]"><JpText>{site.home.experienceIntro}</JpText></p>
          </div>

          <div className="mt-12 grid border-y border-artbar-navy/15 md:mt-16 md:grid-cols-[1.25fr_repeat(4,1fr)]">
            <div className="flex flex-col justify-center gap-1.5 border-b border-artbar-navy/15 py-8 md:border-b-0 md:border-r md:py-10 md:pr-10">
              <p className="text-xs tracking-[0.14em] text-artbar-taupe"><JpText>{quickInfo.priceLabel}</JpText></p>
              <p className="font-heading text-[2.75rem] font-semibold leading-none tracking-tight tabular-nums md:text-[3.25rem]">{quickInfo.priceValue}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-artbar-gray"><JpText>{quickInfo.priceNote}</JpText></p>
            </div>
            <div className="grid grid-cols-2 md:col-span-4 md:grid-cols-4">
              {quickInfo.items.map(({ label, value }, i) => (
                <div key={label} className={`flex flex-col gap-2 py-7 md:px-8 md:py-10 ${i % 2 === 1 ? 'border-l border-artbar-navy/15 pl-5' : 'pr-5'} ${i >= 2 ? 'border-t border-artbar-navy/15 md:border-t-0' : ''} ${i > 0 ? 'md:border-l md:pl-8' : 'md:pl-8'}`}>
                  <span className="font-heading text-[11px] font-semibold tracking-[0.3em] text-artbar-taupe">0{i + 1}</span>
                  <p className="text-xs tracking-[0.12em] text-artbar-navy/55"><JpText>{label}</JpText></p>
                  <p className="text-[15px] font-semibold leading-snug md:text-base"><JpText>{value}</JpText></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Live sessions (HB 4-3): unchanged embeds, new frame ──────── */}
      <section id="upcoming-sessions" className="scroll-mt-28 border-y border-artbar-navy/10 bg-white pb-10 pt-16 md:scroll-mt-32 md:pb-14 md:pt-24">
        <div className={WRAP}>
          <div className="mb-6 flex flex-col justify-between gap-5 md:mb-8 md:flex-row md:items-end">
            <div>
              <p className="flex items-center gap-3 font-heading text-[11px] font-semibold uppercase tracking-[0.32em] text-artbar-taupe md:text-xs">
                <span className="relative flex h-2 w-2" aria-hidden><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-artbar-taupe opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-artbar-taupe" /></span>
                Live schedule
              </p>
              <h2 className={`mt-5 ${h2}`}><JpText>{upcomingSessions.title}</JpText></h2>
              <p className="mt-3 text-[15px] leading-[1.9] text-artbar-gray md:text-base"><JpText>{upcomingSessions.subtitle}</JpText></p>
            </div>
            <button type="button" onClick={() => goBook('home_today_tomorrow')} className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start border-b border-artbar-navy/25 pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors hover:border-artbar-navy md:self-auto md:text-[15px]">
              <JpText>{upcomingSessions.allLink}</JpText>
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </button>
          </div>
          <div className="-mx-4 sm:-mx-6 md:-mx-10">
            <iframe data-painta-embed src={`${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/today-tomorrow?locale=${embedLocale}&cta=hide&background=transparent&limit=24`} title={stripJpSentinel(upcomingSessions.iframeTitle)} loading="lazy" className="block h-[800px] w-full border-0 sm:h-[520px]" />
            {hasMounted && (
              <iframe data-painta-embed src={`${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/upcoming?locale=${embedLocale}&cta=hide&background=transparent&layout=rail&from=${upcomingFromDate}&limit=8`} title={stripJpSentinel(upcomingSessions.laterIframeTitle)} loading="lazy" className="block h-[420px] w-full border-0" />
            )}
          </div>
        </div>
        <Script src={`${PAINTA_EMBED_ORIGIN}/embed.js`} strategy="afterInteractive" />
      </section>

      {/* ── 5. Year-end parties (seasonal) ──────────────────────────────── */}
      {yearEnd.active && (
        <section aria-labelledby="hp-year-end-title" className="relative overflow-hidden bg-artbar-navy text-white">
          <div className={`${WRAP} grid items-center gap-12 py-20 md:py-28 lg:grid-cols-12 lg:gap-16`}>
            <div className="lg:col-span-5">
              <Eyebrow tone="light"><JpText>{withYear(yearEndCopy.badge, yearEnd.year)}</JpText></Eyebrow>
              <h2 id="hp-year-end-title" className={`mt-6 ${h2}`}>
                <span className="block"><JpText>{yearEndCopy.title}</JpText></span>
                <span className="block text-artbar-light-taupe"><JpText>{yearEndCopy.titleHighlight}</JpText></span>
              </h2>
              <p className="mt-6 max-w-md text-[15px] leading-[2] text-white/75 md:text-base"><JpText>{yearEndCopy.body}</JpText></p>
              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
                <button type="button" className={`${PILL_TAUPE} w-full sm:w-auto`} onClick={() => { trackInquiryClick('team_building', 'home_year_end'); window.location.href = withBrowserAcquisition(TEAM_BUILDING_INQUIRY_URL); }}>
                  <JpText>{yearEndCopy.cta}</JpText>
                </button>
                <TextLink tone="light" href={`${localizeHrefForLanguage('/team-building', lang)}#${YEAR_END_SECTION_ID}`}><JpText>{yearEndCopy.detailsLink}</JpText></TextLink>
              </div>
              <a href={`${localizeHrefForLanguage('/private-parties', lang)}#${YEAR_END_SECTION_ID}`} className="mt-6 inline-flex min-h-11 items-center gap-2 text-[13px] text-artbar-light-taupe/90 transition-colors hover:text-white">
                <JpText>{yearEndCopy.privateLink}</JpText><ArrowRight size={13} aria-hidden />
              </a>
            </div>
            <div className="relative lg:col-span-7">
              <div className="relative border border-white/15 p-2.5 md:p-3.5">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={yearEndCopy.image} alt={cleanDisplayText(yearEndCopy.imageAlt)} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" />
                </div>
              </div>
              <div className="absolute -bottom-8 -left-4 hidden w-44 rotate-[-4deg] bg-white p-2 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] md:block xl:-left-10 xl:w-52">
                <div className="relative aspect-[4/5]">
                  <Image src={yearEndCopy.insetImage} alt={cleanDisplayText(yearEndCopy.insetImageAlt)} fill className="object-cover" sizes="208px" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Popular themes ───────────────────────────────────────────── */}
      <section id="popular-themes" className="scroll-mt-28 bg-artbar-bg py-20 md:scroll-mt-32 md:py-28">
        <div ref={themesReveal.ref} className={WRAP}>
          <div className={`mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end reveal ${themesReveal.isVisible ? 'visible' : ''}`}>
            <div className="md:col-span-7">
              <Eyebrow latin>Themes</Eyebrow>
              <h2 className={`mt-5 ${h2}`}><JpText>{site.home.themes.title}</JpText></h2>
              <p className="mt-4 max-w-lg text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{site.home.themes.subtitle}</JpText></p>
            </div>
            <div className="md:col-span-5 md:justify-self-end">
              <button type="button" onClick={() => goBook('home_themes')} className={`${PILL_TAUPE} w-full md:w-auto`}>
                <JpText>{site.home.themes.cta}</JpText>
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </button>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16 reveal-stagger ${themesReveal.isVisible ? 'visible' : ''}`}>
            {(showAllThemes ? orderedThemes : orderedThemes.slice(0, 6)).map((item, i) => {
              const slug = themeSlugFromItem(item);
              const plainTitle = stripJpSentinel(item.title.replace(/<wbr\s*\/?>/gi, ''));
              return (
                <article key={slug} className="group min-w-0">
                  <Link href={localizeHrefForLanguage(`/themes/${slug}`, lang)} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy">
                    <div className="relative aspect-[4/5] overflow-hidden bg-artbar-light-taupe/40">
                      <Image src={item.image} alt={plainTitle} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]" />
                      <div className="pointer-events-none absolute inset-2 border border-white/0 transition-colors duration-500 group-hover:border-white/60 md:inset-3" aria-hidden />
                      <span className="absolute left-3 top-3 font-heading text-[10px] font-semibold tracking-[0.3em] text-white drop-shadow md:left-5 md:top-5 md:text-[11px]">No.{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className={`mt-4 md:mt-6 ${jp ? 'text-base font-semibold leading-snug tracking-[0.04em] md:text-xl' : 'font-heading text-lg font-semibold leading-tight md:text-2xl'}`}><JpText>{item.title}</JpText></h3>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-[1.85] text-artbar-gray md:text-sm"><JpText>{item.desc}</JpText></p>
                  </Link>
                  <TextLink
                    href={getArtbarBookingThemeUrl(slug)}
                    onClick={() => trackBookingClick('home_themes', { theme: slug })}
                    aria-label={`${plainTitle}: ${jp ? '空き日程を見る' : 'View dates'}`}
                    className="mt-3 md:mt-4"
                  >
                    {jp ? '空き日程を見る' : 'View dates'}
                  </TextLink>
                </article>
              );
            })}
          </div>
          {orderedThemes.length > 6 && (
            <div className="mt-14 flex justify-center border-t border-artbar-navy/10 pt-10">
              <button type="button" aria-expanded={showAllThemes} onClick={() => setShowAllThemes(!showAllThemes)} className="min-h-12 rounded-full border border-artbar-navy/25 px-8 text-sm font-semibold tracking-[0.06em] transition-colors hover:border-artbar-navy hover:bg-white">
                {showAllThemes ? (jp ? '表示を減らす' : 'Show fewer themes') : (jp ? 'すべてのテーマを見る' : 'Show all themes')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 7. Featured testimonials: typographic, no cards ─────────────── */}
      <section className="bg-artbar-bg pb-20 md:pb-28">
        <div ref={featuredReveal.ref} className={WRAP}>
          <div className={`grid border-t border-artbar-navy/15 md:grid-cols-3 reveal-stagger ${featuredReveal.isVisible ? 'visible' : ''}`}>
            {featuredTestimonials.map((item, i) => (
              <figure key={i} className={`flex flex-col pt-10 md:px-10 md:pt-14 ${i ? 'border-t border-artbar-navy/15 md:border-l md:border-t-0' : 'md:pl-0'} ${i === featuredTestimonials.length - 1 ? 'md:pr-0' : ''} pb-10 md:pb-0`}>
                <span className="font-heading text-6xl leading-[0.6] text-artbar-taupe" aria-hidden>&ldquo;</span>
                <blockquote className="mt-5 flex-grow text-[15px] leading-[2] text-artbar-navy md:text-[17px]"><JpText>{item.text}</JpText></blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {item.userImage ? (
                    <img src={item.userImage} alt="" loading="lazy" decoding="async" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white font-heading text-sm font-semibold">{item.author.charAt(0)}</span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold"><JpText>{item.author}</JpText></span>
                    {item.role && <span className="mt-0.5 block text-xs tracking-[0.08em] text-artbar-taupe"><JpText>{item.role}</JpText></span>}
                  </span>
                  <Stars className="ml-auto" size="h-3 w-3" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Concept ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-20 md:py-32">
        <div ref={conceptReveal.ref} className={`${WRAP} flex flex-col items-center text-center reveal ${conceptReveal.isVisible ? 'visible' : ''}`}>
          <Eyebrow latin className="justify-center [&>span:first-child]:hidden md:[&>span:first-child]:block">{stripJpSentinel(site.home.concept.est)}</Eyebrow>
          <h2 className={`mt-6 max-w-4xl whitespace-pre-line ${h2}`}><JpText>{site.home.concept.title}</JpText></h2>

          <div ref={conceptVideoLazy.ref} className="group relative mt-12 w-full max-w-[60rem] border border-artbar-navy/10 bg-artbar-bg p-2.5 md:mt-16 md:p-4">
            <div className="relative aspect-square overflow-hidden md:aspect-video">
              {hasConceptVideo ? (
                <>
                  <video autoPlay muted loop playsInline preload={conceptVideoLazy.near && mdUp ? 'auto' : 'none'} poster={content.images.concept.main} src={conceptDesktopSrc} className="hidden h-full w-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105 md:block" />
                  <video autoPlay muted loop playsInline preload={conceptVideoLazy.near && !mdUp ? 'auto' : 'none'} poster={content.images.concept.main} src={conceptMobileSrc} className="h-full w-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105 md:hidden" />
                </>
              ) : (
                <Image src={content.images.concept.main} alt={stripJpSentinel(homeUiCopy.conceptImageAlt)} fill sizes="(max-width: 768px) 100vw, 60rem" className="object-cover" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-artbar-navy/15" />
              <a href={CONCEPT_BLOCK_YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label={stripJpSentinel(homeUiCopy.conceptVideoCta)} className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/15 backdrop-blur-md transition duration-300 hover:scale-105 hover:bg-white/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:h-24 md:w-24">
                <span className="absolute inset-[-10px] rounded-full border border-white/25" aria-hidden />
                <Play className="ml-1 h-7 w-7 text-white md:h-8 md:w-8" fill="currentColor" strokeWidth={0} aria-hidden />
              </a>
            </div>
          </div>

          <p className="mt-12 max-w-3xl text-[16px] leading-[2] md:mt-16 md:text-xl md:leading-[2]"><JpText>{site.home.concept.p1}</JpText></p>

          <div className="mt-14 flex w-full max-w-3xl flex-col items-center gap-8 border-t border-artbar-navy/10 pt-14 md:mt-16">
            <div className="flex -space-x-3 md:-space-x-4">
              {CONCEPT_SOCIAL_AVATAR_URLS.map((src) => (
                <img key={src} src={src} alt="" width={64} height={64} loading="lazy" decoding="async" className="h-12 w-12 rounded-full border-[3px] border-white object-cover md:h-16 md:w-16" />
              ))}
              <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white bg-artbar-navy font-heading text-[11px] font-semibold text-white md:h-16 md:w-16 md:text-sm"><JpText>{formatGuestCountCompactK(lang)}</JpText></span>
            </div>
            <p className={`${jp ? 'text-[clamp(1.25rem,5.2vw,2rem)] font-semibold tracking-[0.04em]' : 'font-heading text-[clamp(1.6rem,5vw,2.8rem)] font-semibold'} text-balance leading-snug tabular-nums`}><JpText>{guestConceptLabel}</JpText></p>
            <div className={`flex flex-col items-center gap-1 text-artbar-taupe ${jp ? 'text-[13px] tracking-[0.1em]' : 'font-heading text-[11px] font-semibold uppercase tracking-[0.28em] md:text-xs'}`}>
              <span><JpText>{homeUiCopy.bilingualLine1}</JpText></span>
              <span><JpText>{homeUiCopy.bilingualLine2}</JpText></span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. Private & company events ─────────────────────────────────── */}
      <section id="group-events" aria-labelledby="hp-group-title" className="scroll-mt-20 bg-artbar-navy text-white">
        <div ref={groupReveal.ref} className={`${WRAP} py-20 md:py-28 reveal ${groupReveal.isVisible ? 'visible' : ''}`}>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Eyebrow tone="light">{jp ? '貸切イベント・チームビルディング' : 'Private parties & company events'}</Eyebrow>
              <h2 id="hp-group-title" className={`mt-6 ${h2}`}><JpText>{jp ? 'チームで描く、忘れられない時間。' : 'Make something great. Together.'}</JpText></h2>
              <p className="mt-6 max-w-md text-[15px] leading-[2] text-white/75 md:text-base">
                <JpText>{jp ? '仲間と絵を描き、ドリンクを楽しむ貸切アート体験。東京・横浜で、人数やご予算に合うプランをご相談いただけます。' : 'Bring your people together for painting, drinks, and a shared experience. Plan a private event in Tokyo or Yokohama around your group and budget.'}</JpText>
              </p>
              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
                <a href={PRIVATE_PARTY_INQUIRY_URL} onClick={() => trackInquiryClick('private_party', 'home_group_events')} className={`${PILL_BASE} w-full bg-white text-artbar-navy hover:bg-artbar-bg focus-visible:outline-white sm:w-auto`}>
                  <JpText>{jp ? '貸切イベントを相談する' : 'Plan a private event'}</JpText>
                </a>
                <TextLink tone="light" href={localizeHrefForLanguage('/team-building', lang)}><JpText>{homeUiCopy.bookTeamBuildingCta}</JpText></TextLink>
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="border border-white/15 p-2.5 md:p-3.5">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image src={mediaAssetUrl(media, 'home.groupEvents', GROUP_EVENT_IMAGE)} alt={jp ? 'Artbarのスタジオでキャンバスを掲げて楽しむ参加者たち' : 'Guests holding up their canvases during an Artbar group session'} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 md:mt-24">
            <p className="mb-8 text-center text-[12px] tracking-[0.18em] text-white/55 md:mb-10">{jp ? '企業イベントでも選ばれています' : 'Companies who have joined Artbar events'}</p>
            <div className="group-event-logos grid grid-cols-2 border-l border-t border-white/10 sm:grid-cols-4 lg:grid-cols-7">
              {PARTNER_LOGOS.map((logo) => (
                <div key={logo.name} className="flex min-h-[6.5rem] min-w-0 items-center justify-center border-b border-r border-white/10 px-6 py-6 opacity-80 transition-opacity hover:opacity-100">
                  <PartnerLogo {...logo} size="compact" tone="reverse" scaleBoost={PARTNER_LOGO_SCALE_BOOSTS[logo.name]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. How it works: a true sequence, so numbered ──────────────── */}
      <section className="bg-artbar-bg py-20 md:py-28">
        <div ref={howReveal.ref} className={WRAP}>
          <div className={`grid gap-6 md:grid-cols-12 md:items-end reveal ${howReveal.isVisible ? 'visible' : ''}`}>
            <div className="md:col-span-6">
              <Eyebrow latin>How it works</Eyebrow>
              <h2 className={`mt-5 ${h2}`}><JpText>{site.home.howItWorks.title}</JpText></h2>
            </div>
            <p className="text-[15px] leading-[2] text-artbar-gray md:col-span-5 md:col-start-8 md:text-base"><JpText>{site.home.howItWorks.subtitle}</JpText></p>
          </div>
          <ol className={`mt-14 grid grid-cols-1 gap-12 sm:grid-cols-2 md:mt-16 md:gap-8 lg:grid-cols-4 reveal-stagger ${howReveal.isVisible ? 'visible' : ''}`}>
            {site.home.howItWorks.steps.map((step, i) => (
              <li key={i} className={`group ${i % 2 === 1 ? 'lg:mt-16' : ''}`}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={HOW_IT_WORKS_IMAGES[i] ?? HOW_IT_WORKS_IMAGES[0]} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-[1.05]" />
                </div>
                <div className="mt-6 flex items-baseline gap-4 border-t border-artbar-navy/15 pt-5">
                  <span className="font-heading text-3xl font-semibold leading-none text-artbar-taupe" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                  <h3 className={jp ? 'text-lg font-semibold tracking-[0.06em]' : 'font-heading text-xl font-semibold'}><JpText>{step.title}</JpText></h3>
                </div>
                <p className="mt-3 text-[14px] leading-[1.95] text-artbar-gray"><JpText>{step.desc}</JpText></p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 11. Guest reviews ───────────────────────────────────────────── */}
      <section className="border-t border-artbar-navy/10 bg-white py-20 md:py-28">
        <div ref={reviewsReveal.ref} className={WRAP}>
          <div className={`grid gap-8 md:grid-cols-12 md:items-end reveal ${reviewsReveal.isVisible ? 'visible' : ''}`}>
            <div className="md:col-span-7">
              <Eyebrow latin>Google reviews</Eyebrow>
              <h2 className={`mt-5 ${h2}`}><JpText>{site.home.testimonials.title}</JpText></h2>
            </div>
            <div className="flex items-end gap-5 md:col-span-5 md:justify-self-end">
              <span className="font-heading text-[4.5rem] font-semibold leading-[0.8] tracking-tight md:text-[5.5rem]">{heroCopy.ratingScore}</span>
              <span className="flex flex-col gap-2 pb-1">
                <Stars size="h-4 w-4" />
                <span className="text-xs tracking-[0.06em] text-artbar-gray"><JpText>{heroCopy.ratingSource}</JpText></span>
              </span>
            </div>
          </div>
          <div className={`mt-14 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 md:mt-16 reveal-stagger ${reviewsReveal.isVisible ? 'visible' : ''}`}>
            {reviewWall.map((item, i) => (
              <figure key={`${item.author}-${i}`} className={`flex-col border-t border-artbar-navy/15 pt-6 ${i >= 4 ? 'hidden sm:flex' : 'flex'}`}>
                <Stars size="h-3 w-3" />
                <blockquote className="mt-4 flex-grow text-pretty text-[15px] leading-[1.95]">&ldquo;<JpText>{item.text}</JpText>&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold tracking-[0.06em]"><JpText>{item.author}</JpText></span>
                  {item.date ? <span className="tracking-[0.08em] text-artbar-taupe"><JpText>{item.date}</JpText></span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Press ───────────────────────────────────────────────────── */}
      <section id="media" className="scroll-mt-28 bg-artbar-bg py-20 md:scroll-mt-32 md:py-28">
        <div ref={pressReveal.ref} className={WRAP}>
          <div className={`flex flex-col items-center text-center reveal ${pressReveal.isVisible ? 'visible' : ''}`}>
            <Eyebrow latin>As seen in</Eyebrow>
            <h2 className={`mt-5 ${h2}`}><JpText>{site.pressPage.title}</JpText></h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{site.pressPage.subtitle}</JpText></p>
          </div>
        </div>
        <div className={`mt-12 md:mt-14 reveal ${pressReveal.isVisible ? 'visible' : ''}`}>
          <div className="press-marquee relative overflow-hidden">
            <div className="press-marquee-track flex w-max gap-6 px-3 py-4">
              {[...content.media, ...content.media].map((item, idx) => (
                <div key={idx} aria-hidden={idx >= content.media.length} className="group/card relative h-[380px] w-[264px] flex-shrink-0 overflow-hidden bg-artbar-light-taupe/40">
                  {item.fit === 'contain' ? (
                    <>
                      <img src={item.image || item.logo} alt="" aria-hidden loading="lazy" decoding="async" className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl brightness-[0.7]" />
                      <img src={item.image || item.logo} alt={stripJpSentinel(item.outlet)} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-contain" />
                    </>
                  ) : (
                    <img src={item.image || item.logo} alt={stripJpSentinel(item.outlet)} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover/card:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/90 via-artbar-navy/10 to-transparent" />
                  <div className="pointer-events-none absolute inset-2.5 border border-white/25" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    {item.logo ? (
                      <div className="mb-4 flex h-9 w-fit max-w-[120px] items-center bg-white px-2.5 py-1.5"><img src={item.logo} alt="" loading="lazy" decoding="async" className="h-full w-auto object-contain" /></div>
                    ) : null}
                    <h3 className="font-heading text-xl font-semibold leading-tight"><JpText>{item.outlet}</JpText></h3>
                    <p className="mt-1.5 font-heading text-[10px] font-semibold uppercase tracking-[0.3em] text-artbar-light-taupe">{item.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. Closing CTA ─────────────────────────────────────────────── */}
      <div className="bg-artbar-bg pb-4 md:pb-6">
      <section className="relative overflow-hidden bg-artbar-navy">
        <img src={content.images.cta || GI.featureAllInclusive} alt={stripJpSentinel(homeUiCopy.ctaImageAlt)} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-artbar-navy via-artbar-navy/85 to-artbar-navy/40" />
        <div className="pointer-events-none absolute inset-3 border border-white/20 md:inset-6" aria-hidden />
        <div ref={ctaReveal.ref} className={`${WRAP} relative grid items-center gap-12 py-24 md:grid-cols-12 md:py-32 reveal ${ctaReveal.isVisible ? 'visible' : ''}`}>
          <div className="md:col-span-8">
            <Eyebrow tone="light" latin={!jp}><JpText>{site.home.cta.badge}</JpText></Eyebrow>
            <h2 className={`mt-6 text-white ${h2}`}><JpText>{site.home.cta.title}</JpText></h2>
            <p className="mt-5 max-w-xl text-[15px] leading-[2] text-artbar-light-taupe md:text-lg"><JpText>{site.home.cta.subtitle}</JpText></p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <button type="button" onClick={() => goBook('home_bottom')} className={`${PILL_TAUPE} w-full whitespace-nowrap sm:w-auto sm:min-w-[13rem]`}>{stripJpSentinel(site.home.cta.btnBook)}</button>
              <button type="button" onClick={() => router.push(localizeHrefForLanguage('/contact', lang))} className={`${PILL_GHOST_LIGHT} w-full whitespace-nowrap sm:w-auto sm:min-w-[13rem]`}>{stripJpSentinel(site.home.cta.btnContact)}</button>
            </div>
          </div>
          <div className="hidden justify-self-end md:col-span-4 md:block">
            <Seal className="w-44 text-[15px] lg:w-52 lg:text-[17px]" />
          </div>
        </div>
      </section>
      </div>

      <PrefetchHeroes srcs={[content.images.hero.teamBuilding, ...(site.privateParties?.occasions?.[0]?.image ? [site.privateParties.occasions[0].image] : [])].filter(Boolean) as string[]} />
    </div>
  );
};
