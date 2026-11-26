'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { JpText } from '../JpText';
import { HollySprig } from '../HolidayDecor';
import { useContent } from '../../context/ContentContext';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { GIFT_CERTIFICATES_URL, HOLIDAY_GIFT_BLOG_PATH, HOLIDAY_GIFT_COPY } from '../../data/holiday-theme';
import { withBrowserAcquisition } from '../../lib/painta-acquisition';
import { cleanDisplayText } from '../../lib/jp-display';
import { localizeHrefForLanguage } from '../../lib/locale-routing';
import { trackGiftCertificateClick } from '../../lib/analytics';
import { Magnetic } from './Paint';
import { Seal, TextLink } from './Kit';
import { PILL_NAVY, h2Class } from './styles';

/**
 * Seasonal gift certificate, drawn as a real paper ticket:
 * - it drops onto the page and settles at a slight angle when scrolled into view,
 * - a row of punched holes and two notches mark where the stub tears off,
 * - the bottom-right corner is a curled page that lifts further on hover (and peeks once on touch screens).
 * Purely decorative motion; prefers-reduced-motion keeps it still.
 */
export function GiftTicket() {
  const { lang } = useContent();
  const copy = HOLIDAY_GIFT_COPY[lang];
  const reveal = useScrollReveal();
  const goToGifts = () => {
    trackGiftCertificateClick('home_holiday_banner');
    window.location.href = withBrowserAcquisition(GIFT_CERTIFICATES_URL);
  };

  return (
    <div ref={reveal.ref} className={`gt-scene mx-auto max-w-[1080px] ${reveal.isVisible ? 'gt-in' : ''}`}>
      {/* drop-shadow lives on a wrapper: the ticket's notch mask would clip a box-shadow */}
      <div className="gt-drop group">
        <div className="gt-ticket relative grid bg-white text-artbar-navy md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Stub: the real certificate, stamped with the anniversary seal */}
          <div className="gt-stub relative flex h-60 items-center justify-center overflow-hidden bg-artbar-navy sm:h-72 md:h-auto md:min-h-[380px]">
            <div className="pointer-events-none absolute inset-2.5 border border-white/15 md:inset-3" aria-hidden />
            <div className="relative h-[80%] w-[80%] -rotate-3 transition-transform duration-700 ease-[cubic-bezier(.2,1.4,.4,1)] group-hover:rotate-0 group-hover:scale-[1.04] motion-reduce:transition-none">
              <Image src={copy.image} alt={cleanDisplayText(copy.imageAlt)} fill className="object-contain [filter:drop-shadow(0_16px_20px_rgba(0,0,0,0.45))]" sizes="(max-width: 768px) 80vw, 34vw" />
            </div>
            <Seal className="absolute bottom-4 left-4 w-[72px] text-[7px] opacity-90 md:bottom-6 md:left-6 md:w-24 md:text-[9px]" />
          </div>

          {/* Perforation: a row of punched holes, not a dashed border */}
          <div className="gt-perf pointer-events-none absolute" aria-hidden />

          {/* Body */}
          <div className="relative flex flex-col justify-center px-7 pb-10 pt-9 sm:px-10 md:py-14 md:pl-16 md:pr-14">
            <div className="pointer-events-none absolute inset-2.5 border border-artbar-taupe/30 md:inset-3" aria-hidden />
            <HollySprig className="pointer-events-none absolute right-5 top-5 w-14 rotate-[8deg] md:right-7 md:top-7 md:w-[72px]" />
            <p className="relative flex items-center gap-4 pr-16 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
              <span className="h-px w-10 shrink-0 bg-current" aria-hidden /><JpText>{copy.stub}</JpText>
            </p>
            <h2 id="hp-gift-title" className={`relative mt-5 pr-14 ${h2Class(lang)}`}><JpText>{copy.title}</JpText></h2>
            <p className="relative mt-4 max-w-[34rem] text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{copy.body}</JpText></p>
            <div className="relative mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
              <Magnetic className="w-full sm:w-auto">
                <button type="button" data-no-splat className={`${PILL_NAVY} w-full sm:w-auto`} onClick={goToGifts}>
                  <JpText>{copy.cta}</JpText>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                </button>
              </Magnetic>
              <TextLink href={localizeHrefForLanguage(HOLIDAY_GIFT_BLOG_PATH, lang)}><JpText>{copy.ideasLink}</JpText></TextLink>
            </div>
          </div>

          {/* Curled corner: page colour where the paper has lifted away, the paper's underside folded over */}
          <div className="gt-curl pointer-events-none absolute bottom-0 right-0" aria-hidden />
        </div>
      </div>
    </div>
  );
}
