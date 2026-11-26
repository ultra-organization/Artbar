'use client';

/**
 * Premium style kit (Nov 2026 design pass).
 *
 * The shared vocabulary of the "Original" direction, used by the home page and
 * every inner page: the mounted-print hairline, the turning ten-year seal, the
 * taupe-rule eyebrow, tracked Josefin headings, underlined text links, pill
 * CTAs, a photo hero with throwable paint, and a paintable closing band.
 * Artbar's own palette only (navy, taupe, light taupe, off-white, blue).
 */

import React, { useCallback, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { BrushStroke, DecoSplat, Magnetic, PAINT, PaintCanvas, SplatterLayer, Tilt } from './Paint';
import { PILL_GHOST_DARK, PILL_GHOST_LIGHT, PILL_NAVY, PILL_TAUPE, WRAP, h2Class } from './styles';

export { WRAP, WRAP_NARROW, h2Class, useH2, h3Class, PILL_BASE, PILL_TAUPE, PILL_NAVY, PILL_GHOST_LIGHT, PILL_GHOST_DARK } from './styles';

/** Page gutter: 28px on phones so copy clears the hairline mount, wider from tablet up. */

export const THROW_COLORS = [PAINT.lightTaupe, PAINT.taupe, PAINT.white, PAINT.blue];
export const BRUSH_COLORS = [
  { c: PAINT.taupe, jp: 'トープ', en: 'Taupe' },
  { c: PAINT.lightTaupe, jp: 'サンド', en: 'Sand' },
  { c: PAINT.white, jp: 'ホワイト', en: 'White' },
  { c: PAINT.blue, jp: 'ブルー', en: 'Blue' },
];

export function Stars({ className = '', size = 'h-3.5 w-3.5' }: { className?: string; size?: string }) {
  return (
    <span className={`inline-flex gap-[3px] text-artbar-taupe ${className}`} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={`${size} fill-current`}>
          <path d="M10 1.5l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L10 14.8l-5.4 2.9 1.2-5.9L1.4 7.7l6-.7z" />
        </svg>
      ))}
    </span>
  );
}

/** Rotating anniversary seal: tracked Josefin caps around a "10". */
export function Seal({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`aspect-square ${tone === 'light' ? 'text-white' : 'text-artbar-navy'} ${className}`} role="img" aria-label="Artbar Tokyo, est. 2016, tenth anniversary">
      <div className="relative h-full w-full">
        <svg viewBox="0 0 200 200" className="hp-spin absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <path id={id} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
          </defs>
          <text fill="currentColor" fontSize="11.5" fontFamily="var(--font-josefin)" fontWeight="600">
            <textPath href={`#${id}`} textLength="496" lengthAdjust="spacing">
              ARTBAR TOKYO · EST. 2016 · TENTH ANNIVERSARY ·
            </textPath>
          </text>
        </svg>
        <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full border border-current/40" aria-hidden>
          <span className="font-heading text-[2.6em] font-semibold leading-none tracking-tight">10</span>
          <span className="mt-1 font-heading text-[0.55em] font-semibold uppercase tracking-[0.35em] opacity-80">Years</span>
        </div>
      </div>
    </div>
  );
}

/** Eyebrow on a short taupe rule. Latin labels set in tracked Josefin caps. */
export function Eyebrow({ children, tone = 'dark', latin = false, className = '' }: { children: React.ReactNode; tone?: 'dark' | 'light'; latin?: boolean; className?: string }) {
  return (
    <p className={`flex items-center gap-4 ${tone === 'light' ? 'text-artbar-light-taupe' : 'text-artbar-taupe'} ${latin ? 'font-heading text-[11px] font-semibold uppercase tracking-[0.32em] md:text-xs' : 'text-[12px] font-medium tracking-[0.16em] md:text-[13px]'} ${className}`}>
      <span className="h-px w-10 shrink-0 bg-current opacity-80" aria-hidden />
      <span>{children}</span>
    </p>
  );
}


