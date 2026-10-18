'use client';

import React from 'react';
import Image from 'next/image';
import { CalendarDays, Navigation } from 'lucide-react';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useContent } from '../context/ContentContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { studioDisplayName } from '../lib/jp-display';
import { getLocationBookingDestination } from '../lib/location-booking';
import { trackBookingClick } from '../lib/analytics';
import type { Location } from '../types';
import type { JapaneseUiCopy } from '@/lib/copy/types';

export const Locations: React.FC = () => {
  const { lang, content, site, localizedCopy } = useContent();
  const locationCopy = localizedCopy.ui.locations;
  const operatingReveal = useScrollReveal();

  return (
    <div className="grain relative pt-24 md:pt-32 pb-16 md:pb-20 bg-artbar-bg min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        
        {/* Page Header */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-heading font-heavy text-artbar-navy mb-4"><JpText>{site.nav.locations}</JpText></h1>
          <p className="text-artbar-gray text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            <JpText>{locationCopy.intro}</JpText>
          </p>
        </div>

        <nav aria-label={lang === 'jp' ? 'スタジオを選ぶ' : 'Choose a studio'} className="mb-8 flex flex-wrap justify-center gap-2">
          {content.locations.map((loc) => <a key={loc.id} href={`#studio-${loc.id}`} className="inline-flex min-h-11 items-center rounded-full border border-artbar-taupe/50 bg-white px-4 text-sm focus-visible:outline-2 focus-visible:outline-artbar-navy"><JpText>{studioDisplayName(lang === 'en' ? loc.nameEn : loc.nameJp)}</JpText></a>)}
        </nav>
        <div className="space-y-12 md:space-y-16">
          {content.locations.map((loc) => (
            <LocationCard
              key={loc.id}
              loc={loc}
              lang={lang}
              locationCopy={locationCopy}
            />
          ))}
        </div>

        <div ref={operatingReveal.ref} className={`reveal mt-16 md:mt-24 pt-12 md:pt-16 border-t border-artbar-light-taupe/30 ${operatingReveal.isVisible ? 'visible' : ''}`}>
           <div className="bg-white border md:border-2 border-artbar-navy p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] max-w-4xl mx-auto text-center md:text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                 <div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-artbar-navy mb-4"><JpText>{site.locationsPage.operating.title}</JpText></h3>
                    <p className="font-bold text-base md:text-lg mb-1"><JpText>{site.locationsPage.operating.name}</JpText></p>
                    <p className="text-xs md:text-sm opacity-70 mb-1"><JpText>{site.locationsPage.operating.address}</JpText></p>
                    <p className="text-xs md:text-sm opacity-70"><JpText>{site.locationsPage.operating.ceo}</JpText></p>
                 </div>
                 <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                    <p className="max-w-sm text-sm md:text-base leading-relaxed text-artbar-gray md:text-right">
                       <JpText>{site.locationsPage.operating.inquiryText}</JpText>{' '}
                       <a
                         href={`mailto:${site.locationsPage.operating.inquiryEmail}`}
                         className="font-heading font-bold text-artbar-navy underline decoration-artbar-taupe decoration-2 underline-offset-4 transition-colors hover:text-artbar-taupe"
                       >
                         {site.locationsPage.operating.inquiryEmail}
                       </a>
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

function LocationCard({
  loc,
  lang,
  locationCopy,
}: {
  loc: Location;
  lang: 'en' | 'jp';
  locationCopy: JapaneseUiCopy['locations'];
}) {
  const reveal = useScrollReveal();
  const isFranchise = loc.isFranchise === true;
  const directionsUrl = loc.mapUrl?.trim()
    ? loc.mapUrl
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.addressJp)}`;
  const bookingDestination = getLocationBookingDestination(loc.id, lang);
  return (
            <div
              id={`studio-${loc.id}`}
              ref={reveal.ref}
              className={`reveal scroll-mt-28 bg-white rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 flex flex-col lg:flex-row group transition-all hover:shadow-xl ${reveal.isVisible ? 'visible' : ''}`}
            >
              <div className="lg:w-2/5 relative min-h-[220px] lg:min-h-full overflow-hidden">
                <Image 
                  src={loc.image} 
                  alt={lang === 'en' ? loc.nameEn : stripJpSentinel(loc.nameJp)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/50 to-transparent opacity-60 lg:opacity-30"></div>
              </div>

              {/* Details Section */}
              <div className="lg:w-3/5 p-6 md:p-12 flex flex-col">
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h2 className="text-2xl md:text-3xl font-heading font-bold text-artbar-navy leading-tight">
                      <JpText>{studioDisplayName(lang === 'en' ? loc.nameEn : loc.nameJp)}</JpText>
                      {isFranchise && (
                        <span className="mt-2 block text-sm font-normal text-artbar-taupe">
                          <JpText>{lang === 'en' ? '(Franchise)' : '（フランチャイズ）'}</JpText>
                        </span>
                      )}
                    </h2>
                 </div>

                 <div className="flex flex-col gap-2 mb-8 sm:flex-row sm:flex-wrap md:gap-3">
                    <a
                      href={bookingDestination.href}
                      onClick={() => trackBookingClick(`location_${loc.id}`)}
                      className="inline-flex min-h-[44px] max-w-full items-center justify-center gap-2 rounded-full bg-artbar-taupe px-5 pt-3 pb-2 text-center text-xs font-bold uppercase tracking-wide text-artbar-navy shadow-sm transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artbar-navy focus-visible:ring-offset-2 md:text-sm"
                    >
                      <CalendarDays size={14} className="shrink-0 md:w-4 md:h-4" aria-hidden />
                      <JpText>{bookingDestination.hasStudioClasses
                        ? (lang === 'en' ? 'View Studio Classes' : 'このスタジオのクラスを見る')
                        : (lang === 'en' ? 'View Osaka Schedule' : '大阪のスケジュールを見る')}</JpText>
                    </a>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[44px] max-w-full items-center justify-center gap-2 rounded-full border border-artbar-light-taupe bg-white px-5 pt-3 pb-2 text-center text-xs font-bold uppercase tracking-wide text-artbar-navy transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-artbar-navy focus-visible:ring-offset-2 md:text-sm"
                    >
                      <Navigation size={14} className="shrink-0 md:w-4 md:h-4" aria-hidden />
                      <JpText>{locationCopy.directions}</JpText>
                    </a>
                 </div>

                 {/* Address & Access */}
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
                    <div>
                        <span className="text-[9px] font-bold tracking-[0.2em] text-artbar-taupe uppercase block mb-2"><JpText>{locationCopy.locationAddressLabel}</JpText></span>
                        <p className="font-medium text-artbar-navy leading-relaxed text-sm">
                           <JpText>{lang === 'en' ? loc.addressEn : loc.addressJp}</JpText>
                        </p>
                    </div>
                    <div>
                        <span className="text-[9px] font-bold tracking-[0.2em] text-artbar-taupe uppercase block mb-2"><JpText>{locationCopy.transitAccessLabel}</JpText></span>
                        <p className="location-access-copy font-medium text-artbar-gray leading-relaxed text-sm whitespace-pre-line">
                           <JpText>{lang === 'en' ? loc.accessEn : loc.accessJp}</JpText>
                        </p>
                    </div>
                 </div>

                 {/* Mini Map */}
                 <div className="mt-auto h-40 md:h-48 w-full rounded-2xl overflow-hidden relative bg-gray-100 border border-gray-200">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(loc.addressJp)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      title={`${loc.nameEn} Map`}
                      className="absolute inset-0 w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                    ></iframe>
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-bold text-artbar-navy shadow-sm pointer-events-none uppercase tracking-widest">
                       Google Maps
                    </div>
                 </div>

              </div>
            </div>
  );
}
