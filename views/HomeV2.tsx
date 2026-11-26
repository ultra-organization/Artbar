'use client';

/**
 * Home page design upgrade (concept, Nov 2026).
 *
 * Same content, same section order and the same tracked conversion actions as
 * `views/Home.tsx` (Humble Bunny CRO order: hero → first-visit facts → live
 * sessions → seasonal → themes → proof → group events → how it works →
 * reviews → media → closing CTA). Only the visual language changes:
 *
 * - Full-bleed bands instead of floating rounded cards.
 * - Popular themes hang as a salon wall on navy, so the paintings bring the colour.
 * - Zen Kaku Gothic New for Japanese display type (`.v2-display`), Josefin for Latin.
 */

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, Clock, MapPin, PackageCheck, Palette, Play } from 'lucide-react';
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
  getArtbarBookingThemeUrl,
} from '../constants';
import { mediaAssetUrl } from '../lib/media/resolve';
import { themeSlugFromItem } from '../lib/theme-slugs';
import { trackBookingClick, trackInquiryClick, type BookingClickLocation } from '../lib/analytics';
import { PartnerLogo } from '../components/PartnerLogo';
import {
  formatGuestConceptLabel,
  formatGuestCountCompactK,
  formatGuestCountDisplay,
} from '../lib/guest-count';
import { useMediaMinMd } from '../hooks/useMediaMinMd';
import { useNearViewport } from '../hooks/useNearViewport';
import { GI } from '../data/generated-image-paths';
import { PrefetchHeroes } from '../components/PrefetchHeroes';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { HomeYearEndFeature } from '../components/YearEndPartySection';
import { HolidayLights } from '../components/HolidayDecor';
import { HolidayGiftBanner } from '../components/HolidayGiftBanner';
import { useHolidayTheme } from '../lib/holiday-season';

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

/** Salon-wall hang. Six tiles fill three rows of four columns exactly, so the
 *  pattern repeats cleanly when all twelve themes are shown. */
const WALL_SPANS = [
  'col-span-2 row-span-2',
  'col-span-1 row-span-1',
  'col-span-1 row-span-2',
  'col-span-1 row-span-1',
  'col-span-2 row-span-1',
  'col-span-2 row-span-1',
] as const;

const cleanForAttr = (s: string) => stripJpSentinel(s.replace(/<wbr\s*\/?>/gi, ''));

