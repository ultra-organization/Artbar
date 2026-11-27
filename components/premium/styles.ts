/** Class-name helpers for the premium kit. No 'use client', so server components can call them. */

/** Page gutter: 28px on phones so copy clears the hairline mount, wider from tablet up. */
export const WRAP = 'mx-auto w-full max-w-[1320px] px-7 sm:px-8 md:px-12';
export const WRAP_NARROW = 'mx-auto w-full max-w-[880px] px-7 sm:px-8 md:px-12';
/** Section heading scale. JP uses the system gothic with open tracking; EN uses Josefin. */
export function h2Class(lang: 'en' | 'jp') {
  return lang === 'jp'
    ? 'font-semibold text-[clamp(1.5rem,6vw,2.1rem)] leading-[1.5] tracking-[0.04em] md:text-[clamp(2.1rem,3vw,2.75rem)]'
    : 'font-heading font-semibold text-[clamp(1.9rem,7.2vw,2.6rem)] leading-[1.08] tracking-[-0.015em] md:text-[clamp(2.6rem,3.8vw,3.6rem)]';
}
/** Kept for the home page, which was written against a hook name. */
export const useH2 = h2Class;

export function h3Class(lang: 'en' | 'jp') {
  return lang === 'jp'
    ? 'text-[17px] font-semibold leading-[1.6] tracking-[0.04em] md:text-lg'
    : 'font-heading text-xl font-semibold leading-snug md:text-[22px]';
}
export const PILL_BASE = 'group inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-9 text-[15px] font-bold tracking-[0.04em] transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 md:min-h-[3.75rem] md:text-base';
export const PILL_TAUPE = `${PILL_BASE} bg-artbar-taupe text-artbar-navy shadow-[0_18px_40px_-18px_rgba(163,147,132,0.9)] hover:bg-artbar-light-taupe focus-visible:outline-artbar-taupe`;
export const PILL_NAVY = `${PILL_BASE} bg-artbar-navy text-white hover:bg-artbar-blue focus-visible:outline-artbar-navy`;
export const PILL_GHOST_LIGHT = `${PILL_BASE} border border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:outline-white`;
export const PILL_GHOST_DARK = `${PILL_BASE} border border-artbar-navy/25 text-artbar-navy hover:border-artbar-navy hover:bg-artbar-navy/5 focus-visible:outline-artbar-navy`;