/** Underlined text link used for every secondary action. */
export function TextLink({ children, tone = 'dark', className = '', ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { tone?: 'dark' | 'light' }) {
  const toneClass = tone === 'light'
    ? 'border-white/40 text-white/90 hover:border-white hover:text-white focus-visible:outline-white'
    : 'border-artbar-navy/25 text-artbar-navy hover:border-artbar-navy focus-visible:outline-artbar-navy';
  return (
    <a {...rest} className={`group inline-flex min-h-11 items-center gap-2 border-b pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[15px] ${toneClass} ${className}`}>
      {children}
      <ArrowRight size={15} strokeWidth={2} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
    </a>
  );
}


/** Mounted-print hairline drawn just inside a band or photo. */
export function Hairline({ tone = 'light', className = 'inset-3 md:inset-6' }: { tone?: 'light' | 'dark' | 'taupe'; className?: string }) {
  const color = tone === 'light' ? 'border-white/20' : tone === 'taupe' ? 'border-artbar-taupe/35' : 'border-artbar-navy/15';
  return <div className={`pointer-events-none absolute z-[2] border ${color} ${className}`} aria-hidden />;
}

/** Photo with square corners and a hairline mount that brightens on hover. */
export function MountedPhoto({ src, alt, sizes, className = '', imgClassName = '', priority = false, children }: { src: string; alt: string; sizes: string; className?: string; imgClassName?: string; priority?: boolean; children?: React.ReactNode }) {
  return (
    <div className={`group/mp relative overflow-hidden bg-artbar-light-taupe/40 ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={`object-cover transition-transform duration-[1.4s] ease-out group-hover/mp:scale-[1.04] ${imgClassName}`} />
      <div className="pointer-events-none absolute inset-2.5 z-[1] border border-white/35 transition-colors duration-500 group-hover/mp:border-white/70 md:inset-3" aria-hidden />
      {children}
    </div>
  );
}

/** Heading block: optional eyebrow, title, intro. Left aligned by default. */
export function SectionHead({ lang, eyebrow, latin = false, title, intro, tone = 'dark', align = 'left', className = '', titleAs = 'h2' }: {
  lang: 'en' | 'jp';
  eyebrow?: React.ReactNode;
  latin?: boolean;
  title: React.ReactNode;
  intro?: React.ReactNode;
  tone?: 'dark' | 'light';
  align?: 'left' | 'center';
  className?: string;
  titleAs?: 'h1' | 'h2';
}) {
  const T = titleAs;
  const center = align === 'center';
  return (
    <div className={`${center ? 'mx-auto flex flex-col items-center text-center' : ''} max-w-3xl ${className}`}>
      {eyebrow && <Eyebrow tone={tone} latin={latin} className={center ? 'justify-center' : ''}>{eyebrow}</Eyebrow>}
      <T className={`${eyebrow ? 'mt-5' : ''} ${tone === 'light' ? 'text-white' : 'text-artbar-navy'} ${h2Class(lang)}`}>{title}</T>
      {intro && <div className={`mt-5 max-w-2xl text-[15px] leading-[1.95] md:text-base ${tone === 'light' ? 'text-white/75' : 'text-artbar-gray'}`}>{intro}</div>}
    </div>
  );
}

/**
 * Inner-page hero: full-bleed photo in the mounted-print hairline, the two-layer
 * wash, copy bottom-left, and paint you can throw. Shorter than the home hero so
 * the page's first section peeks above the fold.
 */
export function PageHero({ lang, image, mobileImage, alt, eyebrow, title, highlight, subtitle, actions, aside, footer, tall = false, objectPosition = 'center 40%', portrait = false }: {
  lang: 'en' | 'jp';
  image: string;
  mobileImage?: string;
  alt: string;
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  /** Optional second line set on a brush stroke. */
  highlight?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
  tall?: boolean;
  objectPosition?: string;
  /** Portrait photo: on desktop it hangs as a mounted print over a soft blur of itself, instead of being cropped to a strip. */
  portrait?: boolean;
}) {
  const heroRef = useRef<HTMLElement>(null);
  const [thrown, setThrown] = useState(false);
  const onFirst = useCallback(() => setThrown(true), []);
  const jp = lang === 'jp';
  const titleClass = jp
    ? 'text-[clamp(1.45rem,6.6vw,2.3rem)] leading-[1.45] tracking-[0.035em] md:text-[clamp(2.4rem,3.9vw,3.6rem)]'
    : 'font-heading text-[clamp(2.3rem,9.4vw,3.2rem)] leading-[1] tracking-[-0.02em] md:text-[clamp(3.2rem,5.6vw,5.2rem)]';
  return (
    <section ref={heroRef} className={`relative z-[1] w-full cursor-crosshair overflow-hidden bg-artbar-navy ${tall ? 'h-[100svh] min-h-[640px]' : 'h-[86svh] min-h-[600px] md:h-[88svh]'}`}>
      {portrait ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="hidden scale-110 object-cover opacity-55 blur-2xl md:block" aria-hidden />
          <Image src={mobileImage ?? image} alt={alt} fill priority sizes="100vw" className="hp-kb object-cover md:hidden" style={{ objectPosition }} />
        </>
      ) : mobileImage ? (
        <>
          <Image src={image} alt={alt} fill priority sizes="100vw" className="hp-kb hidden object-cover md:block" style={{ objectPosition }} />
          <Image src={mobileImage} alt={alt} fill priority sizes="100vw" className="hp-kb object-cover md:hidden" style={{ objectPosition }} />
        </>
      ) : (
        <Image src={image} alt={alt} fill priority sizes="100vw" className="hp-kb object-cover" style={{ objectPosition }} />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-artbar-navy via-artbar-navy/50 to-artbar-navy/5" aria-hidden />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-artbar-navy/70 via-artbar-navy/15 to-transparent md:block" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-artbar-taupe/50 to-transparent" aria-hidden />
      <SplatterLayer targetRef={heroRef} colors={THROW_COLORS} onFirst={onFirst} />
      <Hairline />
      {portrait && (
        <div className="hp-in absolute bottom-[12%] right-[6%] top-[17%] z-[2] hidden aspect-[3/4] md:block lg:right-[8%] xl:right-[10%]" style={{ animationDelay: '250ms' }}>
          <Tilt className="h-full" max={4}>
            <div className="h-full rotate-[1.6deg] bg-white p-2.5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.75)] lg:p-3.5">
              <div className="relative h-full overflow-hidden bg-artbar-light-taupe/40">
                <Image src={image} alt={alt} fill priority sizes="40vw" className="hp-kb object-cover" style={{ objectPosition }} />
              </div>
            </div>
          </Tilt>
          <div className="absolute -bottom-12 -left-16 hidden w-32 lg:block xl:w-36">
            <DecoSplat seed={2016} color={PAINT.taupe} className="-inset-[38%]" delay={700} opacity={0.92} />
            <Seal className="hp-in relative text-[13px]" />
          </div>
        </div>
      )}

      <div className={`${WRAP} absolute inset-x-0 bottom-0 z-[3] pb-10 md:pb-14`}>
        <div className="flex items-end justify-between gap-10">
          <div className={`min-w-0 text-white ${portrait ? 'max-w-[48rem] md:max-w-[48%] lg:max-w-[50%]' : 'max-w-[48rem]'}`}>
            {eyebrow && (
              <p className="hp-in flex items-center gap-3 text-[11px] tracking-[0.12em] text-artbar-light-taupe md:gap-4 md:text-[13px] md:tracking-[0.18em]" style={{ animationDelay: '150ms' }}>
                <span className="h-px w-6 shrink-0 bg-artbar-taupe md:w-10" aria-hidden />
                <span>{eyebrow}</span>
              </p>
            )}
            <h1 className={`hp-in relative isolate font-semibold text-white ${eyebrow ? 'mt-5 md:mt-6' : ''} ${titleClass}`} style={{ animationDelay: '300ms' }}>
              <span className="block">{title}</span>
              {highlight && (
                <span className="relative block w-fit">
                  <BrushStroke className="-bottom-[0.06em] left-[-2%] -z-10 h-[0.42em] w-[104%] opacity-80" />
                  <span className="relative">{highlight}</span>
                </span>
              )}
            </h1>
            {subtitle && (
              <div className="hp-in mt-5 max-w-xl text-[15px] leading-[1.9] text-white/80 md:mt-6 md:text-lg" style={{ animationDelay: '450ms' }}>
                {subtitle}
              </div>
            )}
            {actions && (
              <div className="hp-in mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-8 md:mt-9" style={{ animationDelay: '600ms' }}>
                {actions}
              </div>
            )}
          </div>
          <div className={`relative mb-2 hidden w-36 shrink-0 xl:w-40 ${portrait ? '' : 'lg:block'}`}>
            {aside ?? (
              <>
                <DecoSplat seed={2016} color={PAINT.taupe} className="-inset-[38%]" delay={700} opacity={0.92} />
                <Seal className="hp-in relative text-[14px]" />
              </>
            )}
            <p className={`hp-hint absolute -bottom-9 left-1/2 w-max -translate-x-1/2 text-[11px] tracking-[0.08em] text-white/70 ${thrown ? 'opacity-0' : 'opacity-100'}`}>
              {jp ? 'クリックで絵の具を飛ばせます' : 'Click anywhere to throw paint'}
            </p>
          </div>
        </div>
        {footer && (
          <div className="hp-in mt-8 border-t border-white/20 pt-5 md:mt-10" style={{ animationDelay: '800ms' }}>
            {footer}
          </div>
        )}
      </div>
    </section>
  );
}

/** Facts row for a hero footer: value over label, hairline separated. */
export function FactRail({ items, className = '' }: { items: { v: React.ReactNode; l: React.ReactNode }[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-2 gap-y-4 text-white md:flex md:gap-0 ${className}`}>
      {items.map((f, i) => (
        <div key={i} className={`flex min-w-0 flex-col-reverse gap-1 md:flex-1 ${i ? 'md:border-l md:border-white/15 md:pl-6' : ''} ${i % 2 ? 'border-l border-white/15 pl-4 md:pl-6' : ''}`}>
          <dt className="text-[11px] tracking-[0.06em] text-white/60 md:text-xs">{f.l}</dt>
          <dd className="text-[15px] font-semibold md:text-base">{f.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Closing navy band with the paintable surface: whatever the visitor drags or
 * hovers over the band leaves a stroke in the chosen brand colour.
 */
export function ClosingCta({ lang, title, body, actions, className = '' }: { lang: 'en' | 'jp'; title: React.ReactNode; body?: React.ReactNode; actions: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [brush, setBrush] = useState<string>(PAINT.taupe);
  const jp = lang === 'jp';
  return (
    <div className={`bg-artbar-bg pb-4 md:pb-6 ${className}`}>
      <section ref={ref} className="relative mx-4 overflow-hidden bg-artbar-navy text-white [touch-action:pan-y] md:mx-6">
        <PaintCanvas targetRef={ref} color={brush} />
        <Hairline className="inset-3 md:inset-5" />
        <div className={`${WRAP} relative z-[3] grid items-center gap-10 py-20 md:grid-cols-12 md:py-28`}>
          <div className="md:col-span-8">
            <h2 className={`relative isolate w-fit text-white ${h2Class(lang)}`}>
              {title}
            </h2>
            {body && <div className="mt-5 max-w-xl text-[15px] leading-[1.95] text-white/75 md:text-base">{body}</div>}
            <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">{actions}</div>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <p className="text-xs tracking-[0.08em] text-white/60">{jp ? '色を選んで、この画面をなぞって描いてみよう' : 'Pick a colour and paint across this panel'}</p>
            <div role="radiogroup" aria-label={jp ? '絵の具の色' : 'Paint colour'} className="mt-4 flex gap-3">
              {BRUSH_COLORS.map((b) => (
                <button
                  key={b.c}
                  type="button"
                  role="radio"
                  aria-checked={brush === b.c}
                  aria-label={jp ? b.jp : b.en}
                  onClick={() => setBrush(b.c)}
                  data-no-splat
                  className={`h-9 w-9 rounded-full border-2 transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${brush === b.c ? 'scale-110 border-white' : 'border-white/25 hover:scale-105'}`}
                  style={{ backgroundColor: b.c }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Magnetic taupe pill that runs an action (booking, inquiry). */
export function PrimaryAction({ children, onClick, href, className = '', tone = 'taupe' }: { children: React.ReactNode; onClick?: () => void; href?: string; className?: string; tone?: 'taupe' | 'navy' | 'ghostLight' | 'ghostDark' }) {
  const cls = tone === 'navy' ? PILL_NAVY : tone === 'ghostLight' ? PILL_GHOST_LIGHT : tone === 'ghostDark' ? PILL_GHOST_DARK : PILL_TAUPE;
  const inner = (
    <>
      <span>{children}</span>
      <ArrowRight size={17} strokeWidth={2.2} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
    </>
  );
  return (
    <Magnetic className="w-full sm:w-auto">
      {href ? (
        <a href={href} onClick={onClick} className={`${cls} w-full sm:w-auto ${className}`}>{inner}</a>
      ) : (
        <button type="button" onClick={onClick} className={`${cls} w-full sm:w-auto ${className}`}>{inner}</button>
      )}
    </Magnetic>
  );
}
