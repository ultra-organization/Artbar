'use client';

import React, { useId } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import { stripJpSentinel } from '../lib/jp-attr';
import { formatGuestCountDisplay } from '../lib/guest-count';

/**
 * Hero direction pitches. Every direction uses only Artbar's own colours
 * (navy, taupe, light taupe, off-white), Josefin Sans, the real logo, the
 * real hero footage (stills here) and the live copy.
 */

const PHOTO_D = '/media/preview/hero-13.jpg';
const PHOTO_M = '/media/preview/hero-m12.jpg';

function useHeroCopy() {
  const { site, lang } = useContent();
  const h = site.home.hero;
  const jp = lang === 'jp';
  const count = formatGuestCountDisplay(lang);
  return {
    jp,
    badge: stripJpSentinel(h.badge).replace(/[「」]/g, ''),
    title: stripJpSentinel(h.title),
    title2: stripJpSentinel(h.titleHighlight),
    subtitle: stripJpSentinel(h.subtitle).replace(/<wbr\s*\/?>/gi, ''),
    cta: stripJpSentinel(h.ctaSchedule),
    find: stripJpSentinel(h.ctaFindPainting),
    rating: h.ratingScore,
    count,
    guests: jp ? `${count}名が体験` : `${count}+ guests`,
    tagline: jp ? '2016年創業・日本初のペイント＆シップスタジオ' : "Japan's first paint & sip studio, est. 2016",
    price: jp ? '¥4,620〜' : '¥4,620+',
    priceNote: jp ? 'ドリンク・画材込み' : 'drinks & materials included',
    duration: jp ? '約2時間' : 'About 2 hours',
    areas: jp ? '代官山・原宿・銀座・横浜' : 'Daikanyama · Harajuku · Ginza · Yokohama',
    beginner: jp ? '初心者OK' : 'Beginners welcome',
    handsFree: jp ? '手ぶらOK' : 'Nothing to bring',
    drinks: jp ? 'フリードリンク込み' : 'Free-flow drinks',
    nav: jp
      ? ['スケジュール', 'チームビルディング', 'プライベートパーティー', 'スタジオアクセス', 'ギフト券']
      : ['Schedule', 'Team Building', 'Private Parties', 'Studios', 'Gifts'],
    navCta: stripJpSentinel(site.nav.book),
  };
}

type Copy = ReturnType<typeof useHeroCopy>;

function Stars({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex gap-[3px] ${className}`} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-current">
          <path d="M10 1.5l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L10 14.8l-5.4 2.9 1.2-5.9L1.4 7.7l6-.7z" />
        </svg>
      ))}
    </span>
  );
}

/** Rotating anniversary seal: ring of tracked Josefin caps around a "10". */
function Seal({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const id = useId().replace(/:/g, '');
  const ink = tone === 'light' ? 'text-white' : 'text-artbar-navy';
  return (
    <div className={`aspect-square ${ink} ${className}`} aria-label="10th anniversary, est. 2016">
      <div className="relative h-full w-full">
      <svg viewBox="0 0 200 200" className="lab-spin absolute inset-0 h-full w-full">
        <defs>
          <path id={id} d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
        </defs>
        <text fill="currentColor" fontSize="11.5" fontFamily="var(--font-josefin)" fontWeight="600">
          <textPath href={`#${id}`} textLength="500" lengthAdjust="spacing">
            ARTBAR TOKYO · EST. 2016 · TENTH ANNIVERSARY ·
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full border border-current/40">
        <span className="font-heading text-[2.6em] font-semibold leading-none tracking-tight">10</span>
        <span className="mt-1 font-heading text-[0.55em] font-semibold uppercase tracking-[0.35em] opacity-80">Years</span>
      </div>
      </div>
    </div>
  );
}

function Nav({ c, tone }: { c: Copy; tone: 'light' | 'dark' }) {
  const light = tone === 'light';
  return (
    <div className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-5 pt-5 md:px-12 md:pt-8">
      <img src={light ? '/brand/artbar-logo-light.png' : '/brand/artbar-logo-dark.png'} alt="Artbar Tokyo" className="h-8 w-auto md:h-10" />
      <div className={`hidden items-center gap-8 xl:flex ${light ? 'text-white/85' : 'text-artbar-navy/80'}`}>
        {c.nav.map((n) => (
          <span key={n} className={`${c.jp ? 'text-[13px] tracking-[0.08em]' : 'font-heading text-[13px] font-semibold uppercase tracking-[0.16em]'}`}>{n}</span>
        ))}
      </div>
      <div className="flex items-center gap-5">
        <span className={`hidden font-heading text-xs font-semibold tracking-[0.2em] md:inline ${light ? 'text-white/70' : 'text-artbar-navy/60'}`}>JP / EN</span>
        <span className="hidden rounded-full bg-artbar-taupe px-5 py-2.5 text-[13px] font-bold text-artbar-navy md:inline-flex">{c.navCta}</span>
        <span className={`flex h-10 w-10 flex-col items-center justify-center gap-1.5 xl:hidden ${light ? 'text-white' : 'text-artbar-navy'}`} aria-hidden>
          <span className="h-px w-6 bg-current" /><span className="h-px w-6 bg-current" />
        </span>
      </div>
    </div>
  );
}

