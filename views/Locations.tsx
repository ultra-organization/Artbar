'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDownRight, CalendarDays } from 'lucide-react';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useContent } from '../context/ContentContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { studioDisplayName } from '../lib/jp-display';
import { getLocationBookingDestination } from '../lib/location-booking';
import { trackBookingClick } from '../lib/analytics';
import type { Location } from '../types';
import type { JapaneseUiCopy } from '@/lib/copy/types';
import { Hairline, PILL_TAUPE, Seal, TextLink, WRAP, h2Class } from '../components/premium/Kit';
import { DecoSplat, PAINT, Tilt } from '../components/premium/Paint';

export const Locations: React.FC = () => {
  const { lang, content, site, localizedCopy } = useContent();
  const locationCopy = localizedCopy.ui.locations;
  const operatingReveal = useScrollReveal();
  const jp = lang === 'jp';

  return (
    <div className="hp relative min-h-screen bg-artbar-bg text-artbar-navy">
      {/* ── Header: title + the studio index ───────────────────────────── */}
      <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
        <DecoSplat seed={2016} color={PAINT.lightTaupe} className="-right-24 top-16 h-80 w-80 md:right-[8%] md:h-96 md:w-96" opacity={0.55} />
        <div className={`${WRAP} relative grid gap-12 lg:grid-cols-12 lg:gap-16`}>
          <div className="lg:col-span-6">
            <h1 className={`hp-in ${jp ? 'text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[1.35] tracking-[0.04em]' : 'font-heading text-[clamp(2.8rem,10vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.02em]'}`}>
              <JpText>{site.nav.locations}</JpText>
            </h1>
            <p className="hp-in mt-6 max-w-lg text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]" style={{ animationDelay: '150ms' }}>
              <JpText>{locationCopy.intro}</JpText>
            </p>
            <Seal tone="dark" className="mt-10 hidden w-28 text-[11px] opacity-80 lg:block" />
          </div>
          <nav aria-label={jp ? 'スタジオを選ぶ' : 'Choose a studio'} className="hp-in lg:col-span-6" style={{ animationDelay: '300ms' }}>
            <ul className="border-t border-artbar-navy/15">
              {content.locations.map((loc) => (
                <li key={loc.id}>
                  <a href={`#studio-${loc.id}`} className="group flex min-h-14 items-center justify-between gap-4 border-b border-artbar-navy/10 py-4 transition-colors hover:text-artbar-taupe focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-artbar-navy">
                    <span className={`${jp ? 'text-[17px] font-semibold tracking-[0.04em] md:text-xl' : 'font-heading text-xl font-semibold md:text-2xl'}`}>
                      <JpText>{studioDisplayName(jp ? loc.nameJp : loc.nameEn)}</JpText>
                    </span>
                    <ArrowDownRight size={18} className="shrink-0 text-artbar-taupe transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <div>
        {content.locations.map((loc, i) => (
          <LocationCard key={loc.id} loc={loc} lang={lang} locationCopy={locationCopy} index={i} />
        ))}
      </div>

      {/* ── Colophon: operating company ────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div ref={operatingReveal.ref} className={`${WRAP} reveal ${operatingReveal.isVisible ? 'visible' : ''}`}>
          <div className="grid gap-8 border-y border-artbar-navy/15 py-10 md:grid-cols-12 md:items-center md:py-12">
            <div className="md:col-span-6">
              <p className="text-[12px] font-medium tracking-[0.16em] text-artbar-taupe"><JpText>{site.locationsPage.operating.title}</JpText></p>
              <p className="mt-4 text-lg font-semibold"><JpText>{site.locationsPage.operating.name}</JpText></p>
              <p className="mt-1 text-sm text-artbar-gray"><JpText>{site.locationsPage.operating.address}</JpText></p>
              <p className="mt-1 text-sm text-artbar-gray"><JpText>{site.locationsPage.operating.ceo}</JpText></p>
            </div>
            <p className="max-w-md text-[15px] leading-[1.9] text-artbar-gray md:col-span-6 md:justify-self-end md:text-right">
              <JpText>{site.locationsPage.operating.inquiryText}</JpText>{' '}
              <a href={`mailto:${site.locationsPage.operating.inquiryEmail}`} className="font-semibold text-artbar-navy underline decoration-artbar-taupe decoration-1 underline-offset-4 transition-colors hover:text-artbar-taupe">
                {site.locationsPage.operating.inquiryEmail}
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

function LocationCard({
  loc,
  lang,
  locationCopy,
  index,
}: {
  loc: Location;
  lang: 'en' | 'jp';
  locationCopy: JapaneseUiCopy['locations'];
  index: number;
}) {
  const reveal = useScrollReveal();
  const jp = lang === 'jp';
  const isFranchise = loc.isFranchise === true;
  const flip = index % 2 === 1;
  const directionsUrl = loc.mapUrl?.trim()
    ? loc.mapUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.addressJp)}`;
  const bookingDestination = getLocationBookingDestination(loc.id, lang);
  const name = studioDisplayName(jp ? loc.nameJp : loc.nameEn);
  return (
    <section
      id={`studio-${loc.id}`}
      ref={reveal.ref}
      className={`reveal scroll-mt-24 border-t border-artbar-navy/10 py-16 md:py-24 ${index % 2 ? 'bg-white' : ''} ${reveal.isVisible ? 'visible' : ''}`}
    >
      <div className={`${WRAP} grid items-start gap-10 lg:grid-cols-12 lg:gap-16`}>
        <div className={`relative lg:col-span-6 ${flip ? 'lg:order-2' : ''}`}>
          <Tilt max={3}>
            <div className="relative aspect-[4/3] overflow-hidden bg-artbar-light-taupe/40">
              <Image src={loc.image} alt={jp ? stripJpSentinel(loc.nameJp) : loc.nameEn} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <Hairline className="inset-3 md:inset-4" />
            </div>
          </Tilt>
          {/* Map, mounted like a second print */}
          <div className={`relative mt-5 h-44 overflow-hidden bg-artbar-light-taupe/30 md:h-52 ${flip ? 'lg:mr-16' : 'lg:ml-16'}`}>
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(loc.addressJp)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
              title={`${loc.nameEn} Map`}
              className="absolute inset-0 h-full w-full opacity-85 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
            />
            <div className="pointer-events-none absolute inset-2 border border-artbar-navy/10" aria-hidden />
          </div>
        </div>

        <div className={`lg:col-span-6 lg:pt-4 ${flip ? 'lg:order-1' : ''}`}>
          <h2 className={h2Class(lang)}>
            <JpText>{name}</JpText>
          </h2>
          {isFranchise && (
            <p className="mt-2 text-sm text-artbar-taupe"><JpText>{jp ? '（フランチャイズ）' : '(Franchise)'}</JpText></p>
          )}

          <dl className="mt-8 border-t border-artbar-navy/15">
            <div className="grid gap-2 border-b border-artbar-navy/10 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <dt className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe"><JpText>{locationCopy.locationAddressLabel}</JpText></dt>
              <dd className="text-[15px] leading-[1.85]"><JpText>{jp ? loc.addressJp : loc.addressEn}</JpText></dd>
            </div>
            <div className="grid gap-2 border-b border-artbar-navy/10 py-5 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <dt className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe"><JpText>{locationCopy.transitAccessLabel}</JpText></dt>
              <dd className="location-access-copy whitespace-pre-line text-[15px] leading-[1.85] text-artbar-gray"><JpText>{jp ? loc.accessJp : loc.accessEn}</JpText></dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            <a
              href={bookingDestination.href}
              onClick={() => trackBookingClick(`location_${loc.id}`)}
              className={`${PILL_TAUPE} w-full sm:w-auto`}
            >
              <CalendarDays size={17} className="shrink-0" aria-hidden />
              <JpText>{bookingDestination.hasStudioClasses
                ? (jp ? 'このスタジオのクラスを見る' : 'View Studio Classes')
                : (jp ? '大阪のスケジュールを見る' : 'View Osaka Schedule')}</JpText>
            </a>
            <TextLink href={directionsUrl} target="_blank" rel="noreferrer">
              <JpText>{locationCopy.directions}</JpText>
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
