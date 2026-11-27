'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { localizePath, siteLanguageToRouteLocale } from '../lib/locale-routing';
import { JpText } from '../components/JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useContent } from '../context/ContentContext';
import { WRAP } from '../components/premium/styles';
import { DecoSplat, PAINT, Tilt } from '../components/premium/Paint';

export const Instructors: React.FC = () => {
  const { content, site, lang } = useContent();

  const [language, setLanguage] = useState('all');
  const languages = Array.from(new Set(content.instructors.flatMap((item) => item.languages.split(',').map((value) => value.trim()).filter(Boolean)))).sort();
  const instructors = content.instructors.filter((item) => language === 'all' || item.languages.split(',').map((value) => value.trim()).includes(language));

  const jp = lang === 'jp';
  return (
    <div className="hp relative min-h-screen bg-artbar-bg pb-24 text-artbar-navy md:pb-32">
      <section className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-44">
        <DecoSplat seed={33} color={PAINT.lightTaupe} className="-right-20 top-20 h-72 w-72 md:right-[10%] md:h-96 md:w-96" opacity={0.5} />
        <div className={`${WRAP} relative`}>
          <h1 className={`hp-in max-w-4xl ${jp ? 'text-[clamp(2rem,8vw,3.6rem)] font-semibold leading-[1.35] tracking-[0.04em]' : 'font-heading text-[clamp(2.8rem,10vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.02em]'}`}>
            <JpText>{site.instructorsPage.title}</JpText>
          </h1>
          <p className="hp-in mt-6 max-w-2xl text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]" style={{ animationDelay: '150ms' }}>
            <JpText>{site.instructorsPage.subtitle}</JpText>
          </p>

          <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-b border-artbar-navy/15 pb-4">
            <div className="flex items-center gap-4">
              <label htmlFor="instructor-language" className="text-[12px] font-medium tracking-[0.14em] text-artbar-taupe">
                {jp ? '対応言語' : 'Language'}
              </label>
              <div className="relative">
                <select id="instructor-language" value={language} onChange={(event) => setLanguage(event.target.value)} className="min-h-11 cursor-pointer appearance-none bg-transparent pr-8 text-[15px] font-semibold text-artbar-navy outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy">
                  <option value="all">{jp ? 'すべての言語' : 'All languages'}</option>
                  {languages.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-artbar-taupe" />
              </div>
            </div>
            <p role="status" className="text-sm text-artbar-gray">{jp ? `${instructors.length}名の講師` : `${instructors.length} ${instructors.length === 1 ? 'instructor' : 'instructors'}`}</p>
          </div>
        </div>
      </section>

      <div className={`${WRAP} grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 md:gap-y-20`}>
        {instructors.map((instructor, i) => {
          const href = localizePath(`/instructors/${instructor.id}`, siteLanguageToRouteLocale(lang));
          return (
            <article key={instructor.id} className={`group relative flex flex-col ${i % 3 === 1 ? 'lg:mt-14' : ''}`}>
              <Link href={href} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy" tabIndex={-1} aria-hidden>
                <Tilt max={4}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-artbar-light-taupe/40">
                    <Image src={instructor.artworkImage} alt="" fill className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    <div className="pointer-events-none absolute inset-2.5 border border-white/40 transition-colors duration-500 group-hover:border-white/80 md:inset-3" aria-hidden />
                  </div>
                </Tilt>
              </Link>
              <div className="relative -mt-11 ml-5 h-[5.5rem] w-[5.5rem] shrink-0 overflow-hidden rounded-full border-[5px] border-artbar-bg bg-white">
                <Image src={instructor.profileImage} alt={stripJpSentinel(instructor.name)} fill className="object-cover" sizes="88px" />
              </div>
              <p className="mt-5 text-[12px] font-medium tracking-[0.14em] text-artbar-taupe"><JpText>{jp ? instructor.roleJp : instructor.roleEn}</JpText></p>
              <h2 className={`mt-2 ${jp ? 'text-xl font-semibold tracking-[0.04em]' : 'font-heading text-2xl font-semibold'}`}><JpText>{instructor.name}</JpText></h2>
              <p className="mt-1 text-[13px] text-artbar-gray">{instructor.languages}</p>
              <p className="mt-4 line-clamp-4 text-[14px] leading-[1.9] text-artbar-gray md:text-[15px]">
                <JpText>{jp ? instructor.descJp : instructor.descEn}</JpText>
              </p>
              <Link href={href} className="group/l mt-5 inline-flex min-h-11 w-fit items-center gap-2 border-b border-artbar-navy/25 pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors hover:border-artbar-navy focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy">
                {jp ? 'プロフィールを見る' : 'View profile'}
                <span className="sr-only">: {stripJpSentinel(instructor.name)}</span>
                <ArrowRight size={15} className="transition-transform duration-300 group-hover/l:translate-x-1" aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};
