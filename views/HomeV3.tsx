'use client';

/**
 * Home page design upgrade, round two: "Paint everywhere".
 *
 * Art direction: a Japanese pop-magazine spread made of real paint. Colour
 * blocks are pigments sampled from Artbar's own canvases (cadmium yellow,
 * rose, viridian, Prussian navy) and meet each other on painted edges;
 * photos sit inside brush-stroke masks; short handwritten notes speak like an
 * instructor. Dela Gothic One sets the headlines, Klee One the notes, Zen Kaku
 * Gothic New the body.
 *
 * Conversion is untouched: same section order as `views/Home.tsx` (Humble
 * Bunny CRO pass), the same copy and CTA wording, the same booking URLs with
 * acquisition params, the same tracked events and the same Painta embeds.
 */

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { StarRating } from '../components/StarRating';
import { useContent } from '../context/ContentContext';
import {
  ARTBAR_BOOKING_URL,
  CONCEPT_BLOCK_YOUTUBE_URL,
  GROUP_EVENT_IMAGE,
  PAINTA_EMBED_ORIGIN,
  PARTNER_LOGOS,
  PRIVATE_PARTY_INQUIRY_URL,
  SITE_IMAGES,
  TEAM_BUILDING_INQUIRY_URL,
  getArtbarBookingThemeUrl,
} from '../constants';
import { mediaAssetUrl } from '../lib/media/resolve';
import { themeSlugFromItem } from '../lib/theme-slugs';
import {
  trackBookingClick,
  trackGiftCertificateClick,
  trackInquiryClick,
  type BookingClickLocation,
} from '../lib/analytics';
import { PartnerLogo } from '../components/PartnerLogo';
import { formatGuestConceptLabel, formatGuestCountCompactK, formatGuestCountDisplay } from '../lib/guest-count';
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
import { cleanDisplayText } from '../lib/jp-display';

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
] as const;

/** Pinned canvases lean a little, each its own way. */
const TILTS = [-2.2, 1.6, -1.1, 2.3, -1.7, 1.2, -2.4, 1.9, -1.3, 2.1, -1.9, 1.4];
/** Sticky-note pigments for the review wall. */
const NOTE_COLOURS = ['#FFE07A', '#FFC3D2', '#C3E2F6', '#CBEBD6', '#FFE07A', '#FFC3D2'];

const cleanForAttr = (s: string) => stripJpSentinel(s.replace(/<wbr\s*\/?>/gi, ''));
const withYear = (text: string, year: number | null) =>
  year === null ? text.replace(/\s*\{year\}年?(<wbr>)?/, '').trim() : text.replace('{year}', String(year));

/** Painted top edge: sits on the previous section and is filled with this section's colour. */
function PaintEdge({ colour }: { colour: string }) {
  return <div aria-hidden className="v3-edge" style={{ backgroundColor: colour }} />;
}

