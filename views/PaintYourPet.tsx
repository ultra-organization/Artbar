'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React from 'react';
import Image from 'next/image';
import { useContent } from '../context/ContentContext';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { PetSketcher } from '../components/PetSketcher';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ArrowRight, Check } from 'lucide-react';
import { Hairline, PrimaryAction, WRAP } from '../components/premium/Kit';
import { DecoSplat, PAINT, Splat, Tilt } from '../components/premium/Paint';
import { ARTBAR_BOOKING_URL } from '../constants';
import { trackBookingClick } from '../lib/analytics';
export const PaintYourPet: React.FC = () => {
  const { site, localizedCopy, lang } = useContent();
  const content = site.paintYourPet;
  const petCopy = localizedCopy.ui.paintYourPet;
  const examplesReveal = useScrollReveal();
  const petReveal = useScrollReveal();
  const infoReveal = useScrollReveal();

  const jp = lang === 'jp';
  const book = () => {
    trackBookingClick('paint_your_pet');
    window.location.href = withBrowserAcquisition(ARTBAR_BOOKING_URL);
  };

  return (
    <div className="hp relative min-h-screen bg-artbar-bg text-artbar-navy">
      {/* ── Header with the before → after pair ────────────────────────── */}
      <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-44">
        <DecoSplat seed={2} color={PAINT.lightTaupe} className="-left-24 top-24 h-72 w-72" opacity={0.5} />
        <div className={`${WRAP} relative grid items-center gap-14 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-5">
            {stripJpSentinel(petCopy.headerBadge).trim() && (
              <p className="hp-in flex items-center gap-4 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]"><span className="h-px w-10 bg-current" aria-hidden /><JpText>{petCopy.headerBadge}</JpText></p>
            )}
            <h1 className={`hp-in mt-5 ${jp ? 'text-[clamp(2rem,8vw,3.4rem)] font-semibold leading-[1.4] tracking-[0.04em]' : 'font-heading text-[clamp(2.8rem,10vw,5rem)] font-semibold leading-[0.98] tracking-[-0.02em]'}`} style={{ animationDelay: '100ms' }}>
              <JpText>{content.title}</JpText>
            </h1>
            <p className="hp-in mt-6 max-w-lg text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]" style={{ animationDelay: '200ms' }}>
              <JpText>{content.desc}</JpText>
            </p>
            <div className="hp-in mt-9" style={{ animationDelay: '300ms' }}>
              <PrimaryAction onClick={book}><JpText>{site.nav.book}</JpText></PrimaryAction>
            </div>
          </div>

          <div ref={examplesReveal.ref} className={`lg:col-span-7 reveal ${examplesReveal.isVisible ? 'visible' : ''}`}>
            <div className="relative grid grid-cols-2 items-center gap-4 sm:gap-8">
              {[
                { src: '/media/petbefore.jpg', label: petCopy.originalPhoto, rot: '-rotate-3', bg: '' },
                { src: '/media/petafter.png', label: petCopy.canvasSketch, rot: 'rotate-2 translate-y-6', bg: 'bg-white' },
              ].map((img, i) => (
                <figure key={img.src} className={`${img.rot}`}>
                  <Tilt max={6}>
                    <div className="bg-white p-2.5 shadow-[0_30px_60px_-30px_rgba(5,55,97,0.55)] sm:p-3.5">
                      <div className={`relative aspect-square overflow-hidden ${img.bg}`}>
                        <Image src={img.src} alt={stripJpSentinel(img.label)} fill className="object-cover" sizes="(max-width: 1024px) 45vw, 30vw" priority={i === 0} />
                      </div>
                    </div>
                  </Tilt>
                  <figcaption className="mt-4 flex items-center gap-3 text-[13px] font-semibold tracking-[0.04em]">
                    <span className="h-px w-5 bg-artbar-taupe" aria-hidden /><JpText>{img.label}</JpText>
                  </figcaption>
                </figure>
              ))}
              <span className="pointer-events-none absolute left-1/2 top-[42%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center" aria-hidden>
                <Splat seed={77} color={PAINT.taupe} className="absolute inset-0 h-full w-full" />
                <ArrowRight size={20} className="relative text-artbar-navy" />
              </span>
            </div>
            <p className="mt-12 max-w-md text-[14px] leading-[1.9] text-artbar-gray"><JpText>{petCopy.professionalSketchNote}</JpText></p>
          </div>
        </div>
      </section>

      {/* ── The sketcher ───────────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-28">
        <div ref={petReveal.ref} className={`${WRAP} reveal ${petReveal.isVisible ? 'visible' : ''}`}>
          <PetSketcher />
        </div>
      </section>

      {/* ── How it works + price ───────────────────────────────────────── */}
      <section className="relative mb-4 overflow-hidden bg-artbar-navy py-20 md:mb-6 text-white md:py-28">
        <Hairline className="inset-3 md:inset-6" />
        <div ref={infoReveal.ref} className={`${WRAP} relative grid items-start gap-14 lg:grid-cols-12 lg:gap-16 reveal ${infoReveal.isVisible ? 'visible' : ''}`}>
          <div className="lg:col-span-7">
            <h2 className={`${jp ? 'text-[clamp(1.5rem,6vw,2.1rem)] font-semibold leading-[1.5] tracking-[0.04em] md:text-[2.4rem]' : 'font-heading text-[clamp(1.9rem,7vw,3rem)] font-semibold leading-[1.08]'}`}><JpText>{petCopy.howItWorks}</JpText></h2>
            <ol className="mt-10 border-t border-white/15">
              {content.steps.map((step, i) => (
                <li key={i} className="flex gap-5 border-b border-white/10 py-6 md:py-7">
                  <span className="relative flex h-12 w-12 shrink-0 items-center justify-center" aria-hidden>
                    <Splat seed={210 + i * 9} color={i % 2 ? PAINT.lightTaupe : PAINT.taupe} className="absolute -inset-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)]" />
                    <span className="relative font-heading text-lg font-semibold text-artbar-navy">{i + 1}</span>
                  </span>
                  <div>
                    <p className="text-[17px] font-semibold"><JpText>{step.title}</JpText></p>
                    <p className="mt-1.5 text-[15px] leading-[1.9] text-white/70"><JpText>{step.desc}</JpText></p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-5">
            <div className="relative bg-artbar-bg p-7 text-artbar-navy md:p-10">
              <Hairline tone="taupe" className="inset-2.5 md:inset-3.5" />
              <div className="relative">
                <p className="text-[12px] font-semibold tracking-[0.14em] text-artbar-taupe"><JpText>{petCopy.priceLabel}</JpText></p>
                <p className="mt-4 font-heading text-5xl font-semibold leading-none">{content.pricing.price}</p>
                <p className="mt-2 text-sm text-artbar-gray"><JpText>{content.pricing.priceNote}</JpText></p>
                <ul className="mt-7 border-t border-artbar-navy/15">
                  {content.pricing.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 border-b border-artbar-navy/10 py-4 text-[15px] font-medium">
                      <Check size={16} strokeWidth={2.4} className="shrink-0 text-artbar-taupe" aria-hidden /> <JpText>{item}</JpText>
                    </li>
                  ))}
                </ul>
                <div className="mt-8"><PrimaryAction tone="navy" onClick={book}><JpText>{site.nav.book}</JpText></PrimaryAction></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
