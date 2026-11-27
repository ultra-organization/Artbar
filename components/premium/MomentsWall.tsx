'use client';

import React from 'react';
import Image from 'next/image';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Tilt } from './Paint';
import { WRAP, h2Class } from './styles';

export type Moment = { src: string; alt: string };

/**
 * A collage of real class photos: one large print and four smaller ones hung off-grid.
 * Phones get a swipeable filmstrip instead, so nothing is cropped to a sliver.
 */
export function MomentsWall({ lang, title, intro, photos, tone = 'light', className = '' }: {
  lang: 'en' | 'jp';
  title: React.ReactNode;
  intro?: React.ReactNode;
  photos: Moment[];
  tone?: 'light' | 'white';
  className?: string;
}) {
  const reveal = useScrollReveal();
  const [a, b, c, d, e] = photos;
  const Print = ({ p, cls, sizes, rotate = '' }: { p?: Moment; cls: string; sizes: string; rotate?: string }) =>
    p ? (
      <figure className={`group ${cls}`}>
        <Tilt max={4} className="h-full">
          <div className={`h-full bg-white p-2 shadow-[0_30px_60px_-34px_rgba(5,55,97,0.55)] md:p-2.5 ${rotate}`}>
            <div className="relative h-full overflow-hidden bg-artbar-light-taupe/40">
              <Image src={p.src} alt={p.alt} fill sizes={sizes} className="object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.05]" />
            </div>
          </div>
        </Tilt>
      </figure>
    ) : null;

  return (
    <section className={`relative overflow-hidden py-20 md:py-28 ${tone === 'white' ? 'bg-white' : 'bg-artbar-bg'} ${className}`}>
      <div ref={reveal.ref} className={`${WRAP} reveal ${reveal.isVisible ? 'visible' : ''}`}>
        <div className="max-w-2xl">
          <h2 className={h2Class(lang)}>{title}</h2>
          {intro && <p className="mt-5 text-[15px] leading-[1.95] text-artbar-gray md:text-base">{intro}</p>}
        </div>

        {/* Desktop collage */}
        <div className="relative mt-14 hidden h-[640px] md:block lg:h-[700px]">
          <Print p={a} cls="absolute left-0 top-0 h-[78%] w-[46%]" sizes="46vw" rotate="-rotate-[1.2deg]" />
          <Print p={b} cls="absolute left-[50%] top-[4%] h-[44%] w-[24%]" sizes="24vw" rotate="rotate-[1.5deg]" />
          <Print p={c} cls="absolute right-0 top-0 h-[52%] w-[22%]" sizes="22vw" rotate="-rotate-[0.8deg]" />
          <Print p={d} cls="absolute bottom-0 left-[38%] h-[44%] w-[30%]" sizes="30vw" rotate="rotate-[0.6deg]" />
          <Print p={e} cls="absolute bottom-[4%] right-[2%] h-[38%] w-[26%]" sizes="26vw" rotate="-rotate-[1.4deg]" />
        </div>

        {/* Phone filmstrip */}
        <div className="-mx-7 -mb-6 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-7 pb-12 pt-3 [scrollbar-width:none] sm:-mx-8 sm:px-8 md:hidden">
          {photos.map((p, i) => (
            <figure key={p.src} className={`relative aspect-[4/5] w-[74%] shrink-0 snap-center bg-white p-2 shadow-[0_24px_40px_-28px_rgba(5,55,97,0.55)] ${i % 2 ? 'rotate-[1deg]' : '-rotate-[1deg]'}`}>
              <div className="relative h-full overflow-hidden bg-artbar-light-taupe/40">
                <Image src={p.src} alt={p.alt} fill sizes="74vw" className="object-cover" />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
