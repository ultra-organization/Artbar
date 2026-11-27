'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React from 'react';
import Image from 'next/image';
import { cleanDisplayText } from '../lib/jp-display';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useContent } from '../context/ContentContext';
import { PRIVATE_PARTY_INQUIRY_URL } from '../constants';
import { trackInquiryClick } from '../lib/analytics';
import { ClosingCta, Eyebrow, Hairline, PageHero, PrimaryAction, WRAP, h2Class } from '../components/premium/Kit';
import { DecoSplat, PAINT, Splat, Tilt } from '../components/premium/Paint';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { YearEndHeroLink, YearEndPartySection } from '../components/YearEndPartySection';
import { Check, Clock, Utensils } from 'lucide-react';
import { MomentsWall } from '../components/premium/MomentsWall';
import { REAL_PHOTOS } from '../data/real-photos';

export const PrivateParties: React.FC = () => {
  const { site, lang, localizedCopy } = useContent();
  const { privateParties } = site;
  const occasionsReveal = useScrollReveal();
  const pricingReveal = useScrollReveal();
  const capacityReveal = useScrollReveal();
  const timelineReveal = useScrollReveal();

  const maxGuestsLabel = localizedCopy.ui.privateParties.maxGuestsLabel;
  const priceSuffix = localizedCopy.ui.privateParties.priceSuffix;
  const heroImageAlt = stripJpSentinel(localizedCopy.ui.privateParties.heroImageAlt);
  const standardLabel = lang === 'en' ? 'Standard' : 'スタンダード';
  const specialtyInquiry = privateParties.specialtyInquiry;

  const topHeroSrc = privateParties.occasions[0]?.image ?? '';

  const { adult, common } = privateParties.pricing;
  const yearEndFacts = [
    { value: adult.price, label: priceSuffix },
    { value: adult.subtitle, label: adult.items[0]?.title ?? '' },
    { value: adult.items[2]?.title ?? '', label: adult.items[2]?.desc ?? '' },
    { value: common.minGuests, label: common.minGuestsLabel },
  ];

  const jp = lang === 'jp';
  const h2 = h2Class(lang);
  const inquire = (source: string) => {
    trackInquiryClick('private_party', source);
    window.location.href = withBrowserAcquisition(PRIVATE_PARTY_INQUIRY_URL);
  };
  const plans = [
    { key: 'adult', plan: privateParties.pricing.adult, source: 'private_party_adult' },
    { key: 'kids', plan: privateParties.pricing.kids, source: 'private_party_kids' },
  ] as const;

  return (
    <div className="hp relative min-h-screen bg-artbar-bg text-artbar-navy">
      <PageHero
        key={topHeroSrc || 'private-parties-hero'}
        lang={lang}
        image={topHeroSrc}
        alt={heroImageAlt}
        eyebrow={<JpText>{privateParties.hero.badge}</JpText>}
        title={<JpText>{privateParties.hero.title}</JpText>}
        highlight={<JpText>{privateParties.hero.titleHighlight}</JpText>}
        subtitle={<JpText>{privateParties.hero.subtitle}</JpText>}
        actions={
          <>
            <PrimaryAction onClick={() => inquire('private_party_hero')}><JpText>{specialtyInquiry.cta}</JpText></PrimaryAction>
            <YearEndHeroLink kind="private" tone="dark" />
          </>
        }
      />

      {/* A thin cream mount keeps the navy hero and the navy seasonal band apart. */}
      <div className="bg-artbar-bg pt-4 md:pt-6">
        <YearEndPartySection kind="private" facts={yearEndFacts} feeNote={`+ ${common.venueFeeLabel} ${common.venueFeePrice}`} />
      </div>

      {/* ── Occasions: a hung row of mounted photos ────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div ref={occasionsReveal.ref} className={`${WRAP} reveal-stagger grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-8 ${occasionsReveal.isVisible ? 'visible' : ''}`}>
          {privateParties.occasions.map((item, idx) => (
            <figure key={idx} className={`group ${idx % 2 ? 'mt-10 md:mt-16' : ''}`}>
              <Tilt max={5} className="hp-wipe">
                <div className="relative aspect-[3/4] overflow-hidden bg-artbar-light-taupe/40">
                  <Image src={item.image} alt={stripJpSentinel(item.title)} fill className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]" sizes="(max-width: 768px) 50vw, 25vw" />
                  <Hairline className="inset-2.5 md:inset-3" />
                </div>
              </Tilt>
              {cleanDisplayText(item.title) && (
                <figcaption className="mt-4 flex items-start gap-3 text-[14px] font-semibold leading-snug tracking-[0.04em] md:text-base">
                  <span className="mt-[0.6em] h-px w-5 shrink-0 bg-artbar-taupe" aria-hidden />
                  <JpText>{item.title}</JpText>
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>

      {/* ── Real parties at the studio ─────────────────────────────────── */}
      <MomentsWall
        lang={lang}
        tone="white"
        title={jp ? '貸切パーティーの一場面' : 'Moments from private parties'}
        photos={[
          { src: REAL_PHOTOS.friendsWine, alt: jp ? '描きながら笑顔を見せる参加者' : 'A guest smiling at her easel' },
          { src: REAL_PHOTOS.coupleDate, alt: jp ? 'ワインを手に作品と並ぶ二人' : 'Two guests with wine and their paintings' },
          { src: REAL_PHOTOS.classLaugh, alt: jp ? '作品を見せて笑い合う参加者' : 'Guests laughing over their paintings' },
          { src: REAL_PHOTOS.groupPicasso, alt: jp ? '作品を持つグループ' : 'A group holding their paintings' },
          { src: REAL_PHOTOS.classSmile, alt: jp ? '集中して描く参加者' : 'Guests painting together' },
        ]}
      />

      {/* ── Plans: two priced tickets and a custom-request note ────────── */}
      <section className="relative bg-white py-20 md:py-28">
        <DecoSplat seed={606} color={PAINT.lightTaupe} className="-left-20 top-10 h-72 w-72" opacity={0.5} />
        <div ref={pricingReveal.ref} className={`${WRAP} relative grid gap-8 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(280px,0.75fr)] reveal ${pricingReveal.isVisible ? 'visible' : ''}`}>
          {plans.map(({ key, plan, source }) => (
            <article key={key} className="relative flex flex-col bg-artbar-bg p-7 md:p-10">
              <Hairline tone="taupe" className="inset-2.5 md:inset-3.5" />
              <div className="relative flex flex-1 flex-col">
                <p className="text-[12px] font-semibold tracking-[0.14em] text-artbar-taupe"><JpText>{standardLabel}</JpText></p>
                <h2 className={`mt-3 ${jp ? 'text-2xl font-semibold tracking-[0.04em] md:text-[28px]' : 'font-heading text-3xl font-semibold md:text-4xl'}`}><JpText>{plan.title}</JpText></h2>
                <p className="mt-1.5 text-sm text-artbar-gray"><JpText>{plan.subtitle}</JpText></p>
                <div className="mt-7 flex items-end justify-between gap-4 border-y border-artbar-navy/15 py-6">
                  <span className="whitespace-nowrap font-heading text-[clamp(2.2rem,9vw,3rem)] font-semibold leading-none">{cleanDisplayText(plan.price)}</span>
                  <span className="text-right text-xs text-artbar-gray"><JpText>{priceSuffix}</JpText></span>
                </div>
                <ul className="mt-2">
                  {plan.items.map((item, i) => (
                    <li key={i} className="flex gap-3 border-b border-artbar-navy/10 py-4">
                      <Check size={16} strokeWidth={2.4} className="mt-1 shrink-0 text-artbar-taupe" aria-hidden />
                      <div>
                        <p className="text-[15px] font-semibold"><JpText>{item.title}</JpText></p>
                        <p className="mt-0.5 text-sm leading-[1.85] text-artbar-gray"><JpText>{item.desc}</JpText></p>
                      </div>
                    </li>
                  ))}
                </ul>
                <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-xs text-artbar-gray"><JpText>{common.venueFeeLabel}</JpText></dt><dd className="mt-1 font-semibold">{common.venueFeePrice}</dd></div>
                  <div><dt className="text-xs text-artbar-gray"><JpText>{common.minGuestsLabel}</JpText></dt><dd className="mt-1 font-semibold"><JpText>{common.minGuests}</JpText></dd></div>
                </dl>
                <div className="mt-auto pt-8">
                  <PrimaryAction tone="navy" onClick={() => inquire(source)}><JpText>{plan.cta}</JpText></PrimaryAction>
                </div>
              </div>
            </article>
          ))}

          <aside className="relative bg-artbar-navy p-7 text-white md:p-10 lg:col-span-2 xl:col-span-1 xl:self-start">
            <Hairline className="inset-2.5 md:inset-3.5" />
            <div className="relative">
              <h3 className={`${jp ? 'text-xl font-semibold leading-[1.6] tracking-[0.04em] md:text-2xl' : 'font-heading text-2xl font-semibold leading-tight md:text-3xl'}`}><JpText>{specialtyInquiry.title}</JpText></h3>
              <ul className="mt-6 border-t border-white/15">
                {specialtyInquiry.items.map((item, i) => (
                  <li key={item} className="flex items-center gap-3 border-b border-white/10 py-3.5 text-[15px] font-semibold">
                    <span className="relative h-5 w-5 shrink-0" aria-hidden><Splat seed={140 + i * 11} color={i % 2 ? PAINT.lightTaupe : PAINT.taupe} className="absolute inset-0 h-full w-full" /></span>
                    <JpText>{item}</JpText>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm leading-[1.9] text-white/70"><JpText>{specialtyInquiry.note}</JpText></p>
              <div className="mt-8"><PrimaryAction onClick={() => inquire('private_party_custom')}><JpText>{specialtyInquiry.cta}</JpText></PrimaryAction></div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── Capacity: a studio register ────────────────────────────────── */}
      <section className="relative py-20 md:py-28">
        <div ref={capacityReveal.ref} className={`${WRAP} reveal ${capacityReveal.isVisible ? 'visible' : ''}`}>
          <h2 className={h2}><JpText>{privateParties.capacity.title}</JpText></h2>
          <ul className="mt-10 grid border-t border-artbar-navy/15 sm:grid-cols-2 lg:grid-cols-5">
            {localizedCopy.privatePartyCapacityRows.map((loc, i) => (
              <li key={i} className={`flex items-baseline justify-between gap-4 border-b border-artbar-navy/10 py-6 sm:flex-col sm:justify-start sm:gap-0 sm:py-8 lg:border-b-0 ${i % 2 ? 'sm:border-l sm:pl-6' : 'sm:pr-6'} ${i > 0 ? 'lg:border-l lg:pl-6' : ''}`}>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold"><JpText>{loc.name[lang]}</JpText></p>
                  <p className="mt-1 text-[13px] text-artbar-gray"><JpText>{loc.desc[lang]}</JpText></p>
                </div>
                <p className="shrink-0 text-right sm:mt-6 sm:text-left">
                  <span className={`font-heading text-4xl font-semibold leading-none md:text-5xl ${loc.highlight ? 'text-artbar-taupe' : ''}`}>{loc.cap}</span>
                  <span className="mt-1 block text-[11px] tracking-[0.1em] text-artbar-gray"><JpText>{maxGuestsLabel}</JpText></span>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The evening, hour by hour + food ───────────────────────────── */}
      <section className="relative bg-white py-20 md:py-28">
        <div ref={timelineReveal.ref} className={`${WRAP} grid gap-16 lg:grid-cols-12 lg:gap-20 reveal ${timelineReveal.isVisible ? 'visible' : ''}`}>
          <div className="lg:col-span-7">
            <Clock size={22} strokeWidth={1.6} className="text-artbar-taupe" aria-hidden />
            <h2 className={`mt-5 ${h2}`}><JpText>{privateParties.timeline.title}</JpText></h2>
            <p className="mt-4 text-sm font-semibold text-artbar-taupe md:text-[15px]"><JpText>{privateParties.timeline.note}</JpText></p>
            <ol className="relative mt-10 border-l border-artbar-navy/15 pl-8">
              {privateParties.timeline.steps.map((step, i) => (
                <li key={i} className="relative pb-9 last:pb-0">
                  <span className="absolute -left-[2.6rem] top-0.5 h-5 w-5" aria-hidden>
                    <Splat seed={420 + i * 5} color={i % 2 ? PAINT.lightTaupe : PAINT.taupe} className="absolute inset-0 h-full w-full" />
                  </span>
                  <p className="font-heading text-sm font-semibold tracking-[0.08em] text-artbar-taupe"><JpText>{step.time}</JpText></p>
                  <h3 className="mt-1.5 text-[17px] font-semibold"><JpText>{step.title}</JpText></h3>
                  <p className="mt-1 text-[15px] leading-[1.9] text-artbar-gray"><JpText>{step.desc}</JpText></p>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-5">
            <div className="relative bg-artbar-bg p-7 md:p-10">
              <Hairline tone="taupe" className="inset-2.5 md:inset-3.5" />
              <div className="relative">
                <Utensils size={22} strokeWidth={1.6} className="text-artbar-taupe" aria-hidden />
                <h3 className={`mt-5 ${jp ? 'text-xl font-semibold tracking-[0.04em] md:text-2xl' : 'font-heading text-2xl font-semibold md:text-3xl'}`}><JpText>{privateParties.catering.title}</JpText></h3>
                <p className="mt-4 text-[15px] leading-[1.9]"><JpText>{privateParties.catering.desc}</JpText></p>
                <ul className="mt-6 border-t border-artbar-navy/15">
                  {privateParties.catering.items.filter((item) => cleanDisplayText(item)).map((item, i) => (
                    <li key={i} className="flex items-start gap-3 border-b border-artbar-navy/10 py-3.5 text-[15px] text-artbar-gray">
                      <Check size={15} strokeWidth={2.4} className="mt-1 shrink-0 text-artbar-taupe" aria-hidden />
                      <span><JpText>{item}</JpText></span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 space-y-2.5">
                  {privateParties.catering.notes.filter((note) => cleanDisplayText(note)).map((note) => (
                    <li key={note} className="flex items-start gap-3 text-sm font-semibold text-artbar-taupe">
                      <span className="mt-[0.55em] h-px w-4 shrink-0 bg-current" aria-hidden />
                      <span><JpText>{note}</JpText></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        lang={lang}
        className="pt-4 md:pt-6"
        title={<><span className="block"><JpText>{privateParties.hero.title}</JpText></span><span className="block text-artbar-light-taupe"><JpText>{privateParties.hero.titleHighlight}</JpText></span></>}
        body={<JpText>{specialtyInquiry.note}</JpText>}
        actions={<PrimaryAction onClick={() => inquire('private_party_bottom')}><JpText>{specialtyInquiry.cta}</JpText></PrimaryAction>}
      />
    </div>
  );
};