/** A hand-drawn arrow for the instructor notes. */
function Doodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" fill="none" className={className} aria-hidden>
      <path d="M4 10 C 40 4, 78 18, 96 52" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M82 46 L97 55 L101 38" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const HomeV3: React.FC = () => {
  const { content, site, lang, localizedCopy, media } = useContent();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const holiday = useHolidayTheme();
  const yearEnd = useYearEndSeason();
  const jp = lang === 'jp';

  const priorityThemes = ['paint-pouring', 'paint-your-pet', 'texture-painting'];
  const orderedThemes = [...site.home.themes.items].sort((a, b) => {
    const rank = (item: typeof a) => {
      const index = priorityThemes.indexOf(themeSlugFromItem(item));
      return index < 0 ? priorityThemes.length : index;
    };
    return rank(a) - rank(b);
  });
  const visibleThemes = showAllThemes ? orderedThemes : orderedThemes.slice(0, 6);

  const guestCountFormatted = formatGuestCountDisplay(lang);
  const guestConceptLabel = formatGuestConceptLabel(site.home.concept.guestsLabel, lang, guestCountFormatted);
  const mdUp = useMediaMinMd();
  const conceptVideoLazy = useNearViewport<HTMLDivElement>({ rootMargin: '520px' });

  const goBook = (source: BookingClickLocation) => {
    trackBookingClick(source);
    window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
  };
  const scrollToPopularThemes = () =>
    document.getElementById('popular-themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Hero media: same resolution rules as Home.tsx.
  const heroImages = content.images.hero as { home: string; homeMobile?: string; video?: string; videoMobile?: string };
  const heroVideoDesktop = (heroImages.video ?? '').trim();
  const heroVideoMobile = (heroImages.videoMobile ?? '').trim() || heroVideoDesktop;
  const hasConceptVideo = Boolean(heroVideoDesktop || heroImages.videoMobile?.trim());
  const encMediaSrc = (path: string) => (path.includes(' ') ? encodeURI(path) : path);
  const isVideoMedia = (path: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(path);
  const usable = (path: string) => path && !path.includes('toolandtea.com');
  const rawHeroHome = (heroImages.home ?? '').trim();
  const heroDesktop = usable(rawHeroHome) ? rawHeroHome : SITE_IMAGES.hero.home;
  const rawHeroMobile = (heroImages.homeMobile ?? '').trim();
  const heroMobile = usable(rawHeroMobile) ? rawHeroMobile : SITE_IMAGES.hero.homeMobile ?? heroDesktop;
  const heroSrc = mdUp ? heroDesktop : heroMobile;
  const heroIsVideo = isVideoMedia(heroSrc);
  const conceptSrc =
    hasMounted && conceptVideoLazy.near
      ? encMediaSrc(mdUp ? heroVideoDesktop || heroVideoMobile : heroVideoMobile || heroVideoDesktop)
      : undefined;

  useEffect(() => setHasMounted(true), []);

  const carouselTestimonials = site.home.testimonials.carousel;
  const featuredTestimonials = site.home.testimonials.featured;
  const featuredAuthors = new Set(featuredTestimonials.map((t) => t.author));
  const reviewWall = carouselTestimonials
    .filter((t) => !featuredAuthors.has(t.author) && t.text.length <= 120)
    .slice(0, 6);
  const [leadQuote, ...sideQuotes] = featuredTestimonials;

  const homeUiCopy = localizedCopy.ui.home;
  const heroCopy = site.home.hero;
  const gift = HOLIDAY_GIFT_COPY[lang];
  const yearEndCopy = YEAR_END_HOME_COPY[lang];

  const quickInfo = jp
    ? {
        eyebrow: 'はじめての方へ',
        title: 'すべて込みの、気軽なアート体験。',
        priceLabel: '料金',
        priceValue: '¥4,620',
        priceSuffix: '〜',
        priceNote: 'フリードリンク・おつまみ・画材込み',
        note: '手ぶらでOK！',
        items: [
          { label: '所要時間', value: '約2時間' },
          { label: '開催エリア', value: '代官山・原宿・銀座・横浜' },
          { label: 'はじめての方', value: '初心者OK・手ぶらOK' },
          { label: '作品のお持ち帰り', value: 'ほとんどの作品は当日お持ち帰り' },
        ],
      }
    : {
        eyebrow: 'Your first visit',
        title: "Everything's included.",
        priceLabel: 'Price',
        priceValue: '¥4,620',
        priceSuffix: '+',
        priceNote: 'free-flow drinks, snacks & materials included',
        note: 'Just bring yourself!',
        items: [
          { label: 'Duration', value: 'Around 2 hours' },
          { label: 'Studios', value: 'Daikanyama, Harajuku, Ginza, Yokohama' },
          { label: 'Who it’s for', value: 'Beginners welcome, nothing to bring' },
          { label: 'Take-home', value: 'Most artwork goes home with you the same day' },
        ],
      };
  const upcoming = jp
    ? {
        title: '直近のセッション',
        subtitle: '当日でも空きがあればご予約可能です。',
        note: '今日の夜もまだ間に合うかも',
        allLink: 'すべての日程を見る',
        iframeTitle: '今日・明日の空きセッション一覧',
        laterIframeTitle: 'この先の開催セッション一覧',
      }
    : {
        title: 'Coming up at Artbar',
        subtitle: 'Same-day booking is available while spots last.',
        note: 'Tonight might still work!',
        allLink: 'See the full schedule',
        iframeTitle: 'Artbar sessions today and tomorrow',
        laterIframeTitle: 'Artbar sessions later this week',
      };
  const embedLocale = jp ? 'ja' : 'en';
  const upcomingFromDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(
    new Date(Date.now() + 2 * 86_400_000),
  );

  const h2 = 'v3-display text-[clamp(2.1rem,5.4vw,4.6rem)] leading-[1.12]';
  const btn =
    'v3-btn inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 text-base font-bold leading-none md:min-h-16 md:px-10 md:text-lg focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4';
  const yellowBtn = `${btn} bg-[var(--v3-cad)] text-artbar-navy focus-visible:outline-artbar-navy`;
  const inkBtn = `${btn} bg-artbar-navy text-white focus-visible:outline-artbar-navy`;

  return (
    <div className="home-v3 w-full overflow-x-clip">
      {/* ── 1. Hero: a magazine cover ────────────────────────────────────── */}
      <section className="relative bg-[var(--v3-gesso)] pb-24 pt-24 md:pb-32 md:pt-32">
        {holiday && <HolidayLights />}
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 md:px-12 lg:px-16">
          <p className="v3-note mb-3 inline-flex -rotate-3 items-end gap-1 text-lg text-[var(--v3-rose)] md:mb-4 md:text-2xl">
            <JpText>{heroCopy.badge}</JpText>
            <Doodle className="h-8 w-14 translate-y-3 md:h-10 md:w-16" />
          </p>
          <h1 className="v3-display relative z-10 text-artbar-navy">
            <span className={`block leading-[1.12] ${jp ? 'whitespace-nowrap text-[clamp(1.85rem,7.5vw,7rem)]' : 'text-[clamp(2.6rem,8vw,7rem)]'}`}>
              {stripJpSentinel(heroCopy.title)}
            </span>
            <span className={`block leading-[1.12] ${jp ? 'whitespace-nowrap text-[clamp(1.85rem,7.5vw,7rem)]' : 'text-[clamp(2.6rem,8vw,7rem)]'}`}>
              {stripJpSentinel(heroCopy.titleHighlight)}
            </span>
          </h1>

          <div className="mt-8 grid items-center gap-12 md:mt-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div className="relative z-10">
              <p className="max-w-md text-lg leading-[1.9] text-artbar-navy/80 md:text-xl">
                <JpText>{heroCopy.subtitle.replace(/<wbr\s*\/?>/gi, '')}</JpText>
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-7">
                <button type="button" onClick={() => goBook('home_hero')} className={yellowBtn}>
                  <JpText>{heroCopy.ctaSchedule}</JpText>
                  <ArrowRight size={20} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={scrollToPopularThemes}
                  className="v3-link inline-flex min-h-12 items-center justify-center text-base font-bold text-artbar-navy md:text-lg"
                >
                  <JpText>{site.home.hero.ctaFindPainting}</JpText>
                </button>
              </div>
              <div className="mt-10 flex items-center gap-5">
                <div className="v3-sticker flex h-28 w-28 shrink-0 -rotate-[10deg] flex-col items-center justify-center rounded-full bg-[var(--v3-rose)] text-white md:h-32 md:w-32">
                  <span className="v3-display text-4xl leading-none md:text-5xl">{heroCopy.ratingScore}</span>
                  <StarRating size={11} className="mt-1.5 [&>svg]:fill-white [&>svg]:text-white" />
                </div>
                <p className="max-w-[16rem] text-base font-bold leading-snug text-artbar-navy md:text-lg">
                  <JpText>
                    {jp
                      ? heroCopy.guestsSuffix.replace(/\{\{count\}\}/g, guestCountFormatted)
                      : `${guestCountFormatted}+ ${heroCopy.guestsSuffix}`}
                  </JpText>
                </p>
              </div>
            </div>

            {/* Media: the studio film inside a brush stroke, painted onto a yellow swipe */}
            <div className="relative mx-auto w-full max-w-[44rem] lg:-mt-6">
              <span aria-hidden className="v3-swipe v3-swipe-in absolute -left-[16%] top-[58%] h-[38%] w-[78%] -rotate-[8deg] bg-[var(--v3-cad)]" />
              <span aria-hidden className="v3-blob-2 absolute -bottom-6 -right-4 h-28 w-28 bg-[var(--v3-viridian)] md:h-40 md:w-40" />
              <div className="v3-blob-1 v3-pop-in relative aspect-[5/4] overflow-hidden bg-artbar-navy">
                {heroIsVideo ? (
                  <video
                    autoPlay muted loop playsInline preload="auto"
                    src={hasMounted ? encMediaSrc(heroSrc) : undefined}
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden
                  />
                ) : (
                  <Image src={heroSrc} alt={stripJpSentinel(homeUiCopy.heroImageAlt)} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theme ticker: what you could paint tonight */}
      <div className="relative bg-artbar-navy py-5 text-white md:py-6" aria-hidden>
        <PaintEdge colour="var(--color-artbar-navy)" />
        <div className="v3-ticker overflow-hidden">
          <div className="v3-ticker-track flex w-max items-center gap-8 md:gap-12">
            {[...orderedThemes, ...orderedThemes].map((t, i) => (
              <span key={i} className="flex items-center gap-8 md:gap-12">
                <span className="v3-display whitespace-nowrap text-2xl md:text-4xl">{cleanForAttr(t.title)}</span>
                <span className="h-4 w-4 rounded-full md:h-5 md:w-5" style={{ backgroundColor: ['var(--v3-cad)', 'var(--v3-rose)', 'var(--v3-sky)', 'var(--v3-mint)'][i % 4] }} />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Seasonal gift certificates ───────────────────────────────── */}
      {holiday && (
        <section aria-labelledby="v3-gift-title" className="relative bg-[var(--v3-rose)] text-white">
          <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.1fr] md:px-12 md:py-20 lg:px-16">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md md:max-w-none">
              <Image src={gift.image} alt={cleanDisplayText(gift.imageAlt)} fill sizes="(max-width: 768px) 90vw, 40vw" className="-rotate-6 object-contain [filter:drop-shadow(0_24px_24px_rgba(80,10,30,0.35))]" />
            </div>
            <div>
              <p className="v3-note -rotate-2 text-xl text-artbar-navy md:text-2xl"><JpText>{gift.stub}</JpText></p>
              <h2 id="v3-gift-title" className={`${h2} mt-3`}><JpText>{gift.title}</JpText></h2>
              <p className="mt-5 max-w-lg text-base leading-[1.9] text-white/90 md:text-lg"><JpText>{gift.body}</JpText></p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
                <button
                  type="button"
                  onClick={() => {
                    trackGiftCertificateClick('home_holiday_banner');
                    window.location.href = withBrowserAcquisition(GIFT_CERTIFICATES_URL);
                  }}
                  className={inkBtn}
                >
                  <JpText>{gift.cta}</JpText>
                </button>
                <a href={localizeHrefForLanguage(HOLIDAY_GIFT_BLOG_PATH, lang)} className="v3-link v3-link-light inline-flex min-h-12 items-center justify-center font-bold text-white">
                  <JpText>{gift.ideasLink}</JpText>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. First visit (HB 4-2): yellow price block ─────────────────── */}
      <section className="relative bg-[var(--v3-cad)] text-artbar-navy">
        <PaintEdge colour="var(--v3-cad)" />
        <div className="mx-auto max-w-[1480px] px-5 pb-16 pt-14 sm:px-8 md:px-12 md:pb-20 md:pt-16 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div>
              <p className="v3-note text-xl md:text-2xl"><JpText>{quickInfo.eyebrow}</JpText></p>
              <h2 className={`${h2} mt-2`}><JpText>{quickInfo.title}</JpText></h2>
              <p className="mt-5 max-w-xl text-base leading-[1.9] md:text-lg"><JpText>{site.home.experienceIntro}</JpText></p>
            </div>
            <div className="relative lg:text-right">
              <p className="flex items-baseline gap-4 lg:justify-end">
                <span className="text-sm font-bold"><JpText>{quickInfo.priceLabel}</JpText></span>
                <span className="v3-note inline-block -rotate-3 text-xl text-[var(--v3-rose)] md:text-2xl"><JpText>{quickInfo.note}</JpText></span>
              </p>
              <p className="v3-display whitespace-nowrap leading-none">
                <span className="whitespace-nowrap text-[clamp(3.4rem,7.2vw,7rem)]">{quickInfo.priceValue}</span>
                <span className="text-[clamp(1.8rem,4vw,3.8rem)]">{quickInfo.priceSuffix}</span>
              </p>
              <p className="mt-2 text-sm font-bold md:text-base"><JpText>{quickInfo.priceNote}</JpText></p>
            </div>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-3 md:mt-14 md:gap-4 lg:grid-cols-4">
            {quickInfo.items.map(({ label, value }, i) => (
              <div key={label} className="v3-card rounded-[1.25rem] bg-[var(--v3-gesso)] p-5 md:p-7" style={{ rotate: `${[-1.2, 0.8, -0.6, 1.1][i]}deg` }}>
                <dt className="v3-note text-base text-artbar-navy/60 md:text-lg"><JpText>{label}</JpText></dt>
                <dd className="mt-2 text-lg font-black leading-snug md:text-2xl"><JpText>{value}</JpText></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 4. Live sessions (HB 4-3) ───────────────────────────────────── */}
      <section id="upcoming-sessions" className="relative scroll-mt-28 bg-[var(--v3-gesso)] pb-10 pt-16 md:scroll-mt-32 md:pb-14 md:pt-24">
        <PaintEdge colour="var(--v3-gesso)" />
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-6 flex flex-col justify-between gap-5 md:mb-8 md:flex-row md:items-end">
            <div>
              <h2 className={`${h2} text-artbar-navy`}><JpText>{upcoming.title}</JpText></h2>
              <p className="mt-3 text-base text-artbar-navy/70 md:text-lg">
                <JpText>{upcoming.subtitle}</JpText>
                <span className="v3-note ml-3 inline-block -rotate-2 text-lg text-[var(--v3-rose)] md:text-xl"><JpText>{upcoming.note}</JpText></span>
              </p>
            </div>
            <button type="button" onClick={() => goBook('home_today_tomorrow')} className={`${inkBtn} self-start md:self-auto`}>
              <JpText>{upcoming.allLink}</JpText>
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
          <div className="-mx-4 sm:-mx-6 md:-mx-10">
            <iframe
              data-painta-embed
              src={`${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/today-tomorrow?locale=${embedLocale}&cta=hide&background=transparent&limit=24`}
              title={stripJpSentinel(upcoming.iframeTitle)}
              loading="lazy"
              className="block h-[800px] w-full border-0 sm:h-[520px]"
            />
            {hasMounted && (
              <iframe
                data-painta-embed
                src={`${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/upcoming?locale=${embedLocale}&cta=hide&background=transparent&layout=rail&from=${upcomingFromDate}&limit=8`}
                title={stripJpSentinel(upcoming.laterIframeTitle)}
                loading="lazy"
                className="block h-[420px] w-full border-0"
              />
            )}
          </div>
        </div>
        <Script src={`${PAINTA_EMBED_ORIGIN}/embed.js`} strategy="afterInteractive" />
      </section>

      {/* ── 5. Seasonal: year-end parties ───────────────────────────────── */}
      {yearEnd.active && (
        <section aria-labelledby="v3-year-end-title" className="relative bg-artbar-navy text-white">
          <PaintEdge colour="var(--color-artbar-navy)" />
          <div className="mx-auto grid max-w-[1480px] items-center gap-12 px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:px-16">
            <div className="relative">
              <span aria-hidden className="v3-swipe absolute -left-[6%] bottom-[6%] h-[30%] w-[90%] rotate-[4deg] bg-[var(--v3-rose)]" />
              <div className="v3-blob-2 relative aspect-[4/3] overflow-hidden">
                <Image src={yearEndCopy.image} alt={cleanDisplayText(yearEndCopy.imageAlt)} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
            <div>
              <p className="v3-note -rotate-2 text-xl text-[var(--v3-cad)] md:text-2xl"><JpText>{withYear(yearEndCopy.badge, yearEnd.year)}</JpText></p>
              <h2 id="v3-year-end-title" className={`${h2} mt-3`}>
                <span className="block"><JpText>{yearEndCopy.title}</JpText></span>
                <span className="block"><JpText>{yearEndCopy.titleHighlight}</JpText></span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-[1.9] text-white/85 md:text-lg"><JpText>{yearEndCopy.body}</JpText></p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
                <button
                  type="button"
                  onClick={() => {
                    trackInquiryClick('team_building', 'home_year_end');
                    window.location.href = withBrowserAcquisition(TEAM_BUILDING_INQUIRY_URL);
                  }}
                  className={yellowBtn}
                >
                  <JpText>{yearEndCopy.cta}</JpText>
                </button>
                <a href={`${localizeHrefForLanguage('/team-building', lang)}#year-end-parties`} className="v3-link v3-link-light inline-flex min-h-12 items-center justify-center font-bold text-white">
                  <JpText>{yearEndCopy.detailsLink}</JpText>
                </a>
              </div>
              <a href={`${localizeHrefForLanguage('/private-parties', lang)}#year-end-parties`} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm text-white/70 underline underline-offset-4 hover:text-white">
                <JpText>{yearEndCopy.privateLink}</JpText>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Popular themes: canvases pinned to the studio wall ────────── */}
      <section id="popular-themes" className="relative scroll-mt-20 bg-[var(--v3-gesso)] py-20 md:py-28">
        <PaintEdge colour="var(--v3-gesso)" />
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-14 grid gap-6 md:mb-20 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className={`${h2} text-artbar-navy`}><JpText>{site.home.themes.title}</JpText></h2>
              <p className="mt-4 max-w-xl text-base leading-[1.9] text-artbar-navy/70 md:text-lg"><JpText>{site.home.themes.subtitle}</JpText></p>
            </div>
            <button type="button" onClick={() => goBook('home_themes')} className={`${yellowBtn} self-start`}>
              <JpText>{site.home.themes.cta}</JpText>
              <ArrowRight size={20} aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-10 md:gap-y-16 lg:grid-cols-3">
            {visibleThemes.map((item, index) => {
              const slug = themeSlugFromItem(item);
              const title = cleanForAttr(item.title);
              return (
                <article key={slug} className="v3-pin group relative" style={{ ['--tilt' as string]: `${TILTS[index % TILTS.length]}deg` }}>
                  <span aria-hidden className="v3-tape" style={{ backgroundColor: ['var(--v3-cad)', 'var(--v3-rose)', 'var(--v3-sky)'][index % 3] }} />
                  <div className="v3-polaroid bg-white p-2 pb-4 md:p-3.5 md:pb-6">
                    <Link
                      href={localizeHrefForLanguage(`/themes/${slug}`, lang)}
                      className="relative block aspect-[4/5] overflow-hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-artbar-navy"
                    >
                      <Image src={item.image} alt={title} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                    </Link>
                    <div className="px-1 pt-3 md:px-2 md:pt-5">
                      <h3 className="v3-display text-[0.95rem] leading-tight text-artbar-navy sm:text-xl md:text-3xl"><JpText>{item.title}</JpText></h3>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-artbar-navy/65 md:mt-2 md:text-base"><JpText>{item.desc}</JpText></p>
                      <a
                        href={getArtbarBookingThemeUrl(slug)}
                        onClick={() => trackBookingClick('home_themes', { theme: slug })}
                        aria-label={`${title}: ${jp ? '空き日程を見る' : 'View dates'}`}
                        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-artbar-navy px-4 text-xs font-bold text-white transition hover:bg-[#0a4a80] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-artbar-navy md:mt-4 md:min-h-12 md:px-6 md:text-base"
                      >
                        {jp ? '空き日程を見る' : 'View dates'}
                        <ArrowRight size={16} aria-hidden />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {orderedThemes.length > 6 && (
            <button
              type="button"
              aria-expanded={showAllThemes}
              onClick={() => setShowAllThemes(!showAllThemes)}
              className="mx-auto mt-16 flex min-h-12 items-center rounded-full border-2 border-artbar-navy px-8 font-bold text-artbar-navy transition hover:bg-artbar-navy hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-artbar-navy"
            >
              {showAllThemes ? (jp ? '表示を減らす' : 'Show fewer themes') : jp ? 'すべてのテーマを見る' : 'Show all themes'}
            </button>
          )}
        </div>
      </section>

      {/* ── 7. Featured testimonials: viridian block, speech bubbles ────── */}
      {leadQuote && (
        <section className="relative bg-[var(--v3-viridian)] text-white">
          <PaintEdge colour="var(--v3-viridian)" />
          <div className="mx-auto grid max-w-[1480px] gap-14 px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:grid-cols-[1.3fr_1fr] lg:gap-20 lg:px-16">
            <figure>
              <StarRating size={18} className="mb-6 [&>svg]:fill-[var(--v3-cad)] [&>svg]:text-[var(--v3-cad)]" />
              <blockquote className="v3-display text-[clamp(1.7rem,3.6vw,3.2rem)] leading-[1.5]">
                <JpText>{leadQuote.text}</JpText>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                {leadQuote.userImage ? <img src={leadQuote.userImage} alt="" loading="lazy" className="h-12 w-12 rounded-full object-cover" /> : null}
                <p className="text-base font-bold">
                  <JpText>{leadQuote.author}</JpText>
                  {leadQuote.role && <span className="v3-note ml-3 font-normal text-[var(--v3-cad)]"><JpText>{leadQuote.role}</JpText></span>}
                </p>
              </figcaption>
            </figure>
            <div className="flex flex-col justify-center gap-8">
              {sideQuotes.map((item, i) => (
                <figure key={i} className={`v3-bubble relative rounded-[1.75rem] bg-white p-6 text-artbar-navy md:p-8 ${i % 2 ? 'v3-bubble-right lg:ml-10' : 'lg:mr-10'}`}>
                  <blockquote className="text-base leading-[1.85] md:text-lg"><JpText>{item.text}</JpText></blockquote>
                  <figcaption className="mt-3 text-sm font-bold text-artbar-navy/70"><JpText>{item.author}</JpText></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. Concept: the film and the promise ────────────────────────── */}
      <section className="relative bg-[var(--v3-gesso)] text-artbar-navy">
        <PaintEdge colour="var(--v3-gesso)" />
        <div className="mx-auto grid max-w-[1480px] items-center gap-14 px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-16">
          <div ref={conceptVideoLazy.ref} className="relative">
            <span aria-hidden className="v3-swipe absolute -right-[6%] -top-[4%] h-[36%] w-[80%] rotate-[8deg] bg-[var(--v3-sky)]" />
            <div className="v3-blob-1 relative aspect-square overflow-hidden bg-artbar-navy sm:aspect-[5/4]">
              {hasConceptVideo ? (
                <video autoPlay muted loop playsInline preload={conceptVideoLazy.near ? 'auto' : 'none'} poster={content.images.concept.main} src={conceptSrc} className="h-full w-full object-cover" />
              ) : (
                <Image src={content.images.concept.main} alt={stripJpSentinel(homeUiCopy.conceptImageAlt)} fill sizes="50vw" className="object-cover" />
              )}
            </div>
            <a
              href={CONCEPT_BLOCK_YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={stripJpSentinel(homeUiCopy.conceptVideoCta)}
              className="v3-sticker absolute -bottom-6 left-[8%] flex h-24 w-24 rotate-[-8deg] items-center justify-center rounded-full bg-[var(--v3-cad)] text-artbar-navy transition hover:rotate-0 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-artbar-navy md:h-28 md:w-28"
            >
              <Play size={34} fill="currentColor" strokeWidth={0} className="ml-1" aria-hidden />
            </a>
          </div>
          <div>
            <p className="v3-note text-xl text-[var(--v3-rose)] md:text-2xl"><JpText>{site.home.concept.est}</JpText></p>
            <h2 className={`${h2} mt-3 whitespace-pre-line`}><JpText>{site.home.concept.title}</JpText></h2>
            <p className="mt-7 max-w-lg text-lg leading-[1.9] md:text-xl"><JpText>{site.home.concept.p1}</JpText></p>
            <div className="mt-10 flex -space-x-3">
              {CONCEPT_SOCIAL_AVATAR_URLS.map((src) => (
                <img key={src} src={src} alt="" width={64} height={64} loading="lazy" className="h-14 w-14 rounded-full border-[3px] border-[var(--v3-gesso)] object-cover md:h-16 md:w-16" />
              ))}
              <span className="v3-display flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[var(--v3-gesso)] bg-[var(--v3-rose)] text-xs text-white md:h-16 md:w-16 md:text-sm">
                <JpText>{formatGuestCountCompactK(lang)}</JpText>
              </span>
            </div>
            <p className="v3-display mt-5 text-xl leading-snug md:text-3xl"><JpText>{guestConceptLabel}</JpText></p>
            <p className="mt-3 text-sm text-artbar-navy/65 md:text-base">
              <JpText>{homeUiCopy.bilingualLine1}</JpText> <JpText>{homeUiCopy.bilingualLine2}</JpText>
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. Group events + partner wall ──────────────────────────────── */}
      <section id="group-events" aria-labelledby="v3-group-title" className="relative scroll-mt-20 bg-artbar-navy text-white">
        <PaintEdge colour="var(--color-artbar-navy)" />
        <div className="mx-auto grid max-w-[1480px] items-center gap-12 px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:grid-cols-[1fr_1.05fr] lg:px-16">
          <div>
            <p className="v3-note -rotate-2 text-xl text-[var(--v3-cad)] md:text-2xl">
              {jp ? '貸切イベント・チームビルディング' : 'Private parties & company events'}
            </p>
            <h2 id="v3-group-title" className={`${h2} mt-3`}>
              <JpText>{jp ? 'チームで描く、忘れられない時間。' : 'Make something great. Together.'}</JpText>
            </h2>
            <p className="mt-6 max-w-md text-base leading-[1.9] text-white/80 md:text-lg">
              <JpText>{jp ? '仲間と絵を描き、ドリンクを楽しむ貸切アート体験。東京・横浜で、人数やご予算に合うプランをご相談いただけます。' : 'Bring your people together for painting, drinks, and a shared experience. Plan a private event in Tokyo or Yokohama around your group and budget.'}</JpText>
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
              <a href={PRIVATE_PARTY_INQUIRY_URL} onClick={() => trackInquiryClick('private_party', 'home_group_events')} className={`${btn} bg-white text-artbar-navy focus-visible:outline-white`}>
                <JpText>{jp ? '貸切イベントを相談する' : 'Plan a private event'}</JpText>
              </a>
              <a href={localizeHrefForLanguage('/team-building', lang)} className="v3-link v3-link-light inline-flex min-h-12 items-center justify-center font-bold text-white">
                <JpText>{homeUiCopy.bookTeamBuildingCta}</JpText>
              </a>
            </div>
          </div>
          <div className="relative">
            <span aria-hidden className="v3-swipe absolute -left-[8%] top-[10%] h-[40%] w-[100%] -rotate-[6deg] bg-[var(--v3-cad)]" />
            <div className="v3-blob-2 relative aspect-[4/3] overflow-hidden">
              <Image
                src={mediaAssetUrl(media, 'home.groupEvents', GROUP_EVENT_IMAGE)}
                alt={jp ? 'Artbarのスタジオでキャンバスを掲げて楽しむ参加者たち' : 'Guests holding up their canvases during an Artbar group session'}
                fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover"
              />
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1480px] px-5 pb-20 sm:px-8 md:px-12 md:pb-24 lg:px-16">
          <p className="v3-note mb-10 text-center text-lg text-white/70">{jp ? '企業イベントでも選ばれています' : 'Companies who have joined Artbar events'}</p>
          <div className="group-event-logos mx-auto grid max-w-6xl grid-cols-2 items-center gap-x-10 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
            {PARTNER_LOGOS.map((logo) => (
              <div key={logo.name} className="min-w-0">
                <PartnerLogo {...logo} size="compact" tone="reverse" scaleBoost={PARTNER_LOGO_SCALE_BOOSTS[logo.name]} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. How it works: four stops along one brush stroke ─────────── */}
      <section className="relative bg-[var(--v3-gesso)] text-artbar-navy">
        <PaintEdge colour="var(--v3-gesso)" />
        <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
          <div className="mb-14 max-w-3xl md:mb-20">
            <h2 className={h2}><JpText>{site.home.howItWorks.title}</JpText></h2>
            <p className="mt-4 text-base leading-[1.9] text-artbar-navy/70 md:text-lg"><JpText>{site.home.howItWorks.subtitle}</JpText></p>
          </div>
          <div className="relative">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute left-0 top-[4.5rem] hidden h-24 w-full lg:block" aria-hidden>
              <path d="M30 70 C 200 10, 330 110, 470 60 S 760 10, 900 70 S 1120 100, 1180 40" fill="none" stroke="var(--v3-cad)" strokeWidth="22" strokeLinecap="round" />
            </svg>
            <ol className="relative grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
              {site.home.howItWorks.steps.map((step, index) => (
                <li key={index}>
                  <span className="v3-display v3-sticker relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white md:h-24 md:w-24 md:text-5xl" style={{ backgroundColor: ['var(--v3-rose)', 'var(--color-artbar-navy)', 'var(--v3-viridian)', 'var(--v3-rose)'][index], rotate: `${[-6, 4, -3, 5][index]}deg` }} aria-hidden>
                    {index + 1}
                  </span>
                  <div className={`${index % 2 ? 'v3-blob-2' : 'v3-blob-1'} relative aspect-[4/3] overflow-hidden`}>
                    <Image src={HOW_IT_WORKS_IMAGES[index] ?? HOW_IT_WORKS_IMAGES[0]} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  </div>
                  <h3 className="v3-display mt-6 text-2xl md:text-3xl"><JpText>{step.title}</JpText></h3>
                  <p className="mt-2 text-base leading-[1.85] text-artbar-navy/75"><JpText>{step.desc}</JpText></p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 11. Review wall: sticky notes ───────────────────────────────── */}
      <section className="relative bg-[var(--v3-sky)] text-artbar-navy">
        <PaintEdge colour="var(--v3-sky)" />
        <div className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className={h2}><JpText>{site.home.testimonials.title}</JpText></h2>
            <div className="flex items-center gap-4">
              <span className="v3-display text-5xl leading-none md:text-6xl">{site.home.hero.ratingScore}</span>
              <div>
                <StarRating size={16} />
                <p className="mt-1 text-sm font-bold"><JpText>{site.home.hero.ratingSource}</JpText></p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {reviewWall.map((item, i) => (
              <figure
                key={`${item.author}-${i}`}
                className={`v3-sticky p-7 md:p-8 ${i >= 4 ? 'hidden sm:block' : ''}`}
                style={{ backgroundColor: NOTE_COLOURS[i % NOTE_COLOURS.length], rotate: `${[-1.5, 1.2, -0.8, 1.6, -1.2, 0.9][i % 6]}deg` }}
              >
                <blockquote className="v3-note text-xl leading-[1.7] md:text-2xl"><JpText>{item.text}</JpText></blockquote>
                <figcaption className="mt-5 flex items-center justify-between text-sm font-bold">
                  <span><JpText>{item.author}</JpText></span>
                  {item.date ? <span className="text-artbar-navy/55"><JpText>{item.date}</JpText></span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Media coverage ──────────────────────────────────────────── */}
      <section id="media" className="relative scroll-mt-28 bg-[var(--v3-gesso)] py-20 text-artbar-navy md:py-28">
        <PaintEdge colour="var(--v3-gesso)" />
        <div className="mx-auto mb-12 max-w-[1480px] px-5 sm:px-8 md:mb-16 md:px-12 lg:px-16">
          <h2 className={h2}><JpText>{site.pressPage.title}</JpText></h2>
          <p className="mt-4 max-w-2xl text-base leading-[1.9] text-artbar-navy/70 md:text-lg"><JpText>{site.pressPage.subtitle}</JpText></p>
        </div>
        <div className="press-marquee relative overflow-hidden">
          <div className="press-marquee-track flex w-max gap-8 px-2 py-8 md:gap-10">
            {[...content.media, ...content.media].map((item, idx) => (
              <div key={idx} aria-hidden={idx >= content.media.length} className="w-[220px] flex-shrink-0 md:w-[260px]" style={{ rotate: `${idx % 2 ? 2 : -2}deg` }}>
                <div className="v3-polaroid bg-white p-2.5 pb-4">
                  <div className="relative aspect-[3/4] overflow-hidden bg-artbar-navy">
                    <img src={item.image || item.logo} alt={stripJpSentinel(item.outlet)} loading="lazy" decoding="async" className={`absolute inset-0 h-full w-full ${item.fit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                  </div>
                  <p className="v3-display mt-3 px-1 text-base md:text-lg"><JpText>{item.outlet}</JpText></p>
                  <p className="v3-note px-1 text-sm text-artbar-navy/60">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. Closing CTA: one more yellow page ───────────────────────── */}
      <section className="relative bg-[var(--v3-cad)] text-artbar-navy">
        <PaintEdge colour="var(--v3-cad)" />
        <div className="mx-auto grid max-w-[1480px] items-center gap-12 px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:grid-cols-[1.4fr_1fr] lg:px-16">
          <div>
            <p className="v3-note -rotate-2 text-xl text-[var(--v3-rose)] md:text-2xl"><JpText>{site.home.cta.badge}</JpText></p>
            <h2 className="v3-display mt-3 text-[clamp(2.4rem,6.4vw,6rem)] leading-[1.1]"><JpText>{site.home.cta.title}</JpText></h2>
            <p className="mt-6 max-w-lg text-lg leading-[1.9] md:text-xl"><JpText>{site.home.cta.subtitle}</JpText></p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button type="button" onClick={() => goBook('home_bottom')} className={inkBtn}>
                {stripJpSentinel(site.home.cta.btnBook)}
                <ArrowRight size={20} aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => router.push(localizeHrefForLanguage('/contact', lang))}
                className={`${btn} border-2 border-artbar-navy text-artbar-navy focus-visible:outline-artbar-navy`}
              >
                {stripJpSentinel(site.home.cta.btnContact)}
              </button>
            </div>
          </div>
          <div className="v3-blob-1 relative hidden aspect-square overflow-hidden lg:block">
            <Image src={content.images.cta} alt={stripJpSentinel(homeUiCopy.ctaImageAlt)} fill sizes="35vw" className="object-cover" />
          </div>
        </div>
      </section>

      <PrefetchHeroes
        srcs={[
          content.images.hero.teamBuilding,
          ...(site.privateParties?.occasions?.[0]?.image ? [site.privateParties.occasions[0].image] : []),
        ].filter(Boolean) as string[]}
      />
    </div>
  );
};
