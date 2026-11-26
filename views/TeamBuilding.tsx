'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Briefcase, Users, Zap, Layers, Wine, MapPin, Coffee, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { TEAM_BUILDING_ACTIVITY_IMAGES, PARTNER_LOGOS, TEAM_BUILDING_INQUIRY_URL } from '../constants';
import { trackInquiryClick } from '../lib/analytics';
import { Eyebrow, Hairline, PageHero, PrimaryAction, WRAP, h2Class, h3Class } from '../components/premium/Kit';
import { DecoSplat, PAINT, Splat, Tilt } from '../components/premium/Paint';
import { PartnerLogo } from '../components/PartnerLogo';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { YearEndHeroLink, YearEndPartySection } from '../components/YearEndPartySection';
import { YEAR_END_PARTY_COPY } from '../data/year-end-parties';

export const TeamBuilding: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { site, content, lang, localizedCopy } = useContent();
  const socialReveal = useScrollReveal();
  const valueReveal = useScrollReveal();
  const activitiesReveal = useScrollReveal();
  const specialtyReveal = useScrollReveal();
  const testimonialsReveal = useScrollReveal();
  const logisticsReveal = useScrollReveal();
  const pricingReveal = useScrollReveal();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const teamHeroSrc = content.images.hero.teamBuilding;
  const bookTeamCta = localizedCopy.ui.home.bookTeamBuildingCta;
  const logisticsRows = localizedCopy.teamBuildingLogisticsRows;
  const teamTestimonials = localizedCopy.teamBuildingTestimonials;
  const heroImageAlt = stripJpSentinel(localizedCopy.ui.teamBuilding.heroImageAlt);
  const previousTestimonialLabel = stripJpSentinel(localizedCopy.ui.teamBuilding.previousTestimonial);
  const nextTestimonialLabel = stripJpSentinel(localizedCopy.ui.teamBuilding.nextTestimonial);
  const yearEndCopy = YEAR_END_PARTY_COPY[lang].team;
  const { pricing } = site.teamBuilding;
  const offsiteRow = logisticsRows[logisticsRows.length - 1];
  const yearEndFacts = [
    { value: pricing.price, label: pricing.priceNote },
    { value: pricing.packageSubtitle, label: yearEndCopy.materialsLabel },
    { value: yearEndCopy.drinksValue, label: yearEndCopy.drinksLabel },
    { value: offsiteRow?.cap[lang] ?? '', label: yearEndCopy.offsiteLabel },
  ];

  const formatEnglishActivityTitle = (title: string) => {
    if (lang !== 'en') return title;

    const [firstWord, ...rest] = title.trim().split(/\s+/);
    if (!firstWord || rest.length === 0) return title;
    return `${firstWord}\n${rest.join(' ')}`;
  };

  const jp = lang === 'jp';
  const h2 = h2Class(lang);
  const h3 = h3Class(lang);
  const inquire = (source: string) => {
    trackInquiryClick('team_building', source);
    window.location.href = withBrowserAcquisition(TEAM_BUILDING_INQUIRY_URL);
  };
  const activities = site.teamBuilding.activities.items.filter((act) => stripJpSentinel(act.title).trim());
  const benefitIcons = [Layers, Zap, Users, Briefcase];
  const tb = site.teamBuilding;

  return (
    <div className="hp relative w-full bg-artbar-bg text-artbar-navy">
      <PageHero
        key={teamHeroSrc}
        lang={lang}
        image={teamHeroSrc}
        alt={heroImageAlt}
        eyebrow={<JpText>{tb.hero.badge}</JpText>}
        title={<JpText>{tb.hero.title}</JpText>}
        highlight={<JpText>{tb.hero.titleHighlight}</JpText>}
        subtitle={<JpText>{tb.hero.subtitle}</JpText>}
        actions={
          <>
            <PrimaryAction onClick={() => inquire('team_building_hero')}><JpText>{tb.hero.cta}</JpText></PrimaryAction>
            <YearEndHeroLink kind="team" tone="dark" />
          </>
        }
      />

      {/* ── Intro + who has joined ─────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div ref={socialReveal.ref} className={`${WRAP} reveal ${socialReveal.isVisible ? 'visible' : ''}`}>
          <p className={`max-w-4xl text-artbar-navy ${jp ? 'text-[19px] font-semibold leading-[1.9] tracking-[0.04em] md:text-[26px]' : 'font-heading text-2xl font-semibold leading-snug md:text-[34px]'}`}>
            <JpText>{tb.hero.eventIntro}</JpText>
          </p>
          <div className="mt-16 md:mt-20">
            <Eyebrow><JpText>{tb.socialProof.title}</JpText></Eyebrow>
            <div className="mt-8 grid grid-cols-3 border-l border-t border-artbar-navy/10 sm:grid-cols-4 lg:grid-cols-7">
              {PARTNER_LOGOS.map((logo) => (
                <div key={logo.name} className="flex min-h-[5rem] min-w-0 items-center justify-center border-b border-r border-artbar-navy/10 px-3 py-4 sm:min-h-[6.5rem] sm:px-6 sm:py-6 opacity-75 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0">
                  <PartnerLogo {...logo} size="compact" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <YearEndPartySection kind="team" facts={yearEndFacts} feeNote={`+ ${pricing.feeLabel} ${pricing.feePrice}`} />

      {/* ── Why paint together ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <DecoSplat seed={77} color={PAINT.lightTaupe} className="-right-20 top-10 h-72 w-72" opacity={0.55} />
        <div ref={valueReveal.ref} className={`${WRAP} relative grid gap-14 lg:grid-cols-12 lg:gap-16 reveal ${valueReveal.isVisible ? 'visible' : ''}`}>
          <div className="lg:col-span-5">
            <Eyebrow><JpText>{tb.valueProp.badge}</JpText></Eyebrow>
            <h2 className={`mt-5 whitespace-pre-line ${h2}`}><JpText>{tb.valueProp.title}</JpText></h2>
            <div className="mt-6 space-y-5 text-[15px] leading-[1.95] text-artbar-gray md:text-base">
              <p><JpText>{tb.valueProp.p1}</JpText></p>
              <p><JpText>{tb.valueProp.p2}</JpText></p>
            </div>
          </div>
          <ul className={`grid self-start border-t border-artbar-navy/15 sm:grid-cols-2 lg:col-span-7 reveal-stagger ${valueReveal.isVisible ? 'visible' : ''}`}>
            {tb.valueProp.benefits.map((item, i) => {
              const Icon = benefitIcons[i] || Layers;
              return (
                <li key={i} className={`border-b border-artbar-navy/10 py-8 sm:py-10 ${i % 2 ? 'sm:border-l sm:pl-8' : 'sm:pr-8'}`}>
                  <Icon size={22} strokeWidth={1.6} className="text-artbar-taupe" aria-hidden />
                  <h3 className={`mt-4 ${h3}`}><JpText>{item.title}</JpText></h3>
                  <p className="mt-2 text-[14px] leading-[1.9] text-artbar-gray md:text-[15px]"><JpText>{item.desc}</JpText></p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Activities: mounted photographs with museum captions ───────── */}
      <section className="relative bg-white py-20 md:py-28">
        <div ref={activitiesReveal.ref} className={`${WRAP} reveal ${activitiesReveal.isVisible ? 'visible' : ''}`}>
          <div className="grid gap-6 md:grid-cols-12 md:items-end">
            <h2 className={`md:col-span-6 ${h2}`}><JpText>{tb.activities.title}</JpText></h2>
            <p className="text-[15px] leading-[1.95] text-artbar-gray md:col-span-5 md:col-start-8 md:text-base"><JpText>{tb.activities.subtitle}</JpText></p>
          </div>
          <div className={`mt-14 grid gap-14 md:mt-16 ${activities.length >= 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} md:gap-10 reveal-stagger ${activitiesReveal.isVisible ? 'visible' : ''}`}>
            {activities.map((act, i) => {
              const activityImage = encodeURI(act.image || TEAM_BUILDING_ACTIVITY_IMAGES[i] || TEAM_BUILDING_ACTIVITY_IMAGES[0]);
              return (
                <article key={i} className={`group ${i % 2 ? 'md:mt-16' : ''}`}>
                  <Tilt max={4} className="hp-wipe">
                    <div className="relative aspect-[4/5] overflow-hidden bg-artbar-light-taupe/40 md:aspect-[5/6]">
                      <Image src={activityImage} alt={stripJpSentinel(act.title)} fill className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]" sizes="(max-width: 768px) 100vw, 50vw" />
                      <Hairline className="inset-3 md:inset-4" />
                    </div>
                  </Tilt>
                  {stripJpSentinel(act.link).trim() && (
                    <p className="mt-6 flex items-center gap-3 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe"><span className="h-px w-6 bg-current" aria-hidden /><JpText>{act.link}</JpText></p>
                  )}
                  <h3 className={`mt-3 whitespace-pre-line ${jp ? 'text-xl font-semibold leading-[1.6] tracking-[0.04em] md:text-2xl' : 'font-heading text-2xl font-semibold leading-tight md:text-3xl'}`}>
                    <JpText>{formatEnglishActivityTitle(act.title)}</JpText>
                  </h3>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.95] text-artbar-gray"><JpText>{act.desc}</JpText></p>
                </article>
              );
            })}
          </div>

          {/* Custom activities */}
          <div ref={specialtyReveal.ref} className={`mt-20 grid gap-8 border-y border-artbar-navy/15 py-10 md:mt-28 md:grid-cols-12 md:items-center md:py-12 reveal ${specialtyReveal.isVisible ? 'visible' : ''}`}>
            <div className="md:col-span-8">
              <Eyebrow><JpText>{tb.specialty.badge}</JpText></Eyebrow>
              <h3 className={`mt-4 whitespace-pre-line ${jp ? 'text-xl font-semibold tracking-[0.04em] md:text-[26px]' : 'font-heading text-2xl font-semibold md:text-[32px]'}`}><JpText>{tb.specialty.title}</JpText></h3>
              <p className="mt-3 max-w-xl text-[15px] leading-[1.95] text-artbar-gray"><JpText>{tb.specialty.desc}</JpText></p>
            </div>
            <div className="md:col-span-4 md:justify-self-end">
              <PrimaryAction tone="navy" onClick={() => inquire('team_building_custom')}><JpText>{tb.specialty.cta}</JpText></PrimaryAction>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials: large quotes, horizontal ─────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div ref={testimonialsReveal.ref} className={`${WRAP} reveal ${testimonialsReveal.isVisible ? 'visible' : ''}`}>
          <div className="flex items-end justify-between gap-6">
            <h2 className={h2}><JpText>{tb.testimonials.title}</JpText></h2>
            <div className="hidden gap-2 md:flex">
              <button type="button" onClick={() => scroll('left')} className="flex h-12 w-12 items-center justify-center rounded-full border border-artbar-navy/20 transition-colors hover:border-artbar-navy" aria-label={previousTestimonialLabel}><ChevronLeft size={20} /></button>
              <button type="button" onClick={() => scroll('right')} className="flex h-12 w-12 items-center justify-center rounded-full bg-artbar-navy text-white transition-colors hover:bg-artbar-blue" aria-label={nextTestimonialLabel}><ChevronRight size={20} /></button>
            </div>
          </div>
          <div ref={scrollRef} className="hide-scrollbar -mx-7 mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-7 pb-4 sm:-mx-8 sm:px-8 md:mx-0 md:gap-10 md:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {teamTestimonials.map((t, i) => (
              <figure key={i} className="relative w-[84%] shrink-0 snap-start border-t border-artbar-navy/15 pt-10 sm:w-[60%] md:w-[44%] lg:w-[34%]">
                <span className="absolute -top-px left-0 h-px w-16 bg-artbar-taupe" aria-hidden />
                <span className="relative block h-10 w-10" aria-hidden>
                  <Splat seed={60 + i * 9} color={[PAINT.taupe, PAINT.lightTaupe, PAINT.blue][i % 3]} className="absolute inset-0 h-full w-full" />
                  <span className="absolute inset-0 flex items-center justify-center font-heading text-2xl font-semibold leading-none text-white">&ldquo;</span>
                </span>
                <blockquote className={`mt-6 text-artbar-navy ${jp ? 'text-[16px] leading-[2] tracking-[0.03em] md:text-lg' : 'font-heading text-xl leading-snug md:text-2xl'}`}>
                  <JpText>{t.text}</JpText>
                </blockquote>
                <figcaption className="mt-6 text-[12px] font-semibold tracking-[0.14em] text-artbar-taupe"><JpText>{t.author}</JpText></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Logistics: what's included, where ──────────────────────────── */}
      <section className="relative bg-white py-20 md:py-28">
        <div ref={logisticsReveal.ref} className={`${WRAP} grid gap-16 lg:grid-cols-2 lg:gap-20 reveal ${logisticsReveal.isVisible ? 'visible' : ''}`}>
          <div>
            <Wine size={24} strokeWidth={1.6} className="text-artbar-taupe" aria-hidden />
            <h2 className={`mt-5 ${jp ? 'text-2xl font-semibold tracking-[0.04em] md:text-[30px]' : 'font-heading text-3xl font-semibold md:text-4xl'}`}><JpText>{tb.logistics.included.title}</JpText></h2>
            <p className="mt-4 text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{tb.logistics.included.desc}</JpText></p>
            <ul className="mt-8 grid border-t border-artbar-navy/15 sm:grid-cols-2 sm:gap-x-8">
              {tb.logistics.included.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 border-b border-artbar-navy/10 py-4 text-[15px] font-medium">
                  <Check size={16} strokeWidth={2.2} className="shrink-0 text-artbar-taupe" aria-hidden /> <JpText>{item}</JpText>
                </li>
              ))}
            </ul>
            <div className="mt-8 bg-artbar-bg p-6">
              <p className="flex items-center gap-2 font-semibold"><Coffee size={17} className="text-artbar-taupe" aria-hidden /> <JpText>{tb.logistics.catering.title}</JpText></p>
              <p className="mt-2 text-sm leading-[1.9] text-artbar-gray"><JpText>{tb.logistics.catering.desc}</JpText></p>
            </div>
          </div>
          <div>
            <MapPin size={24} strokeWidth={1.6} className="text-artbar-taupe" aria-hidden />
            <h2 className={`mt-5 ${jp ? 'text-2xl font-semibold tracking-[0.04em] md:text-[30px]' : 'font-heading text-3xl font-semibold md:text-4xl'}`}><JpText>{tb.logistics.locations.title}</JpText></h2>
            <p className="mt-4 text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{tb.logistics.locations.desc}</JpText></p>
            <table className="mt-8 w-full border-t border-artbar-navy/15 text-left">
              <tbody>
                {logisticsRows.map((row, i) => {
                  const last = i === logisticsRows.length - 1;
                  return (
                    <tr key={i} className="border-b border-artbar-navy/10">
                      <th scope="row" className="py-4 pr-4 text-[15px] font-semibold"><JpText>{row.name[lang]}</JpText></th>
                      <td className={`py-4 text-right text-sm ${last ? 'font-semibold text-artbar-taupe' : 'text-artbar-gray'}`}><JpText>{row.cap[lang]}</JpText></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-5 text-sm text-artbar-gray"><JpText>{tb.logistics.locations.note}</JpText></p>
          </div>
        </div>
      </section>

      {/* ── Pricing: a priced ticket on navy ───────────────────────────── */}
      <section className="relative mb-4 overflow-hidden bg-artbar-navy py-20 md:mb-6 text-white md:py-28">
        <Hairline className="inset-3 md:inset-6" />
        <DecoSplat seed={314} color={PAINT.taupe} className="-left-24 bottom-0 h-80 w-80" opacity={0.35} />
        <div ref={pricingReveal.ref} className={`${WRAP} relative grid items-center gap-14 lg:grid-cols-12 lg:gap-16 reveal ${pricingReveal.isVisible ? 'visible' : ''}`}>
          <div className="lg:col-span-6">
            <Eyebrow tone="light"><JpText>{pricing.badge}</JpText></Eyebrow>
            <h2 className={`mt-5 text-white ${h2}`}><JpText>{pricing.title}</JpText></h2>
            <p className="mt-6 max-w-md text-[15px] leading-[1.95] text-artbar-light-taupe md:text-[17px]"><JpText>{pricing.desc}</JpText></p>
          </div>
          <div className="lg:col-span-6">
            <div className="relative bg-artbar-bg p-7 text-artbar-navy shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] md:p-10">
              <Hairline tone="taupe" className="inset-2.5 md:inset-3.5" />
              <div className="relative">
                <p className="text-[12px] font-semibold tracking-[0.14em] text-artbar-taupe"><JpText>{pricing.packageBadge}</JpText></p>
                <p className={`mt-3 ${jp ? 'text-xl font-semibold tracking-[0.04em] md:text-2xl' : 'font-heading text-2xl font-semibold md:text-3xl'}`}><JpText>{pricing.packageTitle}</JpText></p>
                <p className="mt-1 text-sm text-artbar-gray"><JpText>{pricing.packageSubtitle}</JpText></p>
                <div className="mt-7 flex items-end justify-between gap-4 border-y border-artbar-navy/15 py-6">
                  <p className="whitespace-nowrap font-heading text-[2.6rem] font-semibold leading-none md:text-5xl">{pricing.price}</p>
                  <p className="text-right text-xs text-artbar-gray"><JpText>{pricing.priceNote}</JpText></p>
                </div>
                <dl className="mt-2 text-sm">
                  <div className="flex flex-wrap justify-between gap-3 border-b border-artbar-navy/10 py-3.5"><dt className="text-artbar-gray"><JpText>{pricing.feeLabel}</JpText></dt><dd className="font-semibold">{pricing.feePrice}</dd></div>
                  <div className="flex flex-wrap justify-between gap-3 border-b border-artbar-navy/10 py-3.5"><dt className="text-artbar-gray"><JpText>{pricing.offsiteLabel}</JpText></dt><dd className="font-semibold">{pricing.offsitePrice}</dd></div>
                </dl>
                <details className="group mt-2">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold marker:content-none">
                    <JpText>{pricing.termsTitle}</JpText>
                    <ChevronDown size={18} className="shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="space-y-3 pb-2 pt-1 text-sm leading-[1.85] text-artbar-gray">
                    <p><JpText>{pricing.termsPayment}</JpText></p>
                    <p><JpText>{pricing.termsCancellation}</JpText></p>
                    <p><JpText>{pricing.termsHeadcount}</JpText></p>
                  </div>
                </details>
                <div className="mt-6">
                  <PrimaryAction tone="navy" className="w-full sm:w-full" onClick={() => inquire('team_building_pricing')}><JpText>{bookTeamCta}</JpText></PrimaryAction>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
