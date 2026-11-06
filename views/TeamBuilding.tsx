'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Button } from '../components/ui/Button';
import { CheckCircle, Briefcase, Users, Zap, Palette, Puzzle, Layers, Wine, MapPin, Coffee, ChevronDown, ChevronLeft, ChevronRight, Quote, ArrowRight, Sparkles } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { TEAM_BUILDING_ACTIVITY_IMAGES, PARTNER_LOGOS, HERO_BLUR_DATA_URL, TEAM_BUILDING_INQUIRY_URL } from '../constants';
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
  const { pricing, logistics } = site.teamBuilding;
  const offsiteRow = logisticsRows[logisticsRows.length - 1];
  const yearEndFacts = [
    { value: pricing.price, label: pricing.priceNote },
    { value: pricing.packageSubtitle, label: yearEndCopy.materialsLabel },
    { value: yearEndCopy.drinksValue, label: logistics.included.items[4] ?? '' },
    { value: offsiteRow?.cap[lang] ?? '', label: yearEndCopy.offsiteLabel },
  ];

  const formatEnglishActivityTitle = (title: string) => {
    if (lang !== 'en') return title;

    const [firstWord, ...rest] = title.trim().split(/\s+/);
    if (!firstWord || rest.length === 0) return title;
    return `${firstWord}\n${rest.join(' ')}`;
  };

  return (
    <div className="grain relative w-full bg-artbar-bg">
      <div className="relative min-h-[60vh] md:min-h-[75vh] bg-artbar-navy flex items-center justify-center text-white mt-24 mx-4 md:m-4 md:mt-24 rounded-[2.5rem] overflow-hidden py-14 md:py-16 lg:py-20">
        <Image
          key={teamHeroSrc}
          src={teamHeroSrc}
          alt={heroImageAlt}
          fill
          priority
          placeholder="blur"
          blurDataURL={HERO_BLUR_DATA_URL}
          className="object-cover opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-artbar-navy/20 to-artbar-navy/90"></div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl w-full">
          <span className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-heading font-bold text-xs md:text-sm mb-5 md:mb-6 uppercase tracking-widest">
             <JpText>{site.teamBuilding.hero.badge}</JpText>
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-heavy mb-6 md:mb-8 tracking-tight text-center flex flex-col items-center gap-1.5 md:gap-2">
            <span className="block text-white leading-[1.05] md:leading-[1.02]">
              <JpText>{site.teamBuilding.hero.title}</JpText>
            </span>
            <span className="block text-artbar-taupe leading-[1.05] md:leading-[1.02]">
              <JpText>{site.teamBuilding.hero.titleHighlight}</JpText>
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl opacity-90 mb-8 md:mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            <JpText>{site.teamBuilding.hero.subtitle}</JpText>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full px-4 sm:px-0">
            <Button
              variant="taupe"
              size="cta"
              onClick={() => { window.location.href = withBrowserAcquisition(TEAM_BUILDING_INQUIRY_URL); }}
              className="w-full shadow-xl sm:w-auto"
            >
               <JpText>{site.teamBuilding.hero.cta}</JpText>
            </Button>
          </div>
          <div className="mt-6 flex justify-center">
            <YearEndHeroLink kind="team" tone="dark" />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
        <p className="mx-auto mb-10 max-w-3xl text-center text-lg leading-relaxed text-artbar-navy"><JpText>{site.teamBuilding.hero.eventIntro}</JpText></p>
        <div
          ref={socialReveal.ref}
          className={`reveal mb-24 md:mb-32 ${socialReveal.isVisible ? 'visible' : ''}`}
        >
          <div className="mb-12 flex w-full items-center gap-4 md:mb-16">
            <div className="h-px flex-grow bg-artbar-navy/10" />
            <p className="min-w-0 px-2 text-center font-heading text-[10px] font-bold uppercase tracking-[0.2em] text-artbar-navy md:tracking-[0.4em] md:px-8 md:text-xs">
              <JpText>{site.teamBuilding.socialProof.title}</JpText>
            </p>
            <div className="h-px flex-grow bg-artbar-navy/10" />
          </div>

          <div className="mx-auto grid w-full max-w-7xl grid-cols-2 items-center justify-items-center gap-x-4 gap-y-6 sm:gap-x-8 sm:gap-y-10 md:grid-cols-7 md:gap-x-10 md:gap-y-14 lg:gap-x-12 lg:gap-y-16">
            {PARTNER_LOGOS.map((logo, i) => (
              <PartnerLogo key={i} {...logo} />
            ))}
          </div>
        </div>

        <YearEndPartySection
          kind="team"
          facts={yearEndFacts}
          feeNote={`+ ${pricing.feeLabel} ${pricing.feePrice}`}
        />

        <div
          ref={valueReveal.ref}
          className={`reveal bg-white rounded-[3rem] p-6 md:p-12 mb-16 md:mb-24 shadow-sm border border-white relative overflow-hidden ${valueReveal.isVisible ? 'visible' : ''}`}
        >
           <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
              <Briefcase size={400} />
           </div>

           <div className="grid gap-8 md:gap-12 relative z-10">
              <div className="max-w-3xl space-y-6">
                 <span className="text-artbar-taupe font-heading font-bold tracking-widest text-sm uppercase block"><JpText>{site.teamBuilding.valueProp.badge}</JpText></span>
                 <h2 className="text-3xl md:text-5xl font-heading font-heavy text-artbar-navy leading-tight whitespace-pre-line">
                    <JpText>{site.teamBuilding.valueProp.title}</JpText>
                 </h2>
                 <div className="space-y-6 text-base md:text-lg text-artbar-gray leading-relaxed">
                    <p><JpText>{site.teamBuilding.valueProp.p1}</JpText></p>
                    <p><JpText>{site.teamBuilding.valueProp.p2}</JpText></p>
                 </div>
              </div>

              {/* Benefits Grid */}
              <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                 {site.teamBuilding.valueProp.benefits.map((item, i) => {
                    const icons = [Layers, Zap, Users, Briefcase];
                    const Icon = icons[i] || Layers;
                    return (
                        <div key={i} className="bg-artbar-bg p-5 md:p-8 rounded-[2rem] hover:shadow-lg transition-shadow duration-300">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-artbar-taupe mb-4 shadow-sm">
                            <Icon size={24} />
                        </div>
                        <h4 className="font-heading font-bold text-artbar-navy text-xl mb-2"><JpText>{item.title}</JpText></h4>
                        <p className="text-base md:text-lg text-artbar-gray leading-relaxed"><JpText>{item.desc}</JpText></p>
                        </div>
                    );
                 })}
              </div>
           </div>
        </div>

        <div ref={activitiesReveal.ref} className={`reveal mb-16 ${activitiesReveal.isVisible ? 'visible' : ''}`}>
           <div className="flex flex-col md:flex-row justify-between items-end mb-12">
             <h2 className="text-3xl md:text-5xl font-heading font-bold text-artbar-navy max-w-xl"><JpText>{site.teamBuilding.activities.title}</JpText></h2>
             <p className="text-artbar-gray md:text-right max-w-md mt-4 md:mt-0"><JpText>{site.teamBuilding.activities.subtitle}</JpText></p>
           </div>
           
           <div className={`grid lg:grid-cols-3 gap-6 reveal-stagger ${activitiesReveal.isVisible ? 'visible' : ''}`}>
              {site.teamBuilding.activities.items.map((act, i) => {
                 const icons = [Puzzle, Users, Palette];
                 const Icon = icons[i] || Puzzle;
                 const activityImage = encodeURI(
                    act.image || TEAM_BUILDING_ACTIVITY_IMAGES[i] || TEAM_BUILDING_ACTIVITY_IMAGES[0]
                 );
                 return (
                    <div key={i} className="group relative h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden cursor-pointer">
                        <Image 
                        src={activityImage}
                        alt={stripJpSentinel(act.title)}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/90 via-artbar-navy/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 md:p-10 text-white">
                            <Icon size={40} className="mb-6 text-artbar-taupe" />
                            <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3 whitespace-pre-line">
                                <JpText>{formatEnglishActivityTitle(act.title)}</JpText>
                            </h3>
                            <p className="text-white/80 leading-relaxed mb-6 text-base md:text-lg opacity-100 max-h-40 md:opacity-0 md:max-h-0 md:mb-6 md:group-hover:opacity-100 md:group-hover:max-h-40 transition-all duration-500">
                                <JpText>{act.desc}</JpText>
                            </p>
                            <span className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-widest group-hover:text-artbar-taupe transition-colors">
                                <JpText>{act.link}</JpText> <ArrowRight size={16} />
                            </span>
                        </div>
                    </div>
                 );
              })}
           </div>
        </div>

        <div ref={specialtyReveal.ref} className={`reveal mb-24 md:mb-32 ${specialtyReveal.isVisible ? 'visible' : ''}`}>
           <div className="bg-artbar-taupe/10 border border-artbar-taupe/20 rounded-[3rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="md:w-1/2">
                 <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-artbar-taupe" size={24} />
                    <span className="text-artbar-taupe font-heading font-bold tracking-widest text-sm uppercase"><JpText>{site.teamBuilding.specialty.badge}</JpText></span>
                 </div>
                 <h3 className="text-3xl md:text-4xl font-heading font-heavy text-artbar-navy mb-4 whitespace-pre-line">
                    <JpText>{site.teamBuilding.specialty.title}</JpText>
                 </h3>
                 <p className="text-artbar-gray mb-8 max-w-md">
                    <JpText>{site.teamBuilding.specialty.desc}</JpText>
                 </p>
              </div>
              <div className="md:w-1/2 flex justify-end w-full">
                 <Button
	                    variant="primary"
	                    size="cta"
	                    onClick={() => { window.location.href = withBrowserAcquisition(TEAM_BUILDING_INQUIRY_URL); }}
	                    className="w-full rounded-2xl text-base shadow-lg md:w-auto"
                 >
                    <JpText>{site.teamBuilding.specialty.cta}</JpText>
                 </Button>
              </div>
           </div>
        </div>

        <div ref={testimonialsReveal.ref} className={`reveal mb-24 md:mb-32 relative bg-white border border-gray-200 rounded-[3rem] p-8 md:p-20 overflow-hidden ${testimonialsReveal.isVisible ? 'visible' : ''}`}>
            <div className="absolute top-0 right-0 p-20 opacity-5">
               <Quote size={200} className="text-artbar-navy" />
            </div>
            
            <div className="flex justify-between items-end mb-12 relative z-10">
               <h2 className="text-3xl md:text-4xl font-heading font-bold text-artbar-navy"><JpText>{site.teamBuilding.testimonials.title}</JpText></h2>
               <div className="hidden md:flex gap-2">
                  <button type="button" onClick={() => scroll('left')} className="min-w-[44px] min-h-[44px] w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-artbar-bg text-artbar-navy transition-colors" aria-label={previousTestimonialLabel}><ChevronLeft size={20} /></button>
                  <button type="button" onClick={() => scroll('right')} className="min-w-[44px] min-h-[44px] w-12 h-12 rounded-full bg-artbar-navy text-white flex items-center justify-center hover:bg-opacity-90 transition-colors" aria-label={nextTestimonialLabel}><ChevronRight size={20} /></button>
               </div>
            </div>
            
            <div className="relative z-10">
               <div ref={scrollRef} className="flex overflow-x-auto gap-8 pb-4 hide-scrollbar snap-x snap-mandatory touch-pan-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                  {teamTestimonials.map((t, i) => (
                    <div key={i} className="flex-shrink-0 w-full sm:w-[300px] md:w-[500px] snap-start">
                       <p className="text-artbar-navy text-lg md:text-2xl leading-relaxed mb-8 font-light italic">&ldquo;<JpText>{t.text}</JpText>&rdquo;</p>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-artbar-taupe rounded-full flex items-center justify-center text-white font-heading font-bold text-lg">{t.author.charAt(0)}</div>
                          <p className="font-heading font-bold text-artbar-navy text-sm uppercase tracking-wider"><JpText>{t.author}</JpText></p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
        </div>

        <div ref={logisticsReveal.ref} className={`reveal grid lg:grid-cols-2 gap-8 mb-24 md:mb-32 ${logisticsReveal.isVisible ? 'visible' : ''}`}>
           <div className="bg-artbar-bg border border-artbar-light-taupe/30 p-8 md:p-12 rounded-[3rem]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-artbar-taupe shadow-sm"><Wine size={32} /></div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-artbar-navy mb-6"><JpText>{site.teamBuilding.logistics.included.title}</JpText></h3>
              <p className="text-artbar-gray mb-8 text-base md:text-lg"><JpText>{site.teamBuilding.logistics.included.desc}</JpText></p>
              <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8">
                 {site.teamBuilding.logistics.included.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-artbar-navy font-medium text-sm md:text-base">
                        <CheckCircle size={20} className="text-artbar-taupe flex-shrink-0" /> <JpText>{item}</JpText>
                    </div>
                 ))}
              </div>
              <div className="mt-8 pt-8 border-t border-artbar-light-taupe/30">
                 <h4 className="font-bold text-artbar-navy mb-2 flex items-center gap-2"><Coffee size={18}/> <JpText>{site.teamBuilding.logistics.catering.title}</JpText></h4>
                 <p className="text-artbar-gray text-sm"><JpText>{site.teamBuilding.logistics.catering.desc}</JpText></p>
              </div>
           </div>

           <div className="bg-artbar-bg border border-artbar-light-taupe/30 p-8 md:p-12 rounded-[3rem]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 text-artbar-blue shadow-sm"><MapPin size={32} /></div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-artbar-navy mb-6"><JpText>{site.teamBuilding.logistics.locations.title}</JpText></h3>
              <p className="text-artbar-gray mb-8 text-base md:text-lg"><JpText>{site.teamBuilding.logistics.locations.desc}</JpText></p>
              <div className="space-y-4">
                 {logisticsRows.map((row, i) => (
                   <div
                     key={i}
                     className={`bg-white p-4 rounded-xl flex justify-between items-center ${i === logisticsRows.length - 1 ? 'border border-artbar-taupe/30' : ''}`}
                   >
                     <span className="font-heading font-bold text-artbar-navy text-sm md:text-base"><JpText>{row.name[lang]}</JpText></span>
                     <span className={`text-xs md:text-sm px-3 py-1 rounded-full ${i === logisticsRows.length - 1 ? 'bg-artbar-taupe text-white' : 'bg-artbar-bg text-artbar-navy'}`}>
                       <JpText>{row.cap[lang]}</JpText>
                     </span>
                   </div>
                 ))}
              </div>
              <p className="text-center text-artbar-gray mt-6 text-sm"><JpText>{site.teamBuilding.logistics.locations.note}</JpText></p>
           </div>
        </div>

        <div ref={pricingReveal.ref} className={`reveal bg-artbar-navy text-white rounded-[3rem] p-6 md:p-12 relative overflow-hidden shadow-2xl ${pricingReveal.isVisible ? 'visible' : ''}`}>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-artbar-taupe font-bold tracking-widest uppercase text-sm mb-4 block"><JpText>{site.teamBuilding.pricing.badge}</JpText></span>
                <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6"><JpText>{site.teamBuilding.pricing.title}</JpText></h2>
                <p className="text-lg text-artbar-light-taupe mb-10 leading-relaxed max-w-md"><JpText>{site.teamBuilding.pricing.desc}</JpText></p>
              </div>
              <div className="bg-white/5 p-4 sm:p-6 md:p-8 rounded-[2.5rem] backdrop-blur-sm border border-white/10">
                <div className="flex flex-col gap-8">
                   <div className="flex flex-col items-start gap-4 border-b border-white/10 pb-6">
                      <div>
                        <span className="mb-2 inline-flex rounded-sm bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-artbar-navy">
                          <JpText>{site.teamBuilding.pricing.packageBadge}</JpText>
                        </span>
                        <p className="font-heading font-bold text-xl md:text-2xl"><JpText>{site.teamBuilding.pricing.packageTitle}</JpText></p>
                        <p className="text-sm text-artbar-light-taupe mt-1"><JpText>{site.teamBuilding.pricing.packageSubtitle}</JpText></p>
                      </div>
                      <div className="text-left"><p className="whitespace-nowrap text-3xl md:text-4xl font-heading font-bold">{site.teamBuilding.pricing.price}</p><p className="text-xs opacity-60"><JpText>{site.teamBuilding.pricing.priceNote}</JpText></p></div>
                   </div>
                   <div className="space-y-4">
                      <div className="flex flex-wrap justify-between gap-3 text-sm"><span className="opacity-80"><JpText>{site.teamBuilding.pricing.feeLabel}</JpText></span><span className="font-bold">{site.teamBuilding.pricing.feePrice}</span></div>
                      <div className="flex flex-wrap justify-between gap-3 text-sm"><span className="opacity-80"><JpText>{site.teamBuilding.pricing.offsiteLabel}</JpText></span><span className="font-bold">{site.teamBuilding.pricing.offsitePrice}</span></div>
                   </div>
                   <details className="group border-t border-white/10 pt-5 text-left">
                     <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white/90 marker:content-none">
                       <JpText>{site.teamBuilding.pricing.termsTitle}</JpText>
                       <ChevronDown size={18} className="shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                     </summary>
                     <div className="space-y-3 pb-1 pt-3 text-sm leading-relaxed text-white/70">
                       <p><JpText>{site.teamBuilding.pricing.termsPayment}</JpText></p>
                       <p><JpText>{site.teamBuilding.pricing.termsCancellation}</JpText></p>
                       <p><JpText>{site.teamBuilding.pricing.termsHeadcount}</JpText></p>
                     </div>
                   </details>
                   <Button
	                     variant="taupe"
	                     size="cta"
	                     onClick={() => { window.location.href = withBrowserAcquisition(TEAM_BUILDING_INQUIRY_URL); }}
	                     className="mt-4 w-full rounded-xl text-base hover:bg-white hover:text-artbar-navy"
                   >
                     <JpText>{bookTeamCta}</JpText>
                   </Button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
