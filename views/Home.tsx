'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
import {
  Palette,
  Clock,
  MapPin,
  ArrowRight,
  Quote,
  Play,
  PackageCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { PopularThemesGrid } from '../components/PopularThemesGrid';
import { StarRating } from '../components/StarRating';
import { useContent } from '../context/ContentContext';
import {
  ARTBAR_BOOKING_URL,
  GROUP_EVENT_IMAGE,
  PRIVATE_PARTY_INQUIRY_URL,
  LINE_ADD_FRIEND_URL,
  LINE_BRAND_ICON_SRC,
  SITE_IMAGES,
  CONCEPT_BLOCK_YOUTUBE_URL,
  PARTNER_LOGOS,
  PAINTA_EMBED_ORIGIN,
} from '../constants';
import { mediaAssetUrl } from '../lib/media/resolve';
import { themeSlugFromItem } from '../lib/theme-slugs';
import { trackBookingClick, trackInquiryClick } from '../lib/analytics';
import { PartnerLogo } from '../components/PartnerLogo';
import {
  formatGuestCountCompactK,
  formatGuestCountDisplay,
  formatGuestConceptLabel,
} from '../lib/guest-count';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useMediaMinMd } from '../hooks/useMediaMinMd';
import { GI } from '../data/generated-image-paths';

/** Step imagery for the how-it-works flow. Order matches `howItWorks.steps`.
    Step 1 stays the AI blank-canvas flat-lay (no real "booking" photo exists,
    and it reads as the start); steps 2–4 are real guest photos so most of the
    flow isn't AI-generated: 乾杯 (guest with rosé + finished field painting),
    制作 (guests mid-session with a pour-art piece), 完成 (guest beaming beside a
    finished red-poppy canvas). The AI concept images are still used on other
    pages, so we point at dedicated assets here rather than overwriting them. */
const HOW_IT_WORKS_IMAGES = [
  GI.featureAllInclusive,
  '/media/experience/step-cheers.jpg',
  '/media/experience/step-create.jpg',
  '/media/experience/step-finished.jpg',
];
import { useNearViewport } from '../hooks/useNearViewport';
import { PrefetchHeroes } from '../components/PrefetchHeroes';
import { localizeHrefForLanguage } from '../lib/locale-routing';

/** Compact emblems need a small optical lift beside wide wordmarks, but stay in
 *  the same wall and the same-size frame as every other partner. */
const PARTNER_LOGO_SCALE_BOOSTS: Partial<Record<(typeof PARTNER_LOGOS)[number]['name'], number>> = {
  GE: 1.2,
  Toyota: 1.15,
  Apple: 1.2,
};

const SHOW_HERO_LINE_CTA = false;
/**
 * Square guest-photo crops for the concept social strip. Keep these curated so
 * the homepage only shows public-friendly faces that crop cleanly in circles.
 */
const CONCEPT_SOCIAL_AVATAR_URLS = [
  '/media/testimonials/avatar-20260517-1.jpg',
  '/media/testimonials/avatar-20260517-2.jpg',
  '/media/testimonials/avatar-20260517-3.jpg',
  '/media/testimonials/avatar-20260517-4.jpg',
  '/media/testimonials/avatar-20260517-5.jpg',
  '/media/testimonials/avatar-20260517-6.jpg',
] as const;