function PrimaryCta({ c, className = '' }: { c: Copy; className?: string }) {
  return (
    <span className={`group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-artbar-taupe px-9 text-[15px] font-bold tracking-[0.04em] text-artbar-navy shadow-[0_18px_40px_-18px_rgba(163,147,132,0.9)] md:h-[3.75rem] md:text-base ${className}`}>
      {c.cta}
      <ArrowRight size={17} strokeWidth={2.2} />
    </span>
  );
}

/* ─────────────────────────── 1. The Original ─────────────────────────── */
function HeroOriginal({ c }: { c: Copy }) {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-artbar-navy">
      <picture>
        <source media="(min-width: 768px)" srcSet={PHOTO_D} />
        <img src={PHOTO_M} alt="" className="lab-kenburns absolute inset-0 h-full w-full object-cover object-[center_30%]" />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy via-artbar-navy/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-artbar-taupe/55 via-transparent to-transparent [mask-image:linear-gradient(to_bottom,black,transparent_40%)]" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-artbar-navy/70 via-artbar-navy/10 to-transparent md:block" />
      {/* Picture-mount hairline */}
      <div className="pointer-events-none absolute inset-3 border border-white/20 md:inset-6" />

      <Nav c={c} tone="light" />

      <div className="absolute inset-x-0 bottom-0 z-10 mx-auto max-w-[1400px] px-6 pb-8 md:px-14 md:pb-12">
        <div className="flex items-end justify-between gap-10">
          <div className="min-w-0 max-w-[46rem] text-white">
            <p className="lab-in flex items-center gap-3 text-[11px] tracking-[0.1em] text-artbar-light-taupe md:gap-4 md:text-[13px] md:tracking-[0.18em]" style={{ animationDelay: '150ms' }}>
              <span className="h-px w-6 shrink-0 bg-artbar-taupe md:w-10" />
              <span className={c.jp ? '' : 'font-heading font-semibold uppercase'}>{c.tagline}</span>
            </p>
            <h1 className={`lab-in mt-5 font-semibold text-white md:mt-7 ${c.jp ? 'text-[clamp(1.5rem,7.3vw,2.6rem)] leading-[1.38] tracking-[0.03em] md:text-[clamp(2.75rem,4.6vw,4.4rem)]' : 'font-heading text-[clamp(2.6rem,10vw,3.4rem)] leading-[0.98] tracking-[-0.02em] md:text-[clamp(3.5rem,6.4vw,6rem)]'}`} style={{ animationDelay: '300ms' }}>
              <span className="block whitespace-nowrap">{c.title}</span>
              <span className="block whitespace-nowrap">{c.title2}</span>
            </h1>
            <p className="lab-in mt-5 max-w-xl text-[15px] leading-[1.9] text-white/80 md:mt-6 md:text-lg" style={{ animationDelay: '450ms' }}>{c.subtitle}</p>
            <div className="lab-in mt-7 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8 md:mt-9" style={{ animationDelay: '600ms' }}>
              <PrimaryCta c={c} className="w-full sm:w-auto" />
              <span className="inline-flex items-center gap-2 border-b border-white/40 pb-1 text-sm font-medium text-white/90 md:text-[15px]">{c.find}<ArrowRight size={14} /></span>
            </div>
          </div>
          <Seal className="lab-in relative mb-2 hidden w-40 shrink-0 text-[15px] lg:block xl:w-44" />
        </div>

        {/* Facts rail: rating, guests, price, duration, studios */}
        <div className="lab-in mt-8 hidden grid-cols-5 border-t border-white/20 pt-5 text-white md:mt-10 md:grid" style={{ animationDelay: '800ms' }}>
          {[
            [<span key="r" className="flex items-center gap-2.5"><Stars className="text-artbar-taupe" /><span className="font-heading text-lg font-semibold">{c.rating}</span></span>, c.jp ? 'Google 口コミ' : 'Google reviews'],
            [<span key="g" className="font-heading text-lg font-semibold tabular-nums">{c.count}</span>, c.jp ? '名が体験' : 'guests so far'],
            [<span key="p" className="font-heading text-lg font-semibold">{c.price}</span>, c.priceNote],
            [<span key="d" className="text-[15px] font-semibold">{c.duration}</span>, c.jp ? '所要時間' : 'per session'],
            [<span key="a" className="text-[15px] font-semibold">{c.jp ? '4スタジオ' : '4 studios'}</span>, c.areas],
          ].map(([v, l], i) => (
            <div key={i} className={`flex flex-col gap-1 ${i ? 'border-l border-white/15 pl-6' : ''}`}>
              {v}
              <span className="text-xs tracking-[0.06em] text-white/60">{l}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-3 text-xs text-white/75 md:hidden">
          <Stars className="text-artbar-taupe" /><span className="font-heading font-semibold text-white">{c.rating}</span><span className="text-white/40">|</span><span>{c.guests}</span><span className="text-white/40">|</span><span>{c.price}</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 2. Gallery ─────────────────────────── */
function HeroGallery({ c }: { c: Copy }) {
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-artbar-bg">
      <Nav c={c} tone="dark" />
      {/* Vertical spine */}
      <p className="absolute left-5 top-1/2 hidden -translate-y-1/2 font-heading text-[11px] font-semibold uppercase tracking-[0.5em] text-artbar-taupe [writing-mode:vertical-rl] rotate-180 lg:block">Since 2016 — Japan's first paint &amp; sip</p>

      <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-6 pb-12 pt-10 md:px-14 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-12 lg:gap-12 lg:pb-16 lg:pt-6">
        <div className="lab-in lg:col-span-5" style={{ animationDelay: '200ms' }}>
          <p className="flex items-baseline gap-3 text-artbar-taupe">
            <span className="font-heading text-[13px] font-semibold uppercase tracking-[0.3em]">No.</span>
            <span className="font-heading text-5xl font-semibold leading-none text-artbar-navy">10</span>
            <span className="ml-1 text-[13px] tracking-[0.12em]">{c.badge}</span>
          </p>
          <div className="my-7 h-px w-full bg-artbar-navy/15" />
          <h1 className={`font-semibold text-artbar-navy ${c.jp ? 'text-[clamp(1.5rem,7.2vw,2.4rem)] leading-[1.42] tracking-[0.04em] md:text-[clamp(2.2rem,2.85vw,2.9rem)]' : 'font-heading text-[clamp(2.6rem,9vw,3.4rem)] leading-[1] tracking-[-0.02em] md:text-[clamp(3.2rem,5vw,5rem)]'}`}>
            <span className="block whitespace-nowrap">{c.title}</span>
            <span className="block whitespace-nowrap">{c.title2}</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]">{c.subtitle}</p>
          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <PrimaryCta c={c} className="w-full sm:w-auto" />
            <span className="inline-flex items-center gap-2 border-b border-artbar-navy/30 pb-1 text-sm font-medium text-artbar-navy">{c.find}<ArrowRight size={14} /></span>
          </div>
          <div className="mt-9 flex items-center gap-3 text-[13px] text-artbar-navy/70">
            <Stars className="text-artbar-taupe" />
            <span className="font-heading text-base font-semibold text-artbar-navy">{c.rating}</span>
            <span className="h-3 w-px bg-artbar-navy/20" />
            <span>{c.guests}</span>
          </div>
        </div>

        <div className="lab-in relative lg:col-span-7" style={{ animationDelay: '350ms' }}>
          {/* Framed "painting": navy hairline frame, white mat */}
          <div className="relative bg-white p-3 shadow-[0_40px_90px_-40px_rgba(5,55,97,0.45)] ring-1 ring-artbar-navy/10 md:p-6">
            <div className="relative aspect-[4/5] overflow-hidden md:aspect-[16/11]">
              <picture>
                <source media="(min-width: 768px)" srcSet={PHOTO_D} />
                <img src={PHOTO_M} alt="" className="lab-kenburns absolute inset-0 h-full w-full object-cover" />
              </picture>
            </div>
          </div>
          {/* Museum label */}
          <div className="relative -mt-10 ml-auto mr-4 w-[15.5rem] bg-white px-5 py-4 text-artbar-navy shadow-[0_18px_40px_-20px_rgba(5,55,97,0.35)] ring-1 ring-artbar-navy/10 md:-mt-14 md:mr-[-1.5rem] md:w-[17rem]">
            <p className="font-heading text-[15px] font-semibold">Artbar Tokyo, <span className="italic font-normal">2016–</span></p>
            <p className="mt-1 text-[12px] leading-relaxed text-artbar-gray">{c.jp ? 'アクリル絵の具、ワイン、気の合う仲間。' : 'Acrylic, wine and good company.'}</p>
            <div className="mt-3 flex items-center justify-between border-t border-artbar-navy/10 pt-2.5 text-[11px] tracking-[0.06em] text-artbar-navy/70">
              <span>{c.price}</span><span>{c.duration}</span><span>{c.jp ? '4スタジオ' : '4 studios'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 3. After hours ─────────────────────────── */
function HeroAfterHours({ c }: { c: Copy }) {
  return (
    <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-artbar-navy">
      <picture>
        <source media="(min-width: 768px)" srcSet={PHOTO_D} />
        <img src={PHOTO_M} alt="" className="lab-kenburns absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-luminosity" />
      </picture>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,transparent_0%,rgba(5,55,97,0.55)_45%,rgba(5,55,97,0.97)_80%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-artbar-navy/80 via-transparent to-artbar-navy" />
      {/* Giant outline 10 */}
      <span className="lab-in pointer-events-none absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 select-none font-heading text-[62vw] font-semibold leading-none text-transparent md:text-[44vw] lg:text-[34rem]" style={{ WebkitTextStroke: '1.5px rgba(209,199,184,0.32)', animationDelay: '100ms' }} aria-hidden>10</span>

      <Nav c={c} tone="light" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pt-16 text-center">
        <p className="lab-in font-heading text-[11px] font-semibold uppercase tracking-[0.45em] text-artbar-taupe md:text-[13px]" style={{ animationDelay: '250ms' }}>Est. 2016 &nbsp;·&nbsp; Tokyo</p>
        <h1 className={`lab-in mt-6 font-semibold text-white ${c.jp ? 'text-[clamp(1.5rem,7.3vw,2.6rem)] leading-[1.4] tracking-[0.04em] md:text-[clamp(2.8rem,4.8vw,4.6rem)]' : 'font-heading text-[clamp(2.6rem,10vw,3.4rem)] leading-[0.98] tracking-[-0.02em] md:text-[clamp(3.6rem,6.6vw,6.25rem)]'}`} style={{ animationDelay: '400ms' }}>
          <span className="block whitespace-nowrap">{c.title}</span>
          <span className="block whitespace-nowrap text-artbar-light-taupe">{c.title2}</span>
        </h1>
        <p className="lab-in mt-6 max-w-xl text-[15px] leading-[1.9] text-white/75 md:text-lg" style={{ animationDelay: '550ms' }}>{c.subtitle}</p>
        <div className="lab-in mt-9 flex w-full flex-col items-center gap-5" style={{ animationDelay: '700ms' }}>
          <PrimaryCta c={c} className="w-full max-w-[22rem] sm:w-auto sm:max-w-none" />
          <span className="inline-flex items-center gap-2 text-sm text-white/75">{c.find}<ArrowRight size={14} /></span>
        </div>
      </div>
      <div className="lab-in absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-artbar-navy/60 backdrop-blur-md" style={{ animationDelay: '900ms' }}>
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-[12px] tracking-[0.08em] text-white/75 md:justify-between md:text-[13px]">
          <span className="flex items-center gap-2"><Stars className="text-artbar-taupe" /><b className="font-heading text-white">{c.rating}</b></span>
          <span>{c.guests}</span>
          <span className="hidden md:inline">{c.price} {c.priceNote}</span>
          <span className="hidden md:inline">{c.duration}</span>
          <span className="hidden md:inline">{c.areas}</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 4. Salon ─────────────────────────── */
function HeroSalon({ c }: { c: Copy }) {
  const avatars = [1, 2, 3, 4].map((i) => `/media/testimonials/avatar-20260517-${i}.jpg`);
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-artbar-bg">
      <Nav c={c} tone="dark" />
      <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-6 pb-14 pt-8 md:px-14 lg:min-h-[calc(100svh-6rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-2">
        <div className="lab-in order-2 lg:order-1" style={{ animationDelay: '200ms' }}>
          <span className="inline-flex items-center gap-2.5 rounded-full border border-artbar-taupe/50 bg-white/60 px-4 py-1.5 text-[12px] font-medium tracking-[0.1em] text-artbar-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-artbar-taupe" />{c.badge}<span className="text-artbar-navy/30">|</span><span className="font-heading font-semibold tracking-[0.2em]">EST. 2016</span>
          </span>
          <h1 className={`mt-7 font-semibold text-artbar-navy ${c.jp ? 'text-[clamp(1.5rem,7.2vw,2.4rem)] leading-[1.42] tracking-[0.04em] md:text-[clamp(2.3rem,3.3vw,3.4rem)]' : 'font-heading text-[clamp(2.6rem,9vw,3.4rem)] leading-[1] tracking-[-0.02em] md:text-[clamp(3.2rem,5.2vw,5.25rem)]'}`}>
            <span className="block whitespace-nowrap">{c.title}</span>
            <span className="block whitespace-nowrap">{c.title2}</span>
          </h1>
          <p className="mt-6 max-w-lg text-[15px] leading-[1.95] text-artbar-gray md:text-[17px]">{c.subtitle}</p>
          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-artbar-navy">
            {[c.beginner, c.handsFree, c.drinks].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-artbar-navy text-white"><Check size={12} strokeWidth={3} /></span>{t}</li>
            ))}
          </ul>
          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <PrimaryCta c={c} className="w-full sm:w-auto" />
            <span className="inline-flex items-center gap-2 border-b border-artbar-navy/30 pb-1 text-sm font-medium text-artbar-navy">{c.find}<ArrowRight size={14} /></span>
          </div>
          <div className="mt-10 flex items-center gap-4 border-t border-artbar-navy/10 pt-6">
            <div className="flex -space-x-3">
              {avatars.map((a) => <img key={a} src={a} alt="" className="h-10 w-10 rounded-full border-2 border-artbar-bg object-cover" />)}
            </div>
            <div className="text-[13px] leading-snug text-artbar-navy/70">
              <span className="flex items-center gap-2"><Stars className="text-artbar-taupe" /><b className="font-heading text-[15px] text-artbar-navy">{c.rating}</b></span>
              <span>{c.guests}</span>
            </div>
            <div className="ml-auto hidden text-right sm:block">
              <p className="font-heading text-2xl font-semibold text-artbar-navy">{c.price}</p>
              <p className="text-[12px] text-artbar-gray">{c.priceNote} · {c.duration}</p>
            </div>
          </div>
        </div>

        <div className="lab-in relative order-1 mx-auto w-full max-w-[34rem] lg:order-2 lg:max-w-none" style={{ animationDelay: '100ms' }}>
          {/* Arched studio window */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] shadow-[0_50px_100px_-50px_rgba(5,55,97,0.6)] lg:aspect-[5/6]">
            <img src={PHOTO_D} alt="" className="lab-kenburns absolute inset-0 h-full w-full object-cover object-[62%_center]" />
            <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/25 to-transparent" />
          </div>
          {/* Finished canvas, pinned at an angle */}
          <div className="absolute -left-4 bottom-10 w-32 rotate-[-6deg] bg-white p-2 pb-6 shadow-[0_24px_50px_-20px_rgba(5,55,97,0.55)] md:-left-12 md:w-44 md:p-2.5 md:pb-8">
            <img src="/media/experience/step-finished.jpg" alt="" className="aspect-square w-full object-cover" />
            <p className="absolute bottom-1.5 left-0 right-0 text-center font-heading text-[10px] font-semibold tracking-[0.2em] text-artbar-navy/60 md:bottom-2.5 md:text-[11px]">{c.jp ? '本日の作品' : "TONIGHT'S PIECE"}</p>
          </div>
          <Seal tone="dark" className="absolute -right-2 -top-3 w-28 rounded-full bg-artbar-bg text-[10px] shadow-[0_18px_40px_-20px_rgba(5,55,97,0.5)] md:-right-6 md:top-6 md:w-36 md:text-[13px]" />
        </div>
      </div>
    </section>
  );
}

export const HeroLab: React.FC<{ direction: string }> = ({ direction }) => {
  const c = useHeroCopy();
  const Hero = { '1': HeroOriginal, '2': HeroGallery, '3': HeroAfterHours, '4': HeroSalon }[direction] ?? HeroOriginal;
  return (
    <div className="hero-lab">
      {/* Mock-only: the lab draws its own menu bar per direction. */}
      <style>{`nav.fixed.inset-x-0{display:none!important} footer{display:none!important} .hero-lab ~ *{display:none}`}</style>
      <Hero c={c} />
    </div>
  );
};
