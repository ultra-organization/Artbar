'use client';

import Image from 'next/image';
import { Button } from './ui/Button';
import { JpText } from './JpText';
import { HollySprig } from './HolidayDecor';
import { useContent } from '../context/ContentContext';
import { GIFT_CERTIFICATES_URL, HOLIDAY_GIFT_BLOG_PATH, HOLIDAY_GIFT_COPY } from '../data/holiday-theme';
import { withBrowserAcquisition } from '../lib/painta-acquisition';
import { cleanDisplayText } from '../lib/jp-display';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { trackGiftCertificateClick } from '../lib/analytics';

/**
 * Seasonal home banner styled as a paper gift certificate: photo stub, perforation, then the offer.
 * Kept light so it doesn't compete with the hero lights or the navy year-end feature below it.
 * The parent renders it only while the holiday theme is active.
 */
export function HolidayGiftBanner() {
  const { lang } = useContent();
  const copy = HOLIDAY_GIFT_COPY[lang];
  const goToGifts = () => {
    trackGiftCertificateClick('home_holiday_banner');
    window.location.href = withBrowserAcquisition(GIFT_CERTIFICATES_URL);
  };

  return (
    <section aria-labelledby="home-holiday-gift-title" className="holiday-fade-in relative z-[5] bg-artbar-bg px-4 pt-10 md:px-10 md:pt-14">
      {/* drop-shadow on a wrapper: the ticket's mask would cut off a box-shadow */}
      <div className="mx-auto max-w-5xl [filter:drop-shadow(0_18px_28px_rgba(5,55,97,0.16))]">
      <div className="holiday-ticket relative grid bg-white text-artbar-navy md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative h-52 overflow-hidden rounded-t-[1.25rem] sm:h-64 md:h-auto md:min-h-[320px] md:rounded-l-[1.25rem] md:rounded-tr-none">
          <Image
            src={copy.image}
            alt={cleanDisplayText(copy.imageAlt)}
            fill
            className="object-cover object-[center_28%]"
            sizes="(max-width: 768px) 100vw, 42vw"
          />
        </div>

        {/* Perforation between the stub and the certificate body */}
        <div className="holiday-perforation pointer-events-none absolute inset-x-6 top-52 border-t-2 border-dashed border-artbar-light-taupe sm:top-64 md:inset-x-auto md:inset-y-6 md:left-[41.666%] md:top-6 md:border-l-2 md:border-t-0" aria-hidden="true" />

        <div className="relative flex flex-col justify-center px-6 pb-8 pt-7 sm:px-10 md:py-12 md:pl-14 md:pr-12">
          <HollySprig className="pointer-events-none absolute right-4 top-4 w-16 rotate-[8deg] md:right-6 md:top-5 md:w-20" />
          <p className="font-heading text-sm font-bold tracking-wide text-artbar-taupe">
            <JpText>{copy.stub}</JpText>
          </p>
          <h2 id="home-holiday-gift-title" className="mt-3 pr-16 text-balance font-heading text-[2rem] font-heavy leading-[1.05] tracking-tight sm:text-4xl md:pr-20 md:text-5xl">
            <JpText>{copy.title}</JpText>
          </h2>
          <p className="mt-4 max-w-[34rem] text-base leading-relaxed text-artbar-gray md:text-lg"><JpText>{copy.body}</JpText></p>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
            <Button variant="primary" size="cta" className="w-full sm:w-auto" onClick={goToGifts}>
              <JpText>{copy.cta}</JpText>
            </Button>
            <a
              href={localizeHrefForLanguage(HOLIDAY_GIFT_BLOG_PATH, lang)}
              className="inline-flex min-h-11 items-center self-center font-heading text-sm font-bold text-artbar-navy underline decoration-artbar-taupe decoration-2 underline-offset-[6px] transition-colors hover:text-artbar-taupe focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy sm:self-auto"
            >
              <JpText>{copy.ideasLink}</JpText>
            </a>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