export const Home: React.FC = () => {
  const { content, site, lang, localizedCopy, media } = useContent();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const priorityThemes = ['paint-pouring', 'paint-your-pet', 'texture-painting'];
  const orderedThemes = [...site.home.themes.items].sort((a, b) => {
    const rank = (item: typeof a) => { const index = priorityThemes.indexOf(themeSlugFromItem(item)); return index < 0 ? priorityThemes.length : index; };
    return rank(a) - rank(b);
  });
  const theme = content.theme.typography;
  /** JP hero: nowrap per line; fluid up to 1.9rem below `sm` so glyphs fit ~320px width, then same scale as EN. `min(vw, vh)` clause shrinks the title on short viewports (e.g. landscape) so the headline doesn't dominate when there's no vertical room. */
  const heroTitleScale =
    lang === 'jp'
      ? 'text-[clamp(1.5rem,min(7.4vw,6vh),1.9rem)] sm:text-[3.75rem] md:text-[min(4.25rem,10vh)] lg:text-[min(5rem,10.5vh)] xl:text-[min(5.75rem,10.5vh)] 2xl:text-[min(6.25rem,11vh)] tracking-tight'
      : theme.heroTitle;
  const guestCountFormatted = formatGuestCountDisplay(lang);
  const guestConceptLabel = formatGuestConceptLabel(site.home.concept.guestsLabel, lang, guestCountFormatted);
  /** EN concept line: second line "— …" only from `md` (single line on small screens). */
  const enGuestConceptSplit =
    lang === 'en' && guestConceptLabel.includes(' — ')
      ? (() => {
          const parts = guestConceptLabel.split(' — ');
          if (parts.length < 2) return null;
          return { line1: parts[0], line2: `— ${parts.slice(1).join(' — ')}` };
        })()
      : null;

  const mdUp = useMediaMinMd();
  /** Below-fold concept block: avoid loading the same MP4s as the hero until near viewport. */
  const conceptVideoLazy = useNearViewport<HTMLDivElement>({ rootMargin: '520px' });

  const conceptReveal = useScrollReveal();
  const howItWorksReveal = useScrollReveal();
  const themesReveal = useScrollReveal();
  const featuredTestimonialsReveal = useScrollReveal();
  const carouselTestimonialsReveal = useScrollReveal();
  const asSeenInReveal = useScrollReveal();
  const bottomCtaReveal = useScrollReveal();

  const scrollToPopularThemes = () => {
    document.getElementById('popular-themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** Hero primary actions: fixed height + `leading-none` so the line box isn’t taller below the baseline (common JP/Latin mix). Inner row uses a tiny translate-y for optical center in the pill. */
  const heroCtaFrame =
    'inline-flex items-center justify-center rounded-full px-7 sm:px-9 md:px-12 h-[3rem] sm:h-[3.35rem] md:h-[4rem] py-0 text-base sm:text-lg md:text-xl font-heading font-bold tracking-wide leading-none transition duration-200 hover:scale-[1.02] active:scale-[0.96]';
  const heroCtaInner =
    'inline-flex items-center translate-y-px gap-2.5 sm:translate-y-0.5';

  const heroImages = content.images.hero as {
    home: string;
    homeMobile?: string;
    video?: string;
    videoMobile?: string;
  };
  const heroVideoDesktop = (heroImages.video ?? "").trim();
  const heroVideoMobile = (heroImages.videoMobile ?? "").trim() || heroVideoDesktop;
  /** MP4 sources for the concept block when no YouTube ID is set. */
  const hasConceptVideo = Boolean(heroVideoDesktop || heroImages.videoMobile?.trim());

  const encMediaSrc = (path: string) => (path.includes(" ") ? encodeURI(path) : path);
  const isVideoMedia = (path: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(path);
  const isGifMedia = (path: string) => /\.gif(\?|$)/i.test(path);
  const usableHeroMedia = (path: string) => path && !path.includes("toolandtea.com");

  const rawHeroHome = (heroImages.home ?? "").trim();
  const heroBgDesktopSrc = usableHeroMedia(rawHeroHome) ? rawHeroHome : SITE_IMAGES.hero.home;
  const heroBgDesktopIsVideo = isVideoMedia(heroBgDesktopSrc);
  const heroBgDesktopUrl = encMediaSrc(heroBgDesktopSrc);

  const rawHeroHomeMobile = (heroImages.homeMobile ?? "").trim();
  const heroBgMobileSrc = usableHeroMedia(rawHeroHomeMobile)
    ? rawHeroHomeMobile
    : SITE_IMAGES.hero.homeMobile ?? heroBgDesktopSrc;
  const heroBgMobileIsVideo = isVideoMedia(heroBgMobileSrc);
  const heroBgMobileUrl = encMediaSrc(heroBgMobileSrc);

  const conceptVideoDesktopUrl = encMediaSrc(heroVideoDesktop || heroVideoMobile);
  const conceptVideoMobileUrl = encMediaSrc(heroVideoMobile || heroVideoDesktop);

  /** Only the visible breakpoint should buffer (`auto`); the other stays `none` to avoid ~2× bandwidth. */
  const heroDesktopPreload = mdUp ? 'auto' : 'none';
  const heroMobilePreload = mdUp ? 'none' : 'auto';
  const conceptDesktopPreload = conceptVideoLazy.near && mdUp ? 'auto' : 'none';
  const conceptMobilePreload = conceptVideoLazy.near && !mdUp ? 'auto' : 'none';
  const heroDesktopSrc = hasMounted && mdUp ? heroBgDesktopUrl : undefined;
  const heroMobileSrc = hasMounted && !mdUp ? heroBgMobileUrl : undefined;
  const conceptDesktopSrc =
    hasMounted && conceptVideoLazy.near && mdUp ? conceptVideoDesktopUrl : undefined;
  const conceptMobileSrc =
    hasMounted && conceptVideoLazy.near && !mdUp ? conceptVideoMobileUrl : undefined;

  const carouselTestimonials = site.home.testimonials.carousel;
  const featuredTestimonials = site.home.testimonials.featured;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  /** Review wall: short quotes not already in the featured band — dense proof, no carousel. */
  const featuredAuthors = new Set(featuredTestimonials.map((t) => t.author));
  const reviewWall = carouselTestimonials
    .filter((t) => !featuredAuthors.has(t.author) && t.text.length <= 120)
    .slice(0, 6);


  const homeUiCopy = localizedCopy.ui.home;
  const heroCopy = site.home.hero;
  /** First-visit info card (HB 4-2): answers price, duration, place, fit, and inclusions in plain text. */
  const quickInfo =
    lang === 'jp'
      ? {
          eyebrow: 'はじめての方へ',
          title: 'すべて込みの、気軽なアート体験。',
          priceLabel: '料金',
          priceValue: '¥4,620〜',
          priceNote: 'フリードリンク・おつまみ・画材込み',
          items: [
            { icon: Clock, label: '所要時間', value: '約2時間' },
            { icon: MapPin, label: '開催エリア', value: '代官山・原宿・銀座・横浜' },
            { icon: Palette, label: 'はじめての方', value: '初心者OK・手ぶらOK' },
            { icon: PackageCheck, label: '作品のお持ち帰り', value: 'ほとんどの作品は当日お持ち帰り' },
          ],
        }
      : {
          eyebrow: 'Your first visit',
          title: "Everything's included.",
          priceLabel: 'Price',
          priceValue: '¥4,620+',
          priceNote: 'free-flow drinks, snacks & materials included',
          items: [
            { icon: Clock, label: 'Duration', value: 'Around 2 hours' },
            { icon: MapPin, label: 'Studios', value: 'Daikanyama · Harajuku · Ginza · Yokohama' },
            { icon: Palette, label: 'Who it’s for', value: 'Beginners welcome, nothing to bring' },
            { icon: PackageCheck, label: 'Take-home', value: 'Most artwork goes home with you the same day' },
          ],
        };
  const upcomingSessions =
    lang === 'jp'
      ? {
          title: '直近のセッション',
          subtitle: '当日でも空きがあればご予約可能です。',
          allLink: 'すべての日程を見る',
          iframeTitle: '今日・明日の空きセッション一覧',
          laterIframeTitle: 'この先の開催セッション一覧',
        }
      : {
          title: 'Coming up at Artbar',
          subtitle: 'Same-day booking is available while spots last.',
          allLink: 'See the full schedule',
          iframeTitle: 'Artbar sessions today and tomorrow',
          laterIframeTitle: 'Artbar sessions later this week',
        };
  const embedLocale = lang === 'jp' ? 'ja' : 'en';
  /** Day after tomorrow in the studios' timezone, so the upcoming grid starts where the rails end. */
  const upcomingFromDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(
    new Date(Date.now() + 2 * 86_400_000),
  );
  const bookTeamBuildingCta = homeUiCopy.bookTeamBuildingCta;
  const bilingualLine1 = homeUiCopy.bilingualLine1;
  const bilingualLine2 = homeUiCopy.bilingualLine2;
  const heroImageAlt = stripJpSentinel(homeUiCopy.heroImageAlt);
  const conceptImageAlt = stripJpSentinel(homeUiCopy.conceptImageAlt);
  const ctaImageAlt = stripJpSentinel(homeUiCopy.ctaImageAlt);
  const conceptVideoCta = stripJpSentinel(homeUiCopy.conceptVideoCta);

  return (
    <div className="w-full bg-artbar-bg">
      {/* Hero: extra min-height on small screens so all CTAs sit in the hero band; md+ stays one viewport */}
      <section className="relative z-[1] min-h-[100svh] w-full overflow-x-hidden overflow-y-auto md:min-h-0 md:h-[100svh] md:overflow-visible">
        <div
          className="absolute inset-0 min-h-full md:min-h-0 md:m-4 md:rounded-[var(--radius-section)] overflow-hidden bg-artbar-navy"
        >
          <div className="absolute inset-0 z-0">
            <div className="relative isolate h-full w-full min-h-full min-w-full">
              <>
                {heroBgDesktopIsVideo ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={heroDesktopPreload}
                    src={heroDesktopSrc}
                    className="absolute inset-0 z-[1] hidden h-full w-full object-cover object-[center_19%] md:block"
                    aria-hidden
                  />
                ) : (
                  <Image
	                    src={heroBgDesktopSrc}
	                    alt={heroImageAlt}
	                    fill
	                    sizes="100vw"
	                    unoptimized={isGifMedia(heroBgDesktopSrc)}
	                    className={`hidden object-cover object-[center_19%] md:block ${
                      isGifMedia(heroBgDesktopSrc) ? '' : 'hero-bg-motion'
                    }`}
                  />
                )}
                {heroBgMobileIsVideo ? (
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={heroMobilePreload}
                    src={heroMobileSrc}
                    className="absolute inset-0 z-[1] h-full w-full object-cover object-[center_19%] md:hidden"
                    aria-hidden
                  />
                ) : (
                  <Image
	                    src={heroBgMobileSrc}
	                    alt={heroImageAlt}
	                    fill
	                    sizes="100vw"
	                    unoptimized={isGifMedia(heroBgMobileSrc)}
	                    className={`object-cover object-[center_19%] md:hidden ${
                      isGifMedia(heroBgMobileSrc) ? '' : 'hero-bg-motion'
                    }`}
                  />
                )}
              </>
            </div>
          </div>
          {/* Two-layer wash — render immediately so copy is legible over navy plate while video loads */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent from-[18%] via-artbar-navy/50 via-[55%] to-artbar-navy/90 to-100%"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-artbar-taupe/80 from-0% to-transparent to-[52%]"
            aria-hidden
          />

          <div
            className="absolute inset-0 z-[3] flex min-h-full flex-col items-center justify-end pb-16 px-5 pt-[calc(env(safe-area-inset-top,0px)+5.5rem)] text-center md:justify-start md:pb-20 md:min-h-[100svh] md:px-16 lg:px-20 md:pt-[6.75rem] max-w-[1400px] mx-auto"
          >
            {/* md:my-auto = "safe center": centers when there's room, pins below the nav (pt-28) when the stack is taller than a short viewport, instead of riding under the transparent navbar */}
            <div className="max-w-4xl flex w-full flex-col items-center gap-4 sm:gap-5 md:my-auto md:gap-7 lg:gap-8">

              {/* Badge — JP: `font-sans` inner; padding between earlier symmetric and the heavier top bias */}
              <span
                className={`animate-sheen inline-flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 text-center text-white ${
                  lang === 'jp'
                    ? 'pt-[0.38rem] pb-[0.32rem] text-xs sm:text-sm md:text-base normal-case leading-none tracking-wide'
                    : 'py-1.5 font-heading font-bold text-[8px] sm:text-[9px] md:text-xs uppercase tracking-widest'
                }`}
              >
                {lang === 'jp' ? (
                  <span className="font-sans font-bold leading-none"><JpText>{heroCopy.badge}</JpText></span>
                ) : (
                  <JpText>{heroCopy.badge}</JpText>
                )}
              </span>

              {/* Proof line — trust primer above headline */}
              <div className="flex w-full min-w-0 max-w-full flex-col items-center gap-1 text-white/70 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-2.5 sm:gap-y-0 md:gap-3.5">
                <div className="flex shrink-0 items-center gap-2.5 md:gap-3.5">
                  <StarRating
                    size={16}
                    animated
                    delayBase={600}
                    className="md:[&>svg]:w-5 md:[&>svg]:h-5"
                  />
                  <span className="font-heading font-heavy text-white text-base md:text-xl tabular-nums"><JpText>{heroCopy.ratingScore}</JpText></span>
                  <span className="hidden text-white/40 text-lg sm:inline" aria-hidden>
                    ·
                  </span>
                </div>
                <span
                  className={`font-heading min-w-0 text-center text-white/70 sm:w-auto sm:max-w-[min(100%,36rem)] md:tracking-wide ${
                    lang === 'jp'
                      ? 'w-full max-w-full whitespace-nowrap text-[10px] tracking-tight sm:px-0 sm:text-xs md:text-xl'
                      : 'w-full text-sm leading-snug tracking-normal md:text-xl'
                  }`}
                >
                  <JpText>{lang === 'jp'
                    ? heroCopy.guestsSuffix.replace(/\{\{count\}\}/g, guestCountFormatted)
                    : `${guestCountFormatted}+ ${heroCopy.guestsSuffix}`}</JpText>
                </span>
              </div>

              <h1 className="font-heading font-heavy text-white tracking-tighter flex flex-col items-center gap-1.5 md:gap-3 px-1 max-w-[min(100%,52rem)] lg:max-w-[56rem]">
                {/* Sentinels stripped: these spans are single fixed lines (whitespace-nowrap),
                    and JpText's <wbr> would still break inside them. */}
                <span
                  className={`${heroTitleScale} block text-white leading-[0.92] md:leading-[0.94] ${lang === 'jp' ? 'text-center whitespace-nowrap' : ''}`}
                >
                  {stripJpSentinel(heroCopy.title)}
                </span>
                <span
                  className={`${heroTitleScale} block text-white leading-[0.92] md:leading-[0.94] ${lang === 'jp' ? 'text-center whitespace-nowrap' : ''}`}
                >
                  {stripJpSentinel(heroCopy.titleHighlight)}
                </span>
              </h1>

              <h2 className="text-white/85 font-light leading-relaxed max-w-2xl text-base sm:text-lg md:text-2xl lg:text-[1.7rem] px-2 whitespace-pre-line">
                <JpText>{heroCopy.subtitle.replace(/<wbr\s*\/?>/gi, '')}</JpText>
              </h2>

              {/* Primary CTAs */}
              <div className="flex w-full justify-center px-4 pt-4 pb-1 sm:pt-5 md:pt-6">
                <Button
                  onClick={() => {
                    trackBookingClick('home_hero');
                    window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
                  }}
                  variant="taupe"
                  className={`${heroCtaFrame} w-full max-w-[20rem] !text-artbar-navy shadow-[0_8px_30px_-8px_rgba(163,147,132,0.5)] sm:w-auto sm:min-w-[19rem] sm:max-w-none`}
                >
                  <span className={heroCtaInner}>
                    <JpText>{heroCopy.ctaSchedule}</JpText>
                    <ArrowRight size={16} className="shrink-0 text-artbar-navy" aria-hidden />
                  </span>
                </Button>

                {SHOW_HERO_LINE_CTA && (
                  <a
                    href={LINE_ADD_FRIEND_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${heroCtaFrame} bg-[#06C755] text-white shadow-[0_8px_30px_-8px_rgba(6,199,85,0.4)] hover:bg-[#05b34c]`}
                  >
                    <span className={heroCtaInner}>
                      <JpText>{site.home.hero.ctaLineChat}</JpText>
                      <img src={LINE_BRAND_ICON_SRC} alt="" width={24} height={24} className="h-5 w-5 shrink-0 object-contain md:h-6 md:w-6" />
                    </span>
                  </a>
                )}
              </div>

              {/* Tertiary text link */}
              <button
                type="button"
                onClick={scrollToPopularThemes}
                className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2 font-heading text-base md:text-lg text-white/70 tracking-wide hover:text-white transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span className="animate-text-shimmer"><JpText>{site.home.hero.ctaFindPainting}</JpText></span>
                <ArrowRight size={14} className="animate-text-shimmer text-white/50" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* First-visit details (HB 4-2): a light, price-forward card answering the five first-visit questions. */}
      <section className="relative z-[4] bg-artbar-bg px-4 pt-14 pb-2 md:px-10 md:pt-20 md:pb-4">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-7 text-center md:mb-9">
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-artbar-taupe md:text-xs">
              <JpText>{quickInfo.eyebrow}</JpText>
            </p>
            <h2 className={`mt-3 font-heading font-heavy leading-tight tracking-tight text-artbar-navy ${theme.sectionTitle}`}>
              <JpText>{quickInfo.title}</JpText>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-artbar-gray md:text-lg"><JpText>{site.home.experienceIntro}</JpText></p>
          </div>

          <div className="mx-auto max-w-5xl overflow-hidden rounded-[var(--radius-section)] bg-white shadow-[0_28px_80px_-32px_rgba(5,55,97,0.3)] md:grid md:grid-cols-[minmax(11rem,1fr)_minmax(0,3.4fr)]">
            <div className="flex flex-col items-center justify-center gap-1 bg-artbar-navy px-6 py-7 text-center md:py-10">
              <p className="font-heading text-[10px] font-bold uppercase tracking-[0.25em] text-artbar-taupe md:text-xs">
                <JpText>{quickInfo.priceLabel}</JpText>
              </p>
              <p className="font-heading text-3xl font-heavy tabular-nums text-white md:text-4xl">
                {quickInfo.priceValue}
              </p>
              <p className="text-xs leading-snug text-white/70"><JpText>{quickInfo.priceNote}</JpText></p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4">
              {quickInfo.items.map(({ icon: Icon, label, value }, i) => (
                <div
                  key={label}
                  className={`flex flex-col items-center justify-start gap-2 border-artbar-navy/10 px-4 py-6 text-center md:py-8 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t md:border-t-0' : ''} ${i > 0 ? 'md:border-l' : ''}`}
                >
                  <Icon size={22} strokeWidth={1.6} className="text-artbar-taupe" aria-hidden />
                  <p className="font-heading text-[10px] font-bold uppercase tracking-[0.16em] text-artbar-navy/60 md:text-xs">
                    <JpText>{label}</JpText>
                  </p>
                  <p className="text-sm leading-snug text-artbar-navy"><JpText>{value}</JpText></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live sessions (HB 4-3): real bookable sessions from the booking system — today, tomorrow,
          and upcoming rails via the painta embed. The desktop shell shares the same 1400px grid
          as Popular Themes; the event cards retain their compact fixed width so the added room
          reveals more choices instead of stretching transaction cards into feature tiles.
          Transparent embed canvases let the section background show through the iframe edges.
          The booking host embed.js resizes the iframe to its content via postMessage; the h-* fallback
          keeps the rails visible if the script never runs. */}
      <section id="upcoming-sessions" className="scroll-mt-28 bg-[#F3F3ED] pt-14 pb-6 md:scroll-mt-32 md:pt-20 md:pb-10">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className="mb-4 flex flex-col justify-between gap-3 md:mb-6 md:flex-row md:items-end">
            <div>
              <h2 className={`font-heading font-heavy leading-none tracking-tight text-artbar-navy ${theme.sectionTitle}`}>
                <JpText>{upcomingSessions.title}</JpText>
              </h2>
              <p className={`${theme.bodyLarge} mt-3 max-w-lg text-artbar-gray md:mt-4`}>
                <JpText>{upcomingSessions.subtitle}</JpText>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                trackBookingClick('home_today_tomorrow');
                window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
              }}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-start font-heading text-sm font-bold tracking-wide text-artbar-navy underline decoration-artbar-taupe decoration-2 underline-offset-8 transition-colors hover:text-artbar-taupe md:self-auto md:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              <JpText>{upcomingSessions.allLink}</JpText>
              <ArrowRight size={16} className="shrink-0" aria-hidden />
            </button>
          </div>

          {/* Two widgets instead of section=all: its upcoming rail repeats the same sessions the
              today/tomorrow rails already show. Starting the second widget the day after
              tomorrow (business timezone) keeps the rails and the grid disjoint. */}
          <div className="-mx-4 sm:-mx-6 md:-mx-10">
            {/* The mobile fallback must independently fit both rows if embed.js is blocked or its
                first message is missed. The current helper measures a dedicated content wrapper,
                so once it runs it can shrink or grow the frame to the exact content height. */}
            {/* Painta defaults to eight cards per day; use its supported maximum so busy days
                do not lose evening classes from this website's schedule. */}
            <iframe
              data-painta-embed
              src={`${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/today-tomorrow?locale=${embedLocale}&cta=hide&background=transparent&limit=24`}
              title={stripJpSentinel(upcomingSessions.iframeTitle)}
              loading="lazy"
              className="block h-[800px] w-full border-0 sm:h-[520px]"
            />
            {/* No negative overlap: the today/tomorrow widget's bottom padding is
                under 40px, so pulling this widget up clipped the last rail's card
                corners. Let the two widgets sit flush — the natural padding reads as
                a clean break between the urgent rails and the browse-ahead grid. */}
            {/* hasMounted gate: `from` is derived from Date.now(), so SSR and client HTML
                could disagree across the JST day boundary (hydration mismatch). Render
                client-only — the iframe is lazy anyway. */}
            {hasMounted && (
              <iframe
                data-painta-embed
                src={`${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/upcoming?locale=${embedLocale}&cta=hide&background=transparent&layout=rail&from=${upcomingFromDate}&limit=8`}
                title={stripJpSentinel(upcomingSessions.laterIframeTitle)}
                loading="lazy"
                className="block h-[420px] w-full border-0"
              />
            )}
          </div>
        </div>
        {/* afterInteractive (not lazyOnload): the listener must attach before the lazy iframe
            finishes rendering, or the broadcaster's initial height message is missed. */}
        <Script src={`${PAINTA_EMBED_ORIGIN}/embed.js`} strategy="afterInteractive" />
      </section>

      {/* Popular sessions: make the bookable inspiration visible before longer proof sections. */}
      <section
        id="popular-themes"
        className="scroll-mt-28 bg-artbar-bg py-16 md:scroll-mt-32 md:py-24"
      >
        <div ref={themesReveal.ref} className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-12 md:mb-16 gap-6 reveal ${themesReveal.isVisible ? 'visible' : ''}`}>
            <div>
              <h2 className={`${theme.sectionTitle} font-heading font-heavy text-artbar-navy mb-4 tracking-tight leading-none`}><JpText>{site.home.themes.title}</JpText></h2>
              <p className={`${theme.bodyLarge} text-artbar-gray max-w-lg`}>
                <JpText>{site.home.themes.subtitle}</JpText>
              </p>
            </div>
            <Button
              variant="taupe"
              size="cta"
              onClick={() => {
                trackBookingClick('home_themes');
                window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
              }}
              className="w-full uppercase tracking-widest text-[10px] sm:text-xs md:w-auto"
            >
              <JpText>{site.home.themes.cta}</JpText>
            </Button>
          </div>

          <PopularThemesGrid
            items={showAllThemes ? orderedThemes : orderedThemes.slice(0, 6)}
            showAvailability
            compact
            className={`reveal-stagger ${themesReveal.isVisible ? 'visible' : ''}`}
          />
          {orderedThemes.length > 6 && <button type="button" aria-expanded={showAllThemes} onClick={() => setShowAllThemes(!showAllThemes)} className="mx-auto mt-6 block min-h-12 rounded-full border border-artbar-taupe px-6 py-3 font-bold focus-visible:outline-2 focus-visible:outline-artbar-navy">{showAllThemes ? (lang === 'jp' ? '表示を減らす' : 'Show fewer themes') : (lang === 'jp' ? 'すべてのテーマを見る' : 'Show all themes')}</button>}
        </div>
      </section>

      {/* Featured testimonials: quote cards on the page background — separation comes from spacing, not a band. */}
      <section className="relative z-[2] bg-artbar-bg px-4 pb-16 pt-2 md:px-10 md:pb-20 md:pt-4">
        <div
          ref={featuredTestimonialsReveal.ref}
          className={`mx-auto max-w-[1400px] reveal ${featuredTestimonialsReveal.isVisible ? 'visible' : ''}`}
        >
          <div
            className={`grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 reveal-stagger ${featuredTestimonialsReveal.isVisible ? 'visible' : ''}`}
          >
            {featuredTestimonials.map((item, index) => (
              <div
                key={index}
                className="relative flex h-full flex-col rounded-[var(--radius-card)] border border-white/60 bg-white p-8 shadow-[0_24px_70px_-28px_rgba(5,55,97,0.35)] transition-all duration-300 hover:shadow-[0_28px_80px_-24px_rgba(5,55,97,0.35)] md:rounded-[var(--radius-section)] md:p-10"
              >
                <div className="absolute right-6 top-6 text-artbar-taupe opacity-20 md:right-8 md:top-8" aria-hidden>
                  <Quote size={32} fill="currentColor" strokeWidth={0} />
                </div>
                <StarRating size={14} className="mb-6" />
                <p className="mb-8 flex-grow text-base font-light italic leading-relaxed text-artbar-navy md:text-lg">
                  &ldquo;<JpText>{item.text}</JpText>&rdquo;
                </p>
                <div className="mt-auto flex items-center gap-4">
                  {item.userImage ? (
                    <img
                      src={item.userImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-artbar-bg md:h-12 md:w-12"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-artbar-bg text-sm font-bold text-artbar-navy md:h-12 md:w-12 md:text-lg">
                      {item.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-artbar-navy md:text-sm">
                      <JpText>{item.author}</JpText>
                    </p>
                    {item.role && (
                      <p className="text-[9px] font-bold uppercase tracking-wider text-artbar-taupe md:text-xs"><JpText>{item.role}</JpText></p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concept Section - Refined for better balance */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 bg-artbar-bg overflow-hidden relative grain">
        <div ref={conceptReveal.ref} className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-[2]">
          <div className={`flex flex-col items-center text-center reveal ${conceptReveal.isVisible ? 'visible' : ''}`}>
            
            {/* Section heading — matches site section title scale */}
            <h2 className={`${theme.sectionTitle} font-heading font-heavy text-artbar-navy tracking-tight leading-tight whitespace-pre-line mb-10 md:mb-16 flex flex-col items-center max-w-4xl`}>
               <span className="text-artbar-taupe font-heading font-bold tracking-widest text-[10px] md:text-sm uppercase mb-3 md:mb-5 opacity-80">
                 <JpText>{site.home.concept.est}</JpText>
               </span>
               <JpText>{site.home.concept.title}</JpText>
            </h2>

            {/* Video / lifestyle — self-hosted MP4 (loop) + glass play → full video on YouTube */}
            <div
              ref={conceptVideoLazy.ref}
              className="group relative mb-16 md:mb-24 aspect-square md:aspect-video w-full max-w-[min(100%,42rem)] md:max-w-[min(100%,56rem)] overflow-hidden rounded-[var(--radius-feature)] shadow-2xl md:rounded-[var(--radius-feature)]"
            >
              {hasConceptVideo ? (
                <>
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={conceptDesktopPreload}
                    poster={content.images.concept.main}
                    src={conceptDesktopSrc}
                    className="hidden h-full w-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105 md:block"
                  />
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload={conceptMobilePreload}
                    poster={content.images.concept.main}
                    src={conceptMobileSrc}
                    className="h-full w-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105 md:hidden"
                  />
                </>
              ) : (
                <Image
                  src={content.images.concept.main}
                  alt={conceptImageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, min(56rem, 100vw)"
                  className="object-cover transition-transform duration-[4s] ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/40 via-transparent to-transparent pointer-events-none" />
              <a
                href={CONCEPT_BLOCK_YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute left-1/2 top-1/2 z-20 flex h-[4.25rem] w-[4.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-white/18 shadow-[0_8px_32px_-4px_rgba(5,55,97,0.35)] backdrop-blur-md transition-transform duration-200 hover:scale-105 hover:bg-white/28 hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:h-[5.5rem] md:w-[5.5rem]"
                aria-label={conceptVideoCta}
              >
                <Play
                  className="ml-1 h-9 w-9 text-white drop-shadow-md md:h-12 md:w-12"
                  fill="currentColor"
                  strokeWidth={0}
                  aria-hidden
                />
              </a>
            </div>

            {/* Bold Paragraph Copy - NORMAL SIZED */}
            <div className="max-w-4xl mx-auto space-y-12">
               <p className="text-artbar-navy text-lg md:text-2xl leading-relaxed md:leading-relaxed font-normal">
                 <JpText>{site.home.concept.p1}</JpText>
               </p>

               {/* Social Proof centered stats */}
               <div className="flex flex-col items-center gap-10 md:gap-12">
                  <div className="flex -space-x-5 md:-space-x-8">
                      {CONCEPT_SOCIAL_AVATAR_URLS.map((src) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          width={96}
                          height={96}
                          loading="lazy"
                          decoding="async"
                          className="h-14 w-14 shrink-0 rounded-full border-[3px] border-white object-cover shadow-xl md:h-24 md:w-24 md:border-[6px]"
                        />
                      ))}
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-artbar-navy px-0.5 text-white shadow-xl md:h-24 md:w-24 md:border-[6px]">
                        <span className="text-center font-heading text-[0.65rem] font-heavy tabular-nums leading-none md:text-lg">
                          <JpText>{formatGuestCountCompactK(lang)}</JpText>
                        </span>
                      </div>
                  </div>
                  <div className="text-center">
                     <p className="text-artbar-navy font-heading font-bold text-3xl md:text-5xl mb-4 md:mb-5 tabular-nums">
                       {enGuestConceptSplit ? (
                         <>
                           <span className="md:hidden"><JpText>{guestConceptLabel}</JpText></span>
                           <span className="hidden md:flex md:flex-col md:items-center md:gap-1">
                             <span><JpText>{enGuestConceptSplit.line1}</JpText></span>
                             <span><JpText>{enGuestConceptSplit.line2}</JpText></span>
                           </span>
                         </>
                       ) : (
                         <JpText>{guestConceptLabel}</JpText>
                       )}
                     </p>
                     <div className="mx-auto flex max-w-xl flex-col items-center gap-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-artbar-taupe md:text-base leading-snug">
                        {lang === 'en' ? (
                          <>
                            <span><JpText>{bilingualLine1}</JpText></span>
                            <span><JpText>{bilingualLine2}</JpText></span>
                          </>
                        ) : (
                          <>
                            <span className="normal-case tracking-normal"><JpText>{bilingualLine1}</JpText></span>
                            <span className="normal-case tracking-normal"><JpText>{bilingualLine2}</JpText></span>
                          </>
                        )}
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Private and company events are a primary business offering. */}
      <section id="group-events" aria-labelledby="group-events-title" className="relative z-[2] my-16 scroll-mt-20 bg-artbar-navy text-white md:my-24">
        <div className="mx-auto max-w-[1400px] px-6 py-16 sm:px-10 md:px-14 md:py-24 lg:px-20 lg:py-28">
          <div className="grid items-center gap-12 md:grid-cols-[1.05fr_1fr] md:gap-12 lg:gap-20">
            <div>
              <p className="mb-7 text-sm font-medium text-white/65 md:mb-9 md:text-base">
                {lang === 'jp' ? '貸切イベント・チームビルディング' : 'Private parties & company events'}
              </p>
              <h2 id="group-events-title" className="max-w-xl font-heading text-[clamp(2rem,4.5vw,4rem)] font-heavy leading-[1.2] tracking-tight text-white">
                <JpText>{lang === 'jp' ? 'チームで描く、忘れられない時間。' : 'Make something great. Together.'}</JpText>
              </h2>
              <p className="mt-7 max-w-md text-base leading-[1.9] text-white/75 md:mt-9 md:text-lg">
                <JpText>{lang === 'jp' ? '仲間と絵を描き、ドリンクを楽しむ貸切アート体験。東京・横浜で、人数やご予算に合うプランをご相談いただけます。' : 'Bring your people together for painting, drinks, and a shared experience. Plan a private event in Tokyo or Yokohama around your group and budget.'}</JpText>
              </p>
              <div className="mt-9 flex flex-col items-start gap-5 md:mt-11 md:gap-6">
                <a href={PRIVATE_PARTY_INQUIRY_URL} onClick={() => trackInquiryClick('private_party', 'home_group_events')} className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-white px-7 py-4 text-center font-heading text-base font-bold text-artbar-navy transition-colors hover:bg-artbar-bg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:w-auto">
                  <JpText>{lang === 'jp' ? '貸切イベントを相談する' : 'Plan a private event'}</JpText>
                </a>
                <a href={localizeHrefForLanguage('/team-building', lang)} className="inline-flex min-h-11 items-center gap-3 border-b border-white/35 py-2 font-heading text-sm font-bold text-white/85 transition-colors hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  <JpText>{bookTeamBuildingCta}</JpText><ArrowRight size={16} aria-hidden />
                </a>
              </div>
            </div>
            <div className="relative aspect-[3/2] overflow-hidden rounded-[1.5rem] md:aspect-[6/5] md:rounded-[2rem]">
              <Image
                src={mediaAssetUrl(media, 'home.groupEvents', GROUP_EVENT_IMAGE)}
                alt={lang === 'jp' ? 'Artbarのスタジオをもとにした企業グループのアート体験イメージ' : 'Illustration of a company group enjoying art in an Artbar-inspired studio'}
                fill sizes="(max-width: 767px) 100vw, 45vw" className="object-cover"
              />
            </div>
          </div>

          <div className="mt-16 border-t border-white/15 pt-10 md:mt-20 md:pt-12 lg:mt-24">
            <p className="mb-9 text-center text-sm leading-relaxed text-white/55 md:mb-12">
              {lang === 'jp' ? '企業イベントでも選ばれています' : 'Companies who have joined Artbar events'}
            </p>
            <div className="group-event-logos mx-auto grid max-w-6xl grid-cols-2 items-center gap-x-10 gap-y-7 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-9 lg:grid-cols-7 lg:gap-x-10 lg:gap-y-10">
              {PARTNER_LOGOS.map((logo) => (
                <div key={logo.name} className="min-w-0">
                  <PartnerLogo {...logo} size="compact" tone="reverse" scaleBoost={PARTNER_LOGO_SCALE_BOOSTS[logo.name]} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

       {/* How it works — one numbered, photo-led flow. The old icon-card grid and the
           "experience" photo grid repeated each other (drinks, all-inclusive, guidance);
           each fact now lives inside its step and real photos replace the icon chips.
           On desktop, alternate steps sit lower, like canvases leaning at different
           heights along a studio ledge. */}
       <section className="py-14 md:py-20 bg-white mx-4 md:mx-6 rounded-[var(--radius-section)] md:rounded-[var(--radius-feature)]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10">
          <div ref={howItWorksReveal.ref}>
            <div className={`text-center mb-10 md:mb-14 reveal ${howItWorksReveal.isVisible ? 'visible' : ''}`}>
               <h2 className={`${theme.sectionTitle} font-heading font-heavy text-artbar-navy mb-5`}><JpText>{site.home.howItWorks.title}</JpText></h2>
               <p className={`${theme.bodyLarge} text-artbar-gray max-w-2xl mx-auto`}>
                 <JpText>{site.home.howItWorks.subtitle}</JpText>
               </p>
            </div>

            <ol className={`grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-6 xl:gap-8 reveal-stagger ${howItWorksReveal.isVisible ? 'visible' : ''}`}>
              {site.home.howItWorks.steps.map((step, index) => (
                <li key={index} className="group md:block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-card)] shadow-sm lg:aspect-[4/5]">
                    <Image
                      src={HOW_IT_WORKS_IMAGES[index] ?? HOW_IT_WORKS_IMAGES[0]}
                      alt=""
                      fill
                      sizes="(max-width: 768px) calc(100vw - 4rem), (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      aria-hidden
                      className="absolute left-4 top-4 hidden h-10 w-10 items-center justify-center rounded-full bg-white/95 pt-0.5 font-heading text-lg font-bold leading-none text-artbar-navy shadow-sm ring-1 ring-artbar-navy/10 md:flex"
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div className="mt-5 flex items-start gap-3 md:block">
                    <span
                      aria-hidden
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-artbar-bg pt-0.5 font-heading text-sm font-bold leading-none text-artbar-navy ring-1 ring-artbar-navy/10 md:hidden"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className={`${theme.cardTitle} font-heading font-bold mb-1.5 text-artbar-navy text-lg md:mb-2.5 md:text-xl`}><JpText>{step.title}</JpText></h3>
                      <p className={`${theme.body} text-artbar-gray leading-relaxed text-sm`}>
                        <JpText>{step.desc}</JpText>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Guest reviews — dense wall of short quotes; the depth of proof, not one quote in a void */}
      <section className="relative z-[2] bg-artbar-bg px-6 py-14 md:px-10 md:py-20">
        <div ref={carouselTestimonialsReveal.ref} className="mx-auto max-w-[1400px]">
          <div className={`mb-8 flex flex-col items-start justify-between gap-3 md:mb-10 md:flex-row md:items-end reveal ${carouselTestimonialsReveal.isVisible ? 'visible' : ''}`}>
            <h2 className={`font-heading font-heavy leading-none tracking-tight text-artbar-navy ${theme.sectionTitle}`}>
              <JpText>{site.home.testimonials.title}</JpText>
            </h2>
            <div className="flex items-center gap-2.5 md:gap-3">
              <StarRating size={16} className="text-amber-400 md:[&>svg]:h-5 md:[&>svg]:w-5" />
              <span className="font-heading text-xl font-heavy tabular-nums leading-none text-artbar-navy md:text-2xl">
                {site.home.hero.ratingScore}
              </span>
              <span className="text-xs text-artbar-gray md:text-sm"><JpText>{site.home.hero.ratingSource}</JpText></span>
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5 reveal-stagger ${carouselTestimonialsReveal.isVisible ? 'visible' : ''}`}>
            {reviewWall.map((item, i) => (
              <figure
                key={`${item.author}-${i}`}
                className={`h-full flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[0_16px_50px_-24px_rgba(5,55,97,0.25)] md:p-7 ${i >= 4 ? 'hidden sm:flex' : 'flex'}`}
              >
                <StarRating size={12} className="mb-3" />
                <blockquote className="flex-grow text-pretty text-sm leading-relaxed text-artbar-navy md:text-base">
                  &ldquo;<JpText>{item.text}</JpText>&rdquo;
                </blockquote>
                <figcaption className="mt-4 flex items-center justify-between gap-3">
                  <span className="font-heading text-[10px] font-bold uppercase tracking-wide text-artbar-navy md:text-xs">
                    <JpText>{item.author}</JpText>
                  </span>
                  {item.date ? (
                    <span className="text-[10px] uppercase tracking-wider text-artbar-taupe md:text-xs"><JpText>{item.date}</JpText></span>
                  ) : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Media coverage — full-card marquee (moved home from the retired /press page).
          Auto-scrolls continuously so it's already in motion when scrolled into view;
          pauses on hover. See .press-marquee in globals.css for the seamless loop. */}
      <section id="media" className="scroll-mt-28 bg-white py-14 md:scroll-mt-32 md:py-20">
        <div ref={asSeenInReveal.ref} className="mx-auto max-w-[1400px] px-6 md:px-10">
          <div className={`text-center mb-8 md:mb-12 reveal ${asSeenInReveal.isVisible ? 'visible' : ''}`}>
            <h2 className={`mb-4 font-heading font-heavy tracking-tight text-artbar-navy ${theme.sectionTitle}`}>
              <JpText>{site.pressPage.title}</JpText>
            </h2>
            <p className={`${theme.bodyLarge} mx-auto max-w-3xl text-artbar-gray`}>
              <JpText>{site.pressPage.subtitle}</JpText>
            </p>
          </div>

          <div className={`reveal ${asSeenInReveal.isVisible ? 'visible' : ''}`}>
            {/* Auto-scrolling marquee: two copies of the list drift left seamlessly,
                pausing on hover so a card can be inspected. Reduced motion falls back
                to a manually scrollable rail (see .press-marquee in globals.css). */}
            <div className="press-marquee relative overflow-hidden">
              <div className="press-marquee-track flex w-max gap-6 px-2 py-6">
              {[...content.media, ...content.media].map((item, idx) => (
                <div
                  key={idx}
                  aria-hidden={idx >= content.media.length}
                  className="group/card relative h-[400px] w-[280px] flex-shrink-0 overflow-hidden rounded-[2rem] bg-gray-200 shadow-lg ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-2"
                >
                  {item.fit === 'contain' ? (
                    <>
                      {/* Wide still: blurred copy fills the portrait frame behind... */}
                      <img
                        src={item.image || item.logo}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl brightness-[0.7] saturate-150"
                      />
                      {/* ...the full uncropped image sits on top, centered. */}
                      <img
                        src={item.image || item.logo}
                        alt={stripJpSentinel(item.outlet)}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    </>
                  ) : (
                    <img
                      src={item.image || item.logo}
                      alt={stripJpSentinel(item.outlet)}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/90 via-artbar-navy/20 to-transparent"></div>

                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <div className="absolute left-6 top-6 flex h-12 max-w-[120px] items-center justify-center rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur-md">
                      {item.logo ? (
                        <img
                          src={item.logo}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-auto object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold uppercase tracking-wider text-artbar-navy">{item.outlet.split(' ')[0]}</span>
                      )}
                    </div>

                    <div>
                      <h3 className="mb-2 font-heading text-2xl font-bold leading-tight drop-shadow-sm"><JpText>{item.outlet}</JpText></h3>
                      <p className="inline-block rounded border border-white/20 bg-artbar-navy/50 px-2 py-1 text-xs font-semibold uppercase tracking-[0.15em] opacity-90 backdrop-blur-sm">
                        {item.type}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-14 md:py-24 px-4 md:px-6">
        <div ref={bottomCtaReveal.ref} className="max-w-[1400px] mx-auto">
        <div className={`bg-artbar-navy rounded-[var(--radius-section)] md:rounded-[var(--radius-feature)] overflow-hidden relative shadow-2xl reveal ${bottomCtaReveal.isVisible ? 'visible' : ''}`}>
           <img 
              src={content.images.cta || "https://picsum.photos/seed/artbarcta/1920/600"} 
              alt={ctaImageAlt} 
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
           />
           <div className="absolute inset-0 bg-gradient-to-r from-artbar-navy/95 via-artbar-navy/80 to-artbar-navy/40"></div>
           
           <div className="relative z-10 px-8 py-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-12 text-center md:text-left">
              <div className="max-w-2xl">
                 <span className="text-artbar-taupe font-heading font-bold tracking-widest text-[10px] md:text-sm uppercase mb-4 block"><JpText>{site.home.cta.badge}</JpText></span>
                 <h2 className={`${theme.sectionTitle} font-heading font-heavy text-white mb-6 leading-tight text-balance`}>
                   <JpText>{site.home.cta.title}</JpText>
                 </h2>
                 <p className="text-base md:text-xl text-artbar-light-taupe/90 font-light max-w-lg leading-relaxed">
                   <JpText>{site.home.cta.subtitle}</JpText>
                 </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
                 <Button
                   variant="taupe"
                   size="cta"
                   onClick={() => {
                     trackBookingClick('home_bottom');
                     window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
                   }}
                   className="w-full min-w-0 whitespace-nowrap shadow-xl sm:w-auto sm:min-w-[12.5rem]"
                 >
                   {/* Sentinels stripped: JpText's <wbr> breaks even inside whitespace-nowrap */}
                   {stripJpSentinel(site.home.cta.btnBook)}
                 </Button>
                 <Button
                   onClick={() => router.push(localizeHrefForLanguage('/contact', lang))}
                   variant="outlineWhite"
                   size="cta"
                   className="w-full whitespace-nowrap sm:w-auto sm:min-w-[12.5rem]"
                 >
                   {stripJpSentinel(site.home.cta.btnContact)}
                 </Button>
              </div>
           </div>
        </div>
        </div>
      </section>

      {/* Prefetch hero images for key pages so navigation feels instant */}
      <PrefetchHeroes
        srcs={[
          content.images.hero.teamBuilding,
          ...(site.privateParties?.occasions?.[0]?.image ? [site.privateParties.occasions[0].image] : []),
        ].filter(Boolean) as string[]}
      />
    </div>
  );
};
