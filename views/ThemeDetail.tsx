'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useContent } from '../context/ContentContext';
import { stripJpSentinel } from '../lib/jp-attr';
import { pickDiscoveryThemes, themeSlugFromItem } from '../lib/theme-slugs';
import { THEME_PAGE_IMAGES } from '../data/generated-image-paths';
import { mediaAssetUrl } from '../lib/media/resolve';
import {
  getPh,
  getThemeContent,
  resolveThemeContentSlug,
} from '../data/theme-details';
import { JpText } from '../components/JpText';
import { ThemeScheduleEmbed } from '../components/ThemeScheduleEmbed';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { getArtbarBookingThemeUrl } from '../constants';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { trackBookingClick } from '../lib/analytics';
import { Lightbulb, Users } from 'lucide-react';
import { ClosingCta, Eyebrow, Hairline, PageHero, PrimaryAction, Stars, TextLink, WRAP, h2Class, h3Class } from '../components/premium/Kit';
import { ThemeCard } from '../components/premium/ThemeCard';
import { DecoSplat, PAINT, Splat, Tilt } from '../components/premium/Paint';


export const ThemeDetail: React.FC = () => {
  const params = useParams();
  const rawSlug = (params.slug as string) || '';
  const resolvedSlug = resolveThemeContentSlug(rawSlug);
  const [emptyScheduleSlug, setEmptyScheduleSlug] = useState<string | null>(null);
  const hideSchedule = emptyScheduleSlug === resolvedSlug;
  const router = useRouter();
  const { site, lang, localizedCopy, media } = useContent();
  const theme = getThemeContent(resolvedSlug, lang);
  const themePageCopy = localizedCopy.themePages[resolvedSlug];
  const localizedTheme =
    themePageCopy
      ? {
          ...theme,
          title: themePageCopy.title,
          heroBadge: themePageCopy.heroBadge,
          heroSub: themePageCopy.heroSub,
          introTitle: themePageCopy.introTitle,
          introDesc: themePageCopy.introDesc,
          quickFeatures: theme.quickFeatures.map((item, index) => ({
            ...item,
            title: themePageCopy.quickFeatures[index]?.title ?? item.title,
            desc: themePageCopy.quickFeatures[index]?.desc ?? item.desc,
          })),
          examples: theme.examples.map((item, index) => ({
            ...item,
            title: themePageCopy.examples[index]?.title ?? item.title,
          })),
          expectTitle: themePageCopy.expectTitle,
          expectDesc: themePageCopy.expectDesc,
          perfectTitle: themePageCopy.perfectTitle,
          perfectFor: themePageCopy.perfectFor,
          whatYouGet: theme.whatYouGet.map((item, index) => ({
            ...item,
            text: themePageCopy.whatYouGet[index]?.text ?? item.text,
            sub: themePageCopy.whatYouGet[index]?.sub ?? item.sub,
          })),
          ctaTitle: themePageCopy.ctaTitle,
          ctaSub: themePageCopy.ctaSub,
          seoTitle: themePageCopy.seoTitle,
          seoDesc: themePageCopy.seoDesc,
        }
      : theme;
  const pageImages = THEME_PAGE_IMAGES[resolvedSlug as keyof typeof THEME_PAGE_IMAGES];
  const themeImages = {
    hero: mediaAssetUrl(media, `themes.${resolvedSlug}.hero`, pageImages?.hero ?? ''),
    examples: (pageImages?.examples ?? []).map((image, index) =>
      mediaAssetUrl(media, `themes.${resolvedSlug}.example.${index + 1}`, image)
    ),
    experience: mediaAssetUrl(
      media,
      `themes.${resolvedSlug}.experience`,
      pageImages?.experience ?? '',
    ),
  };

  const intro = useScrollReveal();
  const gallery = useScrollReveal();
  const experience = useScrollReveal();
  const perfect = useScrollReveal();

  const discoveryThemes = useMemo(
    () => pickDiscoveryThemes(resolvedSlug, site.home.themes.items, 4),
    [resolvedSlug, site.home.themes.items]
  );

  /** Strip JP `<wbr>` line-break markers when the title leaks into attribute-only
   *  contexts (alt text, placeholder URLs) — they're rendering hints, not content. */
  const titleAsText = stripJpSentinel(localizedTheme.title.replace(/<wbr\s*\/?>/gi, ''));
  const heroSrc = themeImages.hero || getPh(1920, 1080, titleAsText);
  const filteredBookingUrl = getArtbarBookingThemeUrl(resolvedSlug);

  const stripTitleForGallery = (t: string) =>
    t
      .replace(' Classes with Wine', '')
      .replace(' Paint and Sip Classes', '')
      .replace(' Art Classes with Wine', '')
      .replace(' Sessions', '')
      .replace(' Classes', '');

  const ui = {
    viewSchedule: localizedCopy.ui.themeDetail.viewSchedule,
    inspiration: localizedCopy.ui.themeDetail.inspiration,
    examplePaintings: localizedCopy.ui.themeDetail.examplePaintings,
    exampleBlurb: (name: string) =>
      localizedTheme.exampleBlurb ??
      localizedCopy.ui.themeDetail.exampleBlurb.replace(/\{\{name\}\}/g, name),
    theExperience: localizedCopy.ui.themeDetail.theExperience,
    guestFavorite: localizedCopy.ui.themeDetail.guestFavorite,
    bilingualSessions:
      localizedCopy.ui.themeDetail.bilingualSessionsBySlug[
        resolvedSlug as keyof typeof localizedCopy.ui.themeDetail.bilingualSessionsBySlug
      ] ?? localizedCopy.ui.themeDetail.bilingualSessions,
    expertGuidance: localizedCopy.ui.themeDetail.expertGuidance,
    community: localizedCopy.ui.themeDetail.community,
    viewUpcoming: localizedCopy.ui.themeDetail.viewUpcoming,
    upcomingClassesTitle: localizedCopy.ui.themeDetail.upcomingClassesTitle.replace(
      /\{\{name\}\}/g,
      stripTitleForGallery(localizedTheme.title ?? ''),
    ),
    upcomingClassesSub: localizedCopy.ui.themeDetail.upcomingClassesSub,
    discoverMore: localizedCopy.ui.themeDetail.discoverMore,
    discoverSub: localizedCopy.ui.themeDetail.discoverSub,
    allCategories: localizedCopy.ui.themeDetail.allCategories,
  };

  const jp = lang === 'jp';
  const h2 = h2Class(lang);
  const h3 = h3Class(lang);
  const goBook = (where: 'theme_hero' | 'theme_bottom') => {
    trackBookingClick(where, { theme: resolvedSlug });
    window.location.href = withBrowserAcquisition(filteredBookingUrl);
  };

  return (
    <div className="hp min-h-screen bg-artbar-bg text-artbar-navy">
      {/* ── Hero: the theme's own photo in the mounted-print frame ───────── */}
      <PageHero
        key={heroSrc}
        lang={lang}
        image={heroSrc}
        alt={`${titleAsText} paint and sip class at Artbar Tokyo`}
        eyebrow={<JpText>{localizedTheme.heroBadge}</JpText>}
        title={<JpText>{localizedTheme.title}</JpText>}
        subtitle={<JpText>{localizedTheme.heroSub}</JpText>}
        actions={<PrimaryAction onClick={() => goBook('theme_hero')}><JpText>{ui.viewSchedule}</JpText></PrimaryAction>}
      />

      {/* ── Intro: statement left, three quick facts on a hairline ─────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <DecoSplat seed={41} color={PAINT.lightTaupe} className="-right-24 -top-16 h-64 w-64 md:-right-10 md:h-80 md:w-80" opacity={0.6} />
        <div ref={intro.ref} className={`${WRAP} relative reveal ${intro.isVisible ? 'visible' : ''}`}>
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
            <h2 className={`lg:col-span-6 ${h2}`}><JpText>{localizedTheme.introTitle}</JpText></h2>
            <p className="text-[16px] leading-[2] text-artbar-gray md:text-lg lg:col-span-6 lg:pt-2">
              <JpText>{localizedTheme.introDesc}</JpText>
            </p>
          </div>
          <ul className={`mt-14 grid border-t border-artbar-navy/15 sm:grid-cols-3 md:mt-20 reveal-stagger ${intro.isVisible ? 'visible' : ''}`}>
            {localizedTheme.quickFeatures.map((feat, i) => (
              <li key={i} className={`flex gap-4 border-b border-artbar-navy/10 py-7 sm:border-b-0 sm:py-9 ${i ? 'sm:border-l sm:pl-8' : 'sm:pr-8'} ${i === 1 ? 'sm:pr-8' : ''}`}>
                <feat.icon size={22} strokeWidth={1.6} className="mt-1 shrink-0 text-artbar-taupe" aria-hidden />
                <div>
                  <h3 className={h3}><JpText>{feat.title}</JpText></h3>
                  <p className="mt-2 text-[14px] leading-[1.9] text-artbar-gray md:text-[15px]"><JpText>{feat.desc}</JpText></p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Theme-filtered availability from Painta. The band is set to the Painta
          embed's own light-theme background (#F3F3ED), NOT the brand cream, so the
          opaque iframe blends into the section instead of showing as a rectangle
          seam. Keep these in sync if Painta's embed background changes. */}
      {!hideSchedule && (
        <section className="relative bg-[#F3F3ED] py-16 md:py-24">
          <div className={WRAP}>
            <div className="mb-10 grid gap-6 md:mb-12 md:grid-cols-12 md:items-end">
              <div className="md:col-span-8">
                <p className="flex items-center gap-3 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
                  <span className="relative flex h-2 w-2" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-artbar-taupe opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-artbar-taupe" />
                  </span>
                  <JpText>{ui.viewUpcoming}</JpText>
                </p>
                <h2 className={`mt-4 ${h2}`}><JpText>{ui.upcomingClassesTitle}</JpText></h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{ui.upcomingClassesSub}</JpText></p>
              </div>
            </div>
            <div className="-mx-7 sm:-mx-8 md:-mx-12">
              <ThemeScheduleEmbed
                key={resolvedSlug}
                themeSlug={resolvedSlug}
                locale={lang === 'jp' ? 'ja' : 'en'}
                title={ui.upcomingClassesTitle}
                onEmptyChange={(isEmpty) => setEmptyScheduleSlug(isEmpty ? resolvedSlug : null)}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── The experience: mounted photo with a museum label ──────────── */}
      <section className="relative py-20 md:py-28">
        <div ref={experience.ref} className={`${WRAP} reveal ${experience.isVisible ? 'visible' : ''}`}>
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="relative lg:col-span-6">
              <DecoSplat seed={511} color={PAINT.taupe} className="-left-10 -top-10 h-40 w-40 md:-left-16 md:-top-14 md:h-56 md:w-56" opacity={0.85} />
              <Tilt max={4} className="relative">
                <div className="relative aspect-[4/5] overflow-hidden bg-artbar-light-taupe/40 sm:aspect-[4/3] lg:aspect-[4/5]">
                  <Image
                    src={themeImages.experience || getPh(1000, 750, 'Studio Atmosphere')}
                    alt={stripJpSentinel(localizedCopy.ui.themeDetail.atmosphereImageAlt)}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <Hairline className="inset-3 md:inset-4" />
                </div>
              </Tilt>
              {/* Museum label */}
              <div className="relative z-[3] -mt-10 ml-auto mr-4 w-fit bg-white px-5 py-4 shadow-[0_24px_50px_-28px_rgba(5,55,97,0.45)] md:-mt-12 md:mr-8">
                <Stars />
                <p className="mt-2 text-[12px] font-semibold tracking-[0.12em] text-artbar-navy"><JpText>{ui.guestFavorite}</JpText></p>
              </div>
            </div>
            <div className="lg:col-span-6">
              {stripJpSentinel(ui.theExperience).trim() && <Eyebrow className="mb-5"><JpText>{ui.theExperience}</JpText></Eyebrow>}
              <h2 className={h2}><JpText>{localizedTheme.expectTitle}</JpText></h2>
              <p className="mt-6 text-[15px] leading-[2] text-artbar-gray md:text-[17px]"><JpText>{localizedTheme.expectDesc}</JpText></p>
              <dl className="mt-10 grid grid-cols-2 border-t border-artbar-navy/15">
                {[{ Icon: Users, t: ui.bilingualSessions }, { Icon: Lightbulb, t: ui.expertGuidance }].map(({ Icon, t }, i) => (
                  <div key={i} className={`flex items-start gap-3 pt-6 ${i ? 'border-l border-artbar-navy/10 pl-5' : 'pr-5'}`}>
                    <Icon size={18} strokeWidth={1.7} className="mt-0.5 shrink-0 text-artbar-taupe" aria-hidden />
                    <dt className="text-[14px] font-semibold leading-snug tracking-[0.03em]"><JpText>{t}</JpText></dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* What's included */}
          <div className="mt-20 md:mt-28">
            <Eyebrow><JpText>{jp ? '体験に含まれるもの' : "What's included"}</JpText></Eyebrow>
            <ul className={`mt-8 grid grid-cols-2 border-t border-artbar-navy/15 xl:grid-cols-4 reveal-stagger ${experience.isVisible ? 'visible' : ''}`}>
              {localizedTheme.whatYouGet.map(({ icon: Icon, text, sub }, i) => (
                <li key={text} className={`border-b border-artbar-navy/10 py-7 pr-4 md:py-9 md:pr-8 xl:border-b-0 ${i % 2 ? 'border-l pl-4 md:pl-8' : ''} ${i >= 2 ? 'xl:border-l xl:pl-8' : ''}`}>
                  {Icon ? <Icon size={22} strokeWidth={1.6} className="text-artbar-taupe" aria-hidden /> : null}
                  <h3 className={`mt-4 ${h3}`}><JpText>{text}</JpText></h3>
                  <p className="mt-2 text-[13px] leading-[1.85] text-artbar-gray md:text-[15px]"><JpText>{sub}</JpText></p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Example paintings: a salon wall of matted canvases ─────────── */}
      <section className="relative overflow-hidden bg-artbar-navy py-20 text-white md:py-28">
        <Hairline className="inset-3 md:inset-6" />
        <DecoSplat seed={88} color={PAINT.blue} className="-left-20 bottom-10 h-72 w-72" opacity={0.5} />
        <div ref={gallery.ref} className={`${WRAP} relative reveal ${gallery.isVisible ? 'visible' : ''}`}>
          <div className="max-w-2xl">
            {stripJpSentinel(ui.inspiration).trim() && <Eyebrow tone="light" className="mb-5"><JpText>{ui.inspiration}</JpText></Eyebrow>}
            <h2 className={`text-white ${h2}`}><JpText>{ui.examplePaintings}</JpText></h2>
            <p className="mt-5 text-[15px] leading-[1.95] text-white/70 md:text-base"><JpText>{ui.exampleBlurb(stripTitleForGallery(localizedTheme.title))}</JpText></p>
          </div>
          <div className={`mt-14 grid grid-cols-2 gap-x-5 gap-y-12 md:mt-20 lg:grid-cols-4 lg:gap-x-10 reveal-stagger ${gallery.isVisible ? 'visible' : ''}`}>
            {localizedTheme.examples.map((ex, i) => (
              <figure key={i} className={`group ${i % 2 ? 'mt-10 lg:mt-16' : ''}`}>
                <Tilt max={6}>
                  <div className="bg-white p-2.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] md:p-3.5">
                    <div className="relative aspect-square overflow-hidden bg-artbar-light-taupe/40">
                      <Image
                        src={themeImages.examples[i] || ex.image || getPh(400, 400, stripJpSentinel(ex.title))}
                        alt={stripJpSentinel(ex.title)}
                        fill
                        className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  </div>
                </Tilt>
                <figcaption className="mt-4 flex items-start gap-3 text-[13px] font-semibold leading-snug tracking-[0.04em] text-white/90 md:text-[15px]">
                  <span className="mt-[0.55em] h-px w-5 shrink-0 bg-artbar-taupe" aria-hidden />
                  <JpText>{ex.title}</JpText>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it suits: an editorial list, not cards ─────────────────── */}
      <section className="relative py-20 md:py-28">
        <div ref={perfect.ref} className={`${WRAP} reveal ${perfect.isVisible ? 'visible' : ''}`}>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              {stripJpSentinel(ui.community).trim() && <Eyebrow className="mb-5"><JpText>{ui.community}</JpText></Eyebrow>}
              <h2 className={h2}><JpText>{localizedTheme.perfectTitle}</JpText></h2>
            </div>
            <ul className={`border-t border-artbar-navy/15 lg:col-span-7 reveal-stagger ${perfect.isVisible ? 'visible' : ''}`}>
              {localizedTheme.perfectFor.map((item, i) => (
                <li key={i} className="group relative flex items-center gap-5 border-b border-artbar-navy/10 py-6 md:py-7">
                  <span className="relative h-7 w-7 shrink-0" aria-hidden>
                    <Splat seed={700 + i * 13} color={[PAINT.taupe, PAINT.lightTaupe, PAINT.blue][i % 3]} className="absolute inset-0 h-full w-full transition-transform duration-500 group-hover:rotate-45 group-hover:scale-125" />
                  </span>
                  <p className={`${jp ? 'text-[16px] font-semibold leading-[1.7] tracking-[0.04em] md:text-lg' : 'font-heading text-lg font-semibold leading-snug md:text-[22px]'}`}><JpText>{item}</JpText></p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Closing CTA: paint the panel ───────────────────────────────── */}
      <ClosingCta
        lang={lang}
        title={<JpText>{localizedTheme.ctaTitle}</JpText>}
        body={<JpText>{localizedTheme.ctaSub}</JpText>}
        actions={<PrimaryAction onClick={() => goBook('theme_bottom')}><JpText>{ui.viewUpcoming}</JpText></PrimaryAction>}
      />

      {/* ── Discover more themes ───────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className={WRAP}>
          <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className={h2}><JpText>{ui.discoverMore}</JpText></h2>
              <p className="mt-4 max-w-lg text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{ui.discoverSub}</JpText></p>
            </div>
            <TextLink
              href={localizeHrefForLanguage('/#popular-themes', lang)}
              onClick={(e) => { e.preventDefault(); router.push(localizeHrefForLanguage('/#popular-themes', lang)); }}
            >
              <JpText>{ui.allCategories}</JpText>
            </TextLink>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-8 reveal-stagger visible">
            {discoveryThemes.map((item, i) => (
              <ThemeCard key={themeSlugFromItem(item)} item={item} index={i} lang={lang} sizes="(max-width: 768px) 50vw, 25vw" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
