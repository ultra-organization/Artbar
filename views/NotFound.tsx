'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { JpText } from '../components/JpText';
import { useContent } from '../context/ContentContext';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { DecoSplat, PAINT, SplatterLayer, Magnetic } from '../components/premium/Paint';
import { Hairline, Seal } from '../components/premium/Kit';
import { PILL_NAVY } from '../components/premium/styles';

/** 404: an empty canvas on the easel. Click anywhere to throw paint at it. */
export const NotFound: React.FC = () => {
  const { lang, localizedCopy } = useContent();
  const ref = useRef<HTMLElement>(null);
  const jp = lang === 'jp';
  const copy = localizedCopy.ui.notFound;

  return (
    <section ref={ref} className="hp relative flex min-h-[100svh] cursor-crosshair items-center overflow-hidden bg-artbar-bg px-7 py-32 text-artbar-navy sm:px-8 md:px-12">
      <Hairline tone="dark" className="inset-3 md:inset-6" />
      <SplatterLayer targetRef={ref} colors={[PAINT.navy, PAINT.taupe, PAINT.blue, PAINT.lightTaupe]} />
      <DecoSplat seed={404} color={PAINT.lightTaupe} className="left-1/2 top-1/2 h-[min(120vw,640px)] w-[min(120vw,640px)] -translate-x-1/2 -translate-y-1/2" opacity={0.45} />
      <Seal tone="dark" className="absolute bottom-10 right-8 hidden w-28 text-[11px] md:block lg:bottom-14 lg:right-14 lg:w-32" />

      <div className="relative z-[2] mx-auto w-full max-w-[1320px]">
        <p className="hp-in font-heading text-[clamp(6.5rem,30vw,15rem)] font-semibold leading-[0.85] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1.5px_#053761] select-none" aria-hidden>
          404
        </p>
        <h1 className={`hp-in mt-8 max-w-2xl ${jp ? 'text-[clamp(1.5rem,6vw,2.4rem)] font-semibold leading-[1.5] tracking-[0.04em]' : 'font-heading text-[clamp(2rem,7vw,3.2rem)] font-semibold leading-[1.05]'}`} style={{ animationDelay: '120ms' }}>
          <JpText>{copy.title}</JpText>
        </h1>
        <p className="hp-in mt-5 max-w-lg text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]" style={{ animationDelay: '220ms' }}>
          <JpText>{copy.body}</JpText>
        </p>
        <div className="hp-in mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8" style={{ animationDelay: '320ms' }}>
          <Magnetic className="w-full sm:w-auto">
            <Link data-no-splat href={localizeHrefForLanguage('/', lang)} className={`${PILL_NAVY} w-full sm:w-auto`}>
              <JpText>{copy.cta}</JpText>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          </Magnetic>
          <p className="text-[12px] tracking-[0.12em] text-artbar-taupe">{jp ? 'クリックで絵の具を飛ばせます' : 'Click anywhere to throw some paint'}</p>
        </div>
      </div>
    </section>
  );
};