export const HomeV2: React.FC = () => {
  const { content, site, lang, localizedCopy, media } = useContent();
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const holiday = useHolidayTheme();
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

  const scrollToPopularThemes = () => {
    document.getElementById('popular-themes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const goBook = (source: BookingClickLocation) => {
    trackBookingClick(source);
    window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
  };

  // ── Hero media (same resolution rules as Home.tsx) ──────────────────────
  const heroImages = content.images.hero as { home: string; homeMobile?: string; video?: string; videoMobile?: string };
  const heroVideoDesktop = (heroImages.video ?? '').trim();
  const heroVideoMobile = (heroImages.videoMobile ?? '').trim() || heroVideoDesktop;
  const hasConceptVideo = Boolean(heroVideoDesktop || heroImages.videoMobile?.trim());
  const encMediaSrc = (path: string) => (path.includes(' ') ? encodeURI(path) : path);
  const isVideoMedia = (path: string) => /\.(mp4|webm|mov|m4v)(\?|$)/i.test(path);
  const usableHeroMedia = (path: string) => path && !path.includes('toolandtea.com');

  const rawHeroHome = (heroImages.home ?? '').trim();
  const heroBgDesktopSrc = usableHeroMedia(rawHeroHome) ? rawHeroHome : SITE_IMAGES.hero.home;
  const heroBgDesktopIsVideo = isVideoMedia(heroBgDesktopSrc);
  const rawHeroHomeMobile = (heroImages.homeMobile ?? '').trim();
  const heroBgMobileSrc = usableHeroMedia(rawHeroHomeMobile)
    ? rawHeroHomeMobile
    : SITE_IMAGES.hero.homeMobile ?? heroBgDesktopSrc;
  const heroBgMobileIsVideo = isVideoMedia(heroBgMobileSrc);

  const heroDesktopSrc = hasMounted && mdUp ? encMediaSrc(heroBgDesktopSrc) : undefined;
  const heroMobileSrc = hasMounted && !mdUp ? encMediaSrc(heroBgMobileSrc) : undefined;
  const conceptVideoUrl = encMediaSrc(
    mdUp ? heroVideoDesktop || heroVideoMobile : heroVideoMobile || heroVideoDesktop,
  );
  const conceptSrc = hasMounted && conceptVideoLazy.near ? conceptVideoUrl : undefined;

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const carouselTestimonials = site.home.testimonials.carousel;
  const featuredTestimonials = site.home.testimonials.featured;
  const featuredAuthors = new Set(featuredTestimonials.map((t) => t.author));
  const reviewWall = carouselTestimonials
    .filter((t) => !featuredAuthors.has(t.author) && t.text.length <= 120)
    .slice(0, 6);

  const homeUiCopy = localizedCopy.ui.home;
  const heroCopy = site.home.hero;

  const quickInfo = jp
    ? {
        eyebrow: 'はじめての方へ',
        title: 'すべて込みの、気軽なアート体験。',
        priceLabel: '料金',
        priceValue: '¥4,620',
        priceSuffix: '〜',
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
        priceValue: '¥4,620',
        priceSuffix: '+',
        priceNote: 'free-flow drinks, snacks & materials included',
        items: [
          { icon: Clock, label: 'Duration', value: 'Around 2 hours' },
          { icon: MapPin, label: 'Studios', value: 'Daikanyama, Harajuku, Ginza, Yokohama' },
          { icon: Palette, label: 'Who it’s for', value: 'Beginners welcome, nothing to bring' },
          { icon: PackageCheck, label: 'Take-home', value: 'Most artwork goes home with you the same day' },
        ],
      };
  const upcomingSessions = jp
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
  const embedLocale = jp ? 'ja' : 'en';
  const upcomingFromDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(
    new Date(Date.now() + 2 * 86_400_000),
  );

  const sectionTitle = 'v2-display font-heavy text-[clamp(2rem,4.6vw,4rem)] leading-[1.12] tracking-[-0.01em]';
  const ctaPill =
    'inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-8 font-heading text-base font-bold leading-none transition duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 md:min-h-16 md:px-10 md:text-lg';

  const [leadQuote, ...sideQuotes] = featuredTestimonials;

  return (
    <div className="home-v2 w-full overflow-x-clip bg-artbar-bg text-artbar-navy">
      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[100svh] w-full items-end overflow-hidden bg-artbar-navy">
        <div className="absolute inset-0 -z-10">
          {heroBgDesktopIsVideo ? (
            <video
              autoPlay muted loop playsInline
              preload={mdUp ? 'auto' : 'none'}
              src={heroDesktopSrc}
              className="absolute inset-0 hidden h-full w-full object-cover object-[center_30%] md:block"
              aria-hidden
            />
          ) : (
            <Image src={heroBgDesktopSrc} alt="" fill sizes="100vw" priority className="hidden object-cover md:block" />
          )}
          {heroBgMobileIsVideo ? (
            <video
              autoPlay muted loop playsInline
              preload={mdUp ? 'none' : 'auto'}
              src={heroMobileSrc}
              className="absolute inset-0 h-full w-full object-cover md:hidden"
              aria-hidden
            />
          ) : (
            <Image src={heroBgMobileSrc} alt="" fill sizes="100vw" priority className="object-cover md:hidden" />
          )}
          {/* Legibility: navy rises from the bottom-left where the copy sits. */}
          <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy via-artbar-navy/55 via-45% to-artbar-navy/10" aria-hidden />
          <div className="absolute inset-0 hidden bg-gradient-to-r from-artbar-navy/70 via-artbar-navy/20 to-transparent md:block" aria-hidden />
        </div>
        {holiday && <HolidayLights />}

        <div className="relative mx-auto w-full max-w-[1480px] px-5 pb-10 pt-32 sm:px-8 md:px-12 md:pb-16 lg:px-16">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-[68rem]">
              <p className="v2-rise mb-6 inline-flex items-center gap-3 text-sm font-bold text-white/80 md:mb-8 md:text-base">
                <span className="h-px w-10 bg-artbar-taupe" aria-hidden />
                <JpText>{heroCopy.badge}</JpText>
              </p>
              <h1 className="v2-display v2-rise font-heavy text-white [animation-delay:80ms]">
                <span className={`block leading-[1.06] tracking-[-0.02em] ${jp ? 'whitespace-nowrap text-[clamp(1.9rem,7.6vw,5.6rem)]' : 'text-[clamp(2.6rem,8vw,6.5rem)]'}`}>
                  {stripJpSentinel(heroCopy.title)}
                </span>
                <span className={`block leading-[1.06] tracking-[-0.02em] text-artbar-light-taupe ${jp ? 'whitespace-nowrap text-[clamp(1.9rem,7.6vw,5.6rem)]' : 'text-[clamp(2.6rem,8vw,6.5rem)]'}`}>
                  {stripJpSentinel(heroCopy.titleHighlight)}
                </span>
              </h1>
              <p className="v2-rise mt-6 max-w-xl text-base leading-[1.9] text-white/80 [animation-delay:160ms] md:mt-8 md:text-xl">
                <JpText>{heroCopy.subtitle.replace(/<wbr\s*\/?>/gi, '')}</JpText>
              </p>
              <div className="v2-rise mt-8 flex flex-col items-stretch gap-3 [animation-delay:240ms] sm:flex-row sm:items-center sm:gap-6 md:mt-10">
                <button
                  type="button"
                  onClick={() => goBook('home_hero')}
                  className={`${ctaPill} bg-artbar-taupe text-artbar-navy shadow-[0_18px_40px_-18px_rgba(163,147,132,0.9)] hover:bg-[#b3a496] focus-visible:outline-white`}
                >
                  <JpText>{heroCopy.ctaSchedule}</JpText>
                  <ArrowRight size={18} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={scrollToPopularThemes}
                  className="inline-flex min-h-12 items-center justify-center gap-2 font-heading text-base font-bold text-white underline decoration-white/40 decoration-1 underline-offset-[10px] transition hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:text-lg"
                >
                  <JpText>{site.home.hero.ctaFindPainting}</JpText>
                </button>
              </div>
            </div>

            {/* Proof, set like a gallery caption in the corner */}
            <div className="v2-rise flex items-center gap-5 border-t border-white/20 pt-5 text-white [animation-delay:320ms] lg:flex-col lg:items-end lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0 lg:text-right">
              <div className="flex items-center gap-3">
                <span className="whitespace-nowrap font-heading text-5xl font-bold leading-none tabular-nums md:text-7xl">{heroCopy.ratingScore}</span>
                <StarRating size={16} className="md:[&>svg]:h-5 md:[&>svg]:w-5" />
              </div>
              <p className="max-w-[15rem] text-sm leading-snug text-white/75 md:text-base">
                <JpText>
                  {jp
                    ? heroCopy.guestsSuffix.replace(/\{\{count\}\}/g, guestCountFormatted)
                    : `${guestCountFormatted}+ ${heroCopy.guestsSuffix}`}
                </JpText>
              </p>
            </div>
          </div>
        </div>
      </section>

      {holiday && <HolidayGiftBanner />}

      {/* ── 2. First-visit facts (HB 4-2) ───────────────────────────────── */}
      <section className="px-5 pb-6 pt-16 sm:px-8 md:px-12 md:pt-24 lg:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid gap-10 border-b border-artbar-navy/15 pb-10 md:pb-14 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
            <div>
              <p className="mb-4 text-sm font-bold text-artbar-taupe md:text-base"><JpText>{quickInfo.eyebrow}</JpText></p>
              <h2 className={sectionTitle}><JpText>{quickInfo.title}</JpText></h2>
              <p className="mt-5 max-w-xl text-base leading-[1.9] text-artbar-gray md:text-lg"><JpText>{site.home.experienceIntro}</JpText></p>
            </div>
            <div className="lg:text-right">
              <p className="text-sm font-bold text-artbar-navy/60"><JpText>{quickInfo.priceLabel}</JpText></p>
              <p className="font-heading font-bold leading-[0.9] tracking-[-0.03em] tabular-nums">
                <span className="text-[clamp(4.5rem,13vw,10rem)]">{quickInfo.priceValue}</span>
                <span className="text-[clamp(2rem,5vw,4rem)] text-artbar-taupe">{quickInfo.priceSuffix}</span>
              </p>
              <p className="mt-2 text-sm text-artbar-gray md:text-base"><JpText>{quickInfo.priceNote}</JpText></p>
            </div>
          </div>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {quickInfo.items.map(({ icon: Icon, label, value }, i) => (
              <div
                key={label}
                className={`flex flex-col gap-3 border-artbar-navy/15 py-7 md:py-9 ${i % 2 === 1 ? 'border-l pl-5 md:pl-8' : 'pr-5'} ${i >= 2 ? 'border-t lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l lg:pl-8' : ''} ${i === 3 ? 'lg:pl-8' : ''}`}
              >
                <dt className="flex items-center gap-2 text-sm font-bold text-artbar-navy/60">
                  <Icon size={18} strokeWidth={1.75} className="text-artbar-taupe" aria-hidden />
                  <JpText>{label}</JpText>
                </dt>
                <dd className="v2-display text-lg font-bold leading-snug md:text-2xl"><JpText>{value}</JpText></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 3. Live sessions (HB 4-3) — same Painta embeds as Home ──────── */}
      <section id="upcoming-sessions" className="scroll-mt-28 pb-8 pt-12 md:scroll-mt-32 md:pb-12 md:pt-16">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-end">
            <div>
              <h2 className={sectionTitle}><JpText>{upcomingSessions.title}</JpText></h2>
              <p className="mt-3 text-base text-artbar-gray md:text-lg"><JpText>{upcomingSessions.subtitle}</JpText></p>
            </div>
            <button
              type="button"
              onClick={() => goBook('home_today_tomorrow')}
              className="inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-artbar-navy px-6 font-heading text-sm font-bold transition hover:bg-artbar-navy hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy md:self-auto md:text-base"
            >
              <JpText>{upcomingSessions.allLink}</JpText>
              <ArrowRight size={16} aria-hidden />
            </button>
          </div>
          <div className="-mx-4 sm:-mx-6 md:-mx-10">
            <iframe
              data-painta-embed
              src={`${PAINTA_EMBED_ORIGIN}/embed/artbar-tokyo/today-tomorrow?locale=${embedLocale}&cta=hide&background=transparent&limit=24`}
              title={stripJpSentinel(upcomingSessions.iframeTitle)}
              loading="lazy"
              className="block h-[800px] w-full border-0 sm:h-[520px]"
            />
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
        <Script src={`${PAINTA_EMBED_ORIGIN}/embed.js`} strategy="afterInteractive" />
      </section>

      {/* ── 4. Seasonal: year-end parties (unchanged component) ─────────── */}
      <HomeYearEndFeature />

      {/* ── 5. Popular themes: the salon wall ───────────────────────────── */}
      <section id="popular-themes" className="v2-wall scroll-mt-20 bg-artbar-navy py-20 text-white md:py-28">
        <div className="mx-auto max-w-[1480px] px-5 sm:px-8 md:px-12 lg:px-16">
          <div className="mb-12 grid gap-6 md:mb-16 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className={`${sectionTitle} text-white`}><JpText>{site.home.themes.title}</JpText></h2>
              <p className="mt-4 max-w-xl text-base leading-[1.9] text-white/70 md:text-lg"><JpText>{site.home.themes.subtitle}</JpText></p>
            </div>
            <button
              type="button"
              onClick={() => goBook('home_themes')}
              className={`${ctaPill} self-start bg-artbar-taupe text-artbar-navy hover:bg-[#b3a496] focus-visible:outline-white`}
            >
              <JpText>{site.home.themes.cta}</JpText>
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>

          <div className="grid grid-flow-row-dense auto-rows-[150px] grid-cols-2 gap-x-4 gap-y-[6.5rem] sm:gap-y-20 sm:auto-rows-[200px] md:gap-x-8 md:gap-y-24 lg:auto-rows-[230px] lg:grid-cols-4">
            {visibleThemes.map((item, index) => {
              const slug = themeSlugFromItem(item);
              const title = cleanForAttr(item.title);
              return (
                <article key={slug} className={`group relative ${WALL_SPANS[index % WALL_SPANS.length]}`}>
                  <Link
                    href={localizeHrefForLanguage(`/themes/${slug}`, lang)}
                    className="v2-frame relative block h-full w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <span className="relative block h-full w-full overflow-hidden">
                      <Image
                        src={item.image}
                        alt={title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </span>
                  </Link>
                  {/* Gallery caption under the canvas: what it is, plus the booking shortcut */}
                  <div className="absolute left-0 right-0 top-full z-10 flex flex-col items-start gap-2 pt-3 sm:flex-row sm:justify-between sm:gap-3 md:pt-4">
                    <div className="min-w-0">
                      <h3 className="v2-display text-sm font-bold leading-tight text-white md:text-lg"><JpText>{item.title}</JpText></h3>
                      <p className="mt-1 hidden text-xs leading-snug text-white/60 md:line-clamp-1 md:text-sm"><JpText>{item.desc}</JpText></p>
                    </div>
                    <a
                      href={getArtbarBookingThemeUrl(slug)}
                      onClick={() => trackBookingClick('home_themes', { theme: slug })}
                      aria-label={`${title}: ${jp ? '空き日程を見る' : 'View dates'}`}
                      className="inline-flex min-h-9 shrink-0 items-center rounded-full bg-artbar-taupe px-3 text-xs font-bold text-artbar-navy transition hover:bg-[#b3a496] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:min-h-10 md:px-4 md:text-sm"
                    >
                      {jp ? '空き日程を見る' : 'View dates'}
                    </a>
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
              className="mx-auto mt-20 flex min-h-12 items-center rounded-full border border-white/40 px-7 font-heading font-bold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {showAllThemes ? (jp ? '表示を減らす' : 'Show fewer themes') : jp ? 'すべてのテーマを見る' : 'Show all themes'}
            </button>
          )}
        </div>
      </section>

      {/* ── 6. Featured testimonials: one voice large, two beside it ────── */}
      {leadQuote && (
        <section className="px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
          <div className="mx-auto grid max-w-[1480px] gap-14 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
            <figure>
              <span className="block font-serif text-[6rem] leading-[0.7] text-artbar-taupe md:text-[8rem]" aria-hidden>“</span>
              <blockquote className="v2-display mt-2 text-[clamp(1.6rem,3.4vw,3rem)] font-bold leading-[1.45]">
                <JpText>{leadQuote.text}</JpText>
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                {leadQuote.userImage ? (
                  <img src={leadQuote.userImage} alt="" loading="lazy" className="h-12 w-12 rounded-full object-cover" />
                ) : null}
                <div>
                  <p className="font-heading text-base font-bold"><JpText>{leadQuote.author}</JpText></p>
                  {leadQuote.role && <p className="text-sm text-artbar-taupe"><JpText>{leadQuote.role}</JpText></p>}
                </div>
                <StarRating size={14} className="ml-auto" />
              </figcaption>
            </figure>
            <div className="flex flex-col justify-end gap-10">
              {sideQuotes.map((item, i) => (
                <figure key={i} className="border-t border-artbar-navy/15 pt-7">
                  <StarRating size={12} className="mb-4" />
                  <blockquote className="text-lg leading-[1.8] md:text-xl">
                    <JpText>{item.text}</JpText>
                  </blockquote>
                  <figcaption className="mt-4 font-heading text-sm font-bold">
                    <JpText>{item.author}</JpText>
                    {item.role && <span className="ml-2 font-normal text-artbar-taupe"><JpText>{item.role}</JpText></span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. Concept: video beside the story ──────────────────────────── */}
      <section className="bg-[#E8E3DC] px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
        <div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div ref={conceptVideoLazy.ref} className="group relative aspect-[4/5] w-full overflow-hidden rounded-[2px] sm:aspect-[4/3] lg:aspect-[4/5]">
            {hasConceptVideo ? (
              <video
                autoPlay muted loop playsInline
                preload={conceptVideoLazy.near ? 'auto' : 'none'}
                poster={content.images.concept.main}
                src={conceptSrc}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image src={content.images.concept.main} alt={stripJpSentinel(homeUiCopy.conceptImageAlt)} fill sizes="50vw" className="object-cover" />
            )}
            <a
              href={CONCEPT_BLOCK_YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={stripJpSentinel(homeUiCopy.conceptVideoCta)}
              className="absolute bottom-5 left-5 inline-flex min-h-12 items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 font-heading text-sm font-bold text-artbar-navy shadow-lg transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:bottom-7 md:left-7"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-artbar-navy text-white">
                <Play size={16} fill="currentColor" strokeWidth={0} className="ml-0.5" aria-hidden />
              </span>
              <JpText>{stripJpSentinel(homeUiCopy.conceptVideoCta)}</JpText>
            </a>
          </div>
          <div>
            <p className="mb-6 font-heading text-sm font-bold text-artbar-taupe md:text-base"><JpText>{site.home.concept.est}</JpText></p>
            <h2 className={`${sectionTitle} whitespace-pre-line`}><JpText>{site.home.concept.title}</JpText></h2>
            <p className="mt-7 max-w-lg text-lg leading-[1.9] md:text-xl"><JpText>{site.home.concept.p1}</JpText></p>
            <div className="mt-12 flex flex-col items-start gap-5 border-t border-artbar-navy/15 pt-8">
              <div className="flex shrink-0 -space-x-3">
                {CONCEPT_SOCIAL_AVATAR_URLS.slice(0, 5).map((src) => (
                  <img key={src} src={src} alt="" width={56} height={56} loading="lazy" className="h-11 w-11 rounded-full border-2 border-[#E8E3DC] object-cover md:h-14 md:w-14" />
                ))}
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#E8E3DC] bg-artbar-navy font-heading text-[0.7rem] font-bold text-white md:h-14 md:w-14 md:text-sm">
                  <JpText>{formatGuestCountCompactK(lang)}</JpText>
                </span>
              </div>
              <p className="v2-display text-lg font-bold leading-snug md:text-2xl"><JpText>{guestConceptLabel}</JpText></p>
            </div>
            <p className="mt-4 text-sm text-artbar-gray md:text-base">
              <JpText>{homeUiCopy.bilingualLine1}</JpText> <JpText>{homeUiCopy.bilingualLine2}</JpText>
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. Group events + partner wall ──────────────────────────────── */}
      <section id="group-events" aria-labelledby="group-events-title" className="scroll-mt-20 bg-artbar-navy text-white">
        <div className="grid lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:order-2 lg:aspect-auto lg:min-h-[640px]">
            <Image
              src={mediaAssetUrl(media, 'home.groupEvents', GROUP_EVENT_IMAGE)}
              alt={jp ? 'Artbarのスタジオでキャンバスを掲げて楽しむ参加者たち' : 'Guests holding up their canvases during an Artbar group session'}
              fill sizes="(max-width: 1023px) 100vw, 50vw" className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-5 py-16 sm:px-8 md:px-12 md:py-24 lg:px-16 xl:pl-[max(4rem,calc((100vw-1480px)/2+4rem))]">
            <p className="mb-6 text-sm font-bold text-artbar-taupe md:text-base">
              {jp ? '貸切イベント・チームビルディング' : 'Private parties & company events'}
            </p>
            <h2 id="group-events-title" className={`${sectionTitle} max-w-xl text-white`}>
              <JpText>{jp ? 'チームで描く、忘れられない時間。' : 'Make something great. Together.'}</JpText>
            </h2>
            <p className="mt-7 max-w-md text-base leading-[1.9] text-white/75 md:text-lg">
              <JpText>{jp ? '仲間と絵を描き、ドリンクを楽しむ貸切アート体験。東京・横浜で、人数やご予算に合うプランをご相談いただけます。' : 'Bring your people together for painting, drinks, and a shared experience. Plan a private event in Tokyo or Yokohama around your group and budget.'}</JpText>
            </p>
            <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
              <a
                href={PRIVATE_PARTY_INQUIRY_URL}
                onClick={() => trackInquiryClick('private_party', 'home_group_events')}
                className={`${ctaPill} w-full bg-white text-artbar-navy hover:bg-artbar-bg focus-visible:outline-white sm:w-auto`}
              >
                <JpText>{jp ? '貸切イベントを相談する' : 'Plan a private event'}</JpText>
              </a>
              <a
                href={localizeHrefForLanguage('/team-building', lang)}
                className="inline-flex min-h-12 items-center gap-2 font-heading text-base font-bold text-white underline decoration-white/40 underline-offset-[10px] hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <JpText>{homeUiCopy.bookTeamBuildingCta}</JpText>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/15 px-5 py-14 sm:px-8 md:px-12 md:py-16 lg:px-16">
          <p className="mb-10 text-center text-sm text-white/60">
            {jp ? '企業イベントでも選ばれています' : 'Companies who have joined Artbar events'}
          </p>
          <div className="group-event-logos mx-auto grid max-w-6xl grid-cols-2 items-center gap-x-10 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
            {PARTNER_LOGOS.map((logo) => (
              <div key={logo.name} className="min-w-0">
                <PartnerLogo {...logo} size="compact" tone="reverse" scaleBoost={PARTNER_LOGO_SCALE_BOOSTS[logo.name]} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. How it works: four canvases along a ledge ────────────────── */}
      <section className="px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-14 grid gap-5 md:mb-20 lg:grid-cols-[1fr_1fr] lg:items-end">
            <h2 className={sectionTitle}><JpText>{site.home.howItWorks.title}</JpText></h2>
            <p className="max-w-xl text-base leading-[1.9] text-artbar-gray md:text-lg"><JpText>{site.home.howItWorks.subtitle}</JpText></p>
          </div>
          <ol className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-8">
            {site.home.howItWorks.steps.map((step, index) => (
              <li key={index} className={index % 2 === 1 ? 'lg:mt-20' : ''}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-[2px]">
                  <Image
                    src={HOW_IT_WORKS_IMAGES[index] ?? HOW_IT_WORKS_IMAGES[0]}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-5 flex items-baseline gap-4">
                  <span className="font-heading text-5xl font-bold leading-none text-artbar-taupe md:text-6xl" aria-hidden>{index + 1}</span>
                  <div>
                    <h3 className="v2-display text-xl font-bold md:text-2xl"><JpText>{step.title}</JpText></h3>
                    <p className="mt-2 text-sm leading-[1.85] text-artbar-gray md:text-base"><JpText>{step.desc}</JpText></p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 10. Review wall: short quotes in loose columns ──────────────── */}
      <section className="bg-white px-5 py-20 sm:px-8 md:px-12 md:py-28 lg:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
            <h2 className={sectionTitle}><JpText>{site.home.testimonials.title}</JpText></h2>
            <div className="flex items-center gap-3">
              <span className="font-heading text-4xl font-bold leading-none tabular-nums md:text-5xl">{site.home.hero.ratingScore}</span>
              <div>
                <StarRating size={14} />
                <p className="mt-1 text-xs text-artbar-gray md:text-sm"><JpText>{site.home.hero.ratingSource}</JpText></p>
              </div>
            </div>
          </div>
          <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
            {reviewWall.map((item, i) => (
              <figure key={`${item.author}-${i}`} className={`mb-8 break-inside-avoid border-l-2 border-artbar-taupe/60 pl-6 ${i >= 4 ? 'hidden sm:block' : ''}`}>
                <blockquote className="text-lg leading-[1.75] md:text-xl">
                  <JpText>{item.text}</JpText>
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-3 text-sm">
                  <span className="font-heading font-bold"><JpText>{item.author}</JpText></span>
                  {item.date ? <span className="text-artbar-taupe"><JpText>{item.date}</JpText></span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. Media coverage (same marquee loop as Home) ──────────────── */}
      <section id="media" className="scroll-mt-28 py-20 md:py-28">
        <div className="mx-auto mb-12 max-w-[1480px] px-5 sm:px-8 md:mb-16 md:px-12 lg:px-16">
          <div className="grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-end">
            <h2 className={sectionTitle}><JpText>{site.pressPage.title}</JpText></h2>
            <p className="max-w-xl text-base leading-[1.9] text-artbar-gray md:text-lg"><JpText>{site.pressPage.subtitle}</JpText></p>
          </div>
        </div>
        <div className="press-marquee relative overflow-hidden">
          <div className="press-marquee-track flex w-max gap-5 px-2 py-4 md:gap-6">
            {[...content.media, ...content.media].map((item, idx) => (
              <div key={idx} aria-hidden={idx >= content.media.length} className="w-[240px] flex-shrink-0 md:w-[280px]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-artbar-navy">
                  <img
                    src={item.image || item.logo}
                    alt={stripJpSentinel(item.outlet)}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 h-full w-full ${item.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <h3 className="font-heading text-base font-bold md:text-lg"><JpText>{item.outlet}</JpText></h3>
                  <span className="text-xs text-artbar-taupe">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 12. Closing CTA: full-bleed studio ──────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-artbar-navy text-white">
        <img
          src={content.images.cta}
          alt={stripJpSentinel(homeUiCopy.ctaImageAlt)}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-artbar-navy via-artbar-navy/85 to-artbar-navy/30" aria-hidden />
        <div className="mx-auto max-w-[1480px] px-5 py-24 sm:px-8 md:px-12 md:py-36 lg:px-16">
          <p className="mb-6 text-sm font-bold text-artbar-taupe md:text-base"><JpText>{site.home.cta.badge}</JpText></p>
          <h2 className="v2-display max-w-4xl text-[clamp(2.4rem,6.5vw,5.5rem)] font-heavy leading-[1.08] tracking-[-0.02em]">
            <JpText>{site.home.cta.title}</JpText>
          </h2>
          <p className="mt-7 max-w-lg text-base leading-[1.9] text-white/75 md:text-xl"><JpText>{site.home.cta.subtitle}</JpText></p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => goBook('home_bottom')}
              className={`${ctaPill} bg-artbar-taupe text-artbar-navy hover:bg-[#b3a496] focus-visible:outline-white`}
            >
              {stripJpSentinel(site.home.cta.btnBook)}
              <ArrowRight size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => router.push(localizeHrefForLanguage('/contact', lang))}
              className={`${ctaPill} border border-white/50 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white`}
            >
              {stripJpSentinel(site.home.cta.btnContact)}
            </button>
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
