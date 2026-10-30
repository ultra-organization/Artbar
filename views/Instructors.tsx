'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { localizePath, siteLanguageToRouteLocale } from '../lib/locale-routing';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useContent } from '../context/ContentContext';

export const Instructors: React.FC = () => {
  const { content, site, lang } = useContent();

  const [language, setLanguage] = useState('all');
  const languages = Array.from(new Set(content.instructors.flatMap((item) => item.languages.split(',').map((value) => value.trim()).filter(Boolean)))).sort();
  const instructors = content.instructors.filter((item) => language === 'all' || item.languages.split(',').map((value) => value.trim()).includes(language));

  return (
    <div className="grain relative pt-28 md:pt-40 pb-20 bg-artbar-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="-mx-3 sm:mx-0 text-4xl md:text-6xl lg:text-7xl font-heading font-heavy text-artbar-navy mb-6"><JpText>{site.instructorsPage.title}</JpText></h1>
          <p className="text-lg md:text-xl text-artbar-gray max-w-3xl mx-auto">
            <JpText>{site.instructorsPage.subtitle}</JpText>
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-h-12 w-full items-center rounded-full border border-artbar-taupe/40 bg-white px-4 text-artbar-navy transition-colors focus-within:border-artbar-navy focus-within:ring-2 focus-within:ring-artbar-navy/20 sm:w-auto">
            <label htmlFor="instructor-language" className="shrink-0 pr-4 text-sm font-bold text-artbar-gray">
              {lang === 'jp' ? '対応言語' : 'Language'}
            </label>
            <div className="relative min-w-0 flex-1 border-l border-artbar-taupe/30 sm:flex-none">
              <select id="instructor-language" value={language} onChange={(event) => setLanguage(event.target.value)} className="min-h-12 w-full min-w-[9.5rem] cursor-pointer appearance-none bg-transparent pl-4 pr-9 text-sm font-bold text-artbar-navy outline-none">
                <option value="all">{lang === 'jp' ? 'すべての言語' : 'All languages'}</option>
                {languages.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-artbar-taupe" />
            </div>
          </div>
          <p role="status" className="text-sm text-artbar-gray">{lang === 'jp' ? `${instructors.length}名の講師` : `${instructors.length} ${instructors.length === 1 ? 'instructor' : 'instructors'}`}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 md:gap-y-12">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="group bg-white rounded-[2.5rem] overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
              <div className="h-56 relative overflow-hidden bg-artbar-bg">
                 <div className="absolute inset-0 bg-artbar-navy/10 z-[1]"></div>
                 <Image
                   src={instructor.artworkImage}
                   alt={`${stripJpSentinel(instructor.name)}'s Art`}
                   fill
                   className="object-cover group-hover:scale-105 transition-transform duration-700"
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                 />
              </div>
              
              <div className="px-6 md:px-8 pb-8 relative flex-grow flex flex-col">
                 <div className="relative -mt-12 mb-6 flex flex-wrap gap-3 justify-between items-end">
                    <div className="w-24 h-24 shrink-0 rounded-full border-[6px] border-white overflow-hidden shadow-md bg-white relative">
                       <Image 
                         src={instructor.profileImage} 
                         alt={stripJpSentinel(instructor.name)}
                         width={128}
                         height={128}
                         className="object-cover"
                       />
                    </div>
                    
                     <span className="bg-artbar-bg text-artbar-navy text-xs font-heading font-bold px-4 py-2 rounded-full mb-2 inline-block border border-artbar-taupe/20">
                        {instructor.languages}
                     </span>
                 </div>

                 <div>
                    <div className="flex justify-between items-baseline mb-2 flex-wrap gap-2">
                       <h3 className="text-2xl font-heading font-bold text-artbar-navy"><JpText>{instructor.name}</JpText></h3>
                    </div>
                    <p className="text-sm font-bold text-artbar-taupe uppercase tracking-wider mb-4">
                        <JpText>{lang === 'en' ? instructor.roleEn : instructor.roleJp}</JpText>
                    </p>
                    <p className="text-artbar-gray leading-relaxed text-base md:text-lg">
                      <JpText>{lang === 'en' ? instructor.descEn : instructor.descJp}</JpText>
                    </p>
                    <Link href={localizePath(`/instructors/${instructor.id}`, siteLanguageToRouteLocale(lang))} className="mt-6 inline-flex min-h-11 items-center font-bold text-artbar-navy underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-artbar-navy">
                      {lang === 'jp' ? 'プロフィールを見る' : 'View profile'}
                      <span className="sr-only">: {stripJpSentinel(instructor.name)}</span>
                    </Link>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};