'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { JpText } from '../JpText';
import { HollySprig } from '../HolidayDecor';
import { useContent } from '../../context/ContentContext';
import { GIFT_CERTIFICATES_URL, HOLIDAY_GIFT_BLOG_PATH, HOLIDAY_GIFT_COPY } from '../../data/holiday-theme';
import { withBrowserAcquisition } from '../../lib/painta-acquisition';
import { cleanDisplayText } from '../../lib/jp-display';
import { localizeHrefForLanguage } from '../../lib/locale-routing';
import { trackGiftCertificateClick } from '../../lib/analytics';
import { Seal, TextLink } from './Kit';
import { PILL_NAVY, h2Class } from './styles';

/**
 * The seasonal gift certificate as a die-cut ticket: a navy stub holding the real certificate,
 * a perforated tear line, and the offer printed on card stock.
 * The stub and body are separate pieces whose masks punch matching half-holes, so the page shows
 * through the perforation and each piece casts its own shadow. Hovering on desktop starts to tear
 * the stub away; that is the only motion, and reduced motion keeps it still.
 */
export function GiftTicket() {
  const { lang } = useContent();
  const copy = HOLIDAY_GIFT_COPY[lang];
  const jp = lang === 'jp';
  const goToGifts = () => {
    trackGiftCertificateClick('home_holiday_banner');
    window.location.href = withBrowserAcquisition(GIFT_CERTIFICATES_URL);
  };

  return (
    <div className="tk mx-auto flex max-w-[1080px] flex-col md:flex-row">
      {/* Stub: the real certificate on navy stock */}
      <div className="tk-stub tk-piece relative z-[1] md:w-[38%] md:shrink-0 lg:w-[36%]">
        <div className="tk-cut tk-navy tk-grain relative flex h-64 items-center justify-center overflow-hidden rounded-t-md sm:h-80 md:h-full md:min-h-[400px] md:rounded-l-md md:rounded-tr-none">
          <div className="pointer-events-none absolute inset-3 border border-white/15" aria-hidden />
          <div className="relative h-[78%] w-[78%] -rotate-[4deg]">
            <Image src={copy.image} alt={cleanDisplayText(copy.imageAlt)} fill className="object-contain [filter:drop-shadow(0_10px_14px_rgba(0,0,0,0.4))]" sizes="(max-width: 768px) 78vw, 30vw" />
          </div>
          <Seal className="absolute bottom-5 left-5 w-[68px] text-[7px] opacity-80 md:bottom-7 md:left-7 md:w-20 md:text-[8px]" />
        </div>
      </div>

      {/* Body: the offer, printed on card stock */}
      <div className="tk-body tk-piece relative min-w-0 flex-1">
        <div className="tk-cut tk-paper tk-grain relative h-full rounded-b-md text-artbar-navy md:rounded-r-md md:rounded-bl-none">
          <div className="pointer-events-none absolute inset-3 border border-artbar-light-taupe/70" aria-hidden />
          <div className="relative flex h-full flex-col px-7 pb-8 pt-10 sm:px-10 md:py-12 md:pl-14 md:pr-12 lg:pl-16">
            <HollySprig className="pointer-events-none absolute right-6 top-6 w-12 rotate-[8deg] md:right-8 md:top-8 md:w-16" />
            <p className="flex items-center gap-4 pr-14 text-[12px] font-medium tracking-[0.16em] text-artbar-taupe md:text-[13px]">
              <span className="h-px w-8 shrink-0 bg-current" aria-hidden /><JpText>{copy.stub}</JpText>
            </p>
            <h2 id="hp-gift-title" className={`mt-4 pr-12 ${h2Class(lang)}`}><JpText>{copy.title}</JpText></h2>
            <p className="mt-4 max-w-[32rem] text-[15px] leading-[1.95] text-artbar-gray md:text-base"><JpText>{copy.body}</JpText></p>

            <div className="mt-8 flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:gap-8">
              <button type="button" data-no-splat className={`${PILL_NAVY} w-full whitespace-nowrap sm:w-auto`} onClick={goToGifts}>
                <JpText>{copy.cta}</JpText>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
              </button>
              <TextLink className="whitespace-nowrap" href={localizeHrefForLanguage(HOLIDAY_GIFT_BLOG_PATH, lang)}><JpText>{copy.ideasLink}</JpText></TextLink>
            </div>

            <div className="min-h-9 md:flex-1" aria-hidden />
            {/* The three steps printed on the real certificate */}
            <ol className="grid gap-3 border-t border-dashed border-artbar-light-taupe pt-6 text-[12.5px] leading-[1.7] text-artbar-gray sm:grid-cols-3 sm:gap-5">
              {copy.steps.map((step, i) => (
                <li key={step} className="flex items-baseline gap-2.5">
                  <span className={`font-heading text-[15px] font-semibold text-artbar-taupe ${jp ? '' : 'leading-none'}`}>{i + 1}</span>
                  <span><JpText>{step}</JpText></span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
