'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React from 'react';
import Image from 'next/image';
import { PriceDisplay } from '../components/PriceDisplay';
import { cleanDisplayText } from '../lib/jp-display';
import { Button } from '../components/ui/Button';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useContent } from '../context/ContentContext';
import { HERO_BLUR_DATA_URL, PRIVATE_PARTY_INQUIRY_URL } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { YearEndHeroLink, YearEndPartySection } from '../components/YearEndPartySection';
import { Check, Clock, Wine, Palette, Utensils, Sparkles } from 'lucide-react';

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

  return (
    <div className="grain relative pt-28 md:pt-40 pb-20 bg-artbar-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="relative w-full max-w-5xl mx-auto mb-8 h-[30vh] min-h-[200px] rounded-[2.5rem] overflow-hidden md:mb-16 md:h-[40vh] bg-artbar-bg">
          <Image
            key={topHeroSrc || 'private-parties-hero'}
            src={topHeroSrc}
            alt={heroImageAlt}
            fill
            priority
            placeholder="blur"
            blurDataURL={HERO_BLUR_DATA_URL}
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 80vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-artbar-bg via-artbar-bg/40 to-transparent" />
        </div>

        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-20">
          <span className="text-artbar-taupe font-heading font-bold tracking-widest text-sm uppercase mb-6 block"><JpText>{privateParties.hero.badge}</JpText></span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-heavy text-artbar-navy mb-8 leading-tight">
            <span className="block"><JpText>{privateParties.hero.title}</JpText></span>
            <span className="text-artbar-taupe block"><JpText>{privateParties.hero.titleHighlight}</JpText></span>
          </h1>
          <p className="text-lg md:text-2xl text-artbar-gray leading-relaxed font-light">
            <JpText>{privateParties.hero.subtitle}</JpText>
          </p>
          <Button
            variant="taupe"
            size="cta"
            onClick={() => { window.location.href = withBrowserAcquisition(PRIVATE_PARTY_INQUIRY_URL); }}
            className="mt-8 w-full max-w-xs shadow-xl sm:w-auto"
          >
            <JpText>{privateParties.specialtyInquiry.cta}</JpText>
          </Button>
          <div className="mt-6 flex justify-center">
            <YearEndHeroLink kind="private" tone="light" />
          </div>
        </div>

        <YearEndPartySection
          kind="private"
          facts={yearEndFacts}
          feeNote={`+ ${common.venueFeeLabel} ${common.venueFeePrice}`}
        />

        <div
          ref={occasionsReveal.ref}
          className={`reveal grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 md:mb-24 ${occasionsReveal.isVisible ? 'visible' : ''}`}
        >
          {privateParties.occasions.map((item, idx) => (
            <div key={idx} className="group relative h-48 md:h-96 rounded-[2rem] overflow-hidden ">
              <Image
                src={item.image}
                alt={stripJpSentinel(item.title)}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-artbar-navy/20 group-hover:bg-artbar-navy/40 transition-colors"></div>
              <div className="absolute bottom-4 left-2 right-2 md:bottom-6 md:left-4 md:right-4">
                {cleanDisplayText(item.title) && <div className="bg-white/90 backdrop-blur-sm py-3 px-2 md:px-4 rounded-xl text-center shadow-lg">
                  <span className="font-heading font-bold text-artbar-navy text-sm md:text-base"><JpText>{item.title}</JpText></span>
                </div>}
              </div>
            </div>
          ))}
        </div>

        <div ref={pricingReveal.ref} className={`reveal grid lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(260px,0.7fr)] gap-8 mb-16 md:mb-24 ${pricingReveal.isVisible ? 'visible' : ''}`}>
            {/* Adult Pricing */}
            <div className="bg-white p-6 sm:p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-300 border border-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Wine size={120} className="text-artbar-navy" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                      <div>
                          <span className="text-artbar-taupe font-heading font-bold tracking-widest text-xs uppercase mb-2 block"><JpText>{standardLabel}</JpText></span>
                          <h3 className="text-3xl md:text-4xl font-heading font-heavy text-artbar-navy mb-2"><JpText>{privateParties.pricing.adult.title}</JpText></h3>
                          <p className="text-artbar-gray font-medium"><JpText>{privateParties.pricing.adult.subtitle}</JpText></p>
                      </div>
                  </div>

                  <PriceDisplay amount={privateParties.pricing.adult.price} suffix={priceSuffix} />

                  <div className="space-y-5 mb-8">
                      {privateParties.pricing.adult.items.map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-artbar-bg flex items-center justify-center text-artbar-taupe mt-1 flex-shrink-0"><Check size={14} strokeWidth={3} /></div>
                            <div>
                            <span className="font-heading font-bold text-artbar-navy block"><JpText>{item.title}</JpText></span>
                            <span className="text-base md:text-lg text-artbar-gray"><JpText>{item.desc}</JpText></span>
                            </div>
                        </div>
                      ))}
                  </div>

                  <div className="bg-artbar-bg p-4 sm:p-6 rounded-2xl mb-8 border border-artbar-light-taupe/20">
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="text-artbar-gray text-sm"><JpText>{privateParties.pricing.common.venueFeeLabel}</JpText></span>
                        <span className="font-heading font-bold text-artbar-navy">{privateParties.pricing.common.venueFeePrice}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-artbar-gray text-sm"><JpText>{privateParties.pricing.common.minGuestsLabel}</JpText></span>
                        <span className="font-heading font-bold text-artbar-navy"><JpText>{privateParties.pricing.common.minGuests}</JpText></span>
                      </div>
                  </div>

	                  <Button
	                    variant="primary"
	                    size="cta"
	                    onClick={() => { window.location.href = withBrowserAcquisition(PRIVATE_PARTY_INQUIRY_URL); }}
	                    className="w-full rounded-2xl text-base shadow-lg shadow-artbar-navy/20 transition-transform hover:scale-[1.01]"
                  >
                    <JpText>{privateParties.pricing.adult.cta}</JpText>
                  </Button>
                </div>
            </div>

            {/* Kids Pricing */}
             <div className="bg-artbar-bg border border-artbar-light-taupe/30 p-6 sm:p-8 rounded-[3rem] hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Palette size={120} className="text-artbar-taupe" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                       <div>
                          <span className="text-artbar-taupe font-heading font-bold tracking-widest text-xs uppercase mb-2 block"><JpText>{standardLabel}</JpText></span>
                          <h3 className="text-3xl md:text-4xl font-heading font-heavy text-artbar-navy mb-2"><JpText>{privateParties.pricing.kids.title}</JpText></h3>
                          <p className="text-artbar-gray font-medium"><JpText>{privateParties.pricing.kids.subtitle}</JpText></p>
                      </div>
                  </div>

                  <PriceDisplay amount={privateParties.pricing.kids.price} suffix={priceSuffix} />

                  <div className="space-y-5 mb-8">
                      {privateParties.pricing.kids.items.map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-artbar-taupe mt-1 flex-shrink-0"><Check size={14} strokeWidth={3} /></div>
                            <div>
                            <span className="font-heading font-bold text-artbar-navy block"><JpText>{item.title}</JpText></span>
                            <span className="text-base md:text-lg text-artbar-gray"><JpText>{item.desc}</JpText></span>
                            </div>
                        </div>
                      ))}
                  </div>

                  <div className="bg-white p-4 sm:p-6 rounded-2xl mb-8 border border-artbar-light-taupe/20">
                      <div className="flex flex-col gap-1 mb-4">
                        <span className="text-artbar-gray text-sm"><JpText>{privateParties.pricing.common.venueFeeLabel}</JpText></span>
                        <span className="font-heading font-bold text-artbar-navy">{privateParties.pricing.common.venueFeePrice}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-artbar-gray text-sm"><JpText>{privateParties.pricing.common.minGuestsLabel}</JpText></span>
                        <span className="font-heading font-bold text-artbar-navy"><JpText>{privateParties.pricing.common.minGuests}</JpText></span>
                      </div>
                  </div>

	                  <Button
	                    variant="primary"
	                    size="cta"
	                    onClick={() => { window.location.href = withBrowserAcquisition(PRIVATE_PARTY_INQUIRY_URL); }}
	                    className="w-full rounded-2xl text-base shadow-lg shadow-artbar-navy/20 transition-transform hover:scale-[1.01]"
                  >
                    <JpText>{privateParties.pricing.kids.cta}</JpText>
                  </Button>
                </div>
            </div>

            <div className="bg-white/70 border-2 border-artbar-taupe p-6 md:p-10 rounded-[2.5rem] shadow-sm lg:col-span-2 xl:col-span-1 xl:self-start">
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-artbar-navy mb-8 leading-tight">
                <JpText>{specialtyInquiry.title}</JpText>
              </h3>
              <ul className="space-y-3 mb-10">
                {specialtyInquiry.items.map((item) => (
                  <li key={item} className="text-lg font-heading font-bold text-artbar-navy leading-snug">
                    <JpText>{item}</JpText>
                  </li>
                ))}
              </ul>
              <p className="text-base md:text-lg text-artbar-gray leading-relaxed mb-8">
                <JpText>{specialtyInquiry.note}</JpText>
              </p>
              <Button
	                variant="taupe"
	                size="cta"
	                onClick={() => { window.location.href = withBrowserAcquisition(PRIVATE_PARTY_INQUIRY_URL); }}
	                className="w-full rounded-2xl text-base"
              >
                <JpText>{specialtyInquiry.cta}</JpText>
              </Button>
            </div>
        </div>

        <div ref={capacityReveal.ref} className={`reveal mb-16 md:mb-24 ${capacityReveal.isVisible ? 'visible' : ''}`}>
          <div className="flex items-center gap-4 mb-12">
             <div className="h-px bg-artbar-light-taupe flex-grow"></div>
             <h2 className="text-2xl md:text-3xl font-heading font-bold text-artbar-navy text-center px-4"><JpText>{privateParties.capacity.title}</JpText></h2>
             <div className="h-px bg-artbar-light-taupe flex-grow"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
             {localizedCopy.privatePartyCapacityRows.map((loc, i) => (
               <div key={i} className={`p-4 md:p-6 rounded-[2rem] text-center flex flex-col items-center justify-center min-h-[160px] md:min-h-[180px] ${loc.highlight ? 'bg-artbar-navy text-white' : 'bg-white text-artbar-navy'}`}>
                  <span className="text-3xl md:text-4xl font-heading font-bold mb-2">{loc.cap}</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60 mb-4"><JpText>{maxGuestsLabel}</JpText></span>
                  <h4 className="font-bold text-base md:text-lg leading-tight"><JpText>{loc.name[lang]}</JpText></h4>
                  <span className="text-sm md:text-base mt-2 opacity-80"><JpText>{loc.desc[lang]}</JpText></span>
               </div>
             ))}
          </div>
        </div>

        <div ref={timelineReveal.ref} className={`reveal bg-white rounded-[3rem] p-6 md:p-12 border border-artbar-bg shadow-sm ${timelineReveal.isVisible ? 'visible' : ''}`}>
           <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
              
              {/* Timeline */}
              <div>
	                 <h3 className="text-2xl font-heading font-bold text-artbar-navy mb-8 flex flex-col items-start gap-3">
	                    <Clock className="text-artbar-taupe" /> <JpText>{privateParties.timeline.title}</JpText>
	                 </h3>
                   <p className="mb-5 text-sm md:text-base font-bold text-artbar-taupe">
                     <JpText>{privateParties.timeline.note}</JpText>
                   </p>
	                 <div className="space-y-6 relative">
                    <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-artbar-bg"></div>
                    {privateParties.timeline.steps.map((step, i) => (
                       <div key={i} className="relative flex gap-3 items-start">
                          <div className="w-6 h-6 rounded-full bg-artbar-taupe border-4 border-white shadow-sm flex-shrink-0 relative z-10"></div>
                          <div>
                             <span className="text-xs font-bold text-artbar-gray bg-artbar-bg px-2 py-1 rounded mb-1 inline-block"><JpText>{step.time}</JpText></span>
                             <h4 className="font-bold text-artbar-navy"><JpText>{step.title}</JpText></h4>
                             <p className="text-base md:text-lg text-artbar-gray"><JpText>{step.desc}</JpText></p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Catering */}
              <div className="lg:bg-artbar-bg lg:rounded-[2.5rem] lg:p-8">
                  <h3 className="text-2xl font-heading font-bold text-artbar-navy mb-6 flex flex-col items-start gap-3">
                    <Utensils className="text-artbar-taupe" /> <JpText>{privateParties.catering.title}</JpText>
                  </h3>
                  <p className="text-artbar-navy leading-relaxed mb-6">
                    <JpText>{privateParties.catering.desc}</JpText>
                  </p>
                  <ul className="space-y-4 mb-8">
                     {privateParties.catering.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-base text-artbar-gray">
                            <Sparkles size={16} className="text-artbar-taupe mt-1 flex-shrink-0" />
                            <span><JpText>{item}</JpText></span>
                        </li>
                     ))}
                  </ul>
                    <ul className="mt-8 space-y-3">
                      {privateParties.catering.notes.map((note) => (
                        <li key={note} className="flex items-start gap-3 text-sm md:text-base font-bold text-artbar-taupe">
                          <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-artbar-taupe flex-shrink-0" />
                          <span><JpText>{note}</JpText></span>
                        </li>
                      ))}
                    </ul>
	              </div>

           </div>
        </div>

      </div>
    </div>
  );
};
