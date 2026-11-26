'use client';

import Image from 'next/image';
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { JpText } from './JpText';
import { useContent } from '../context/ContentContext';
import { YEAR_END_HOME_COPY, YEAR_END_PARTY_COPY } from '../data/year-end-parties';
import { PRIVATE_PARTY_INQUIRY_URL, TEAM_BUILDING_INQUIRY_URL } from '../constants';
import { withBrowserAcquisition } from '../lib/painta-acquisition';
import { cleanDisplayText } from '../lib/jp-display';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { trackInquiryClick } from '../lib/analytics';
import { useYearEndSeason } from '../lib/year-end-season';
import { Eyebrow, Hairline, PrimaryAction, WRAP, h2Class } from './premium/Kit';
import { BrushStroke, DecoSplat, PAINT, Splat } from './premium/Paint';

const SECTION_ID = 'year-end-parties';

type Kind = 'team' | 'private';

export type YearEndFact = { value: string; label: string };

/** Fills the season year into a badge; before the client knows the date, the year is left out. */
const withYear = (text: string, year: number | null) =>
  year === null ? text.replace(/\s*\{year\}年?(<wbr>)?/, '').trim() : text.replace('{year}', String(year));

/** Small seasonal link for page heroes that jumps to the year-end feature. */
export function YearEndHeroLink({ kind, tone }: { kind: Kind; tone: 'light' | 'dark' }) {
  const { lang } = useContent();
  const season = useYearEndSeason();
  const copy = YEAR_END_PARTY_COPY[lang][kind];
  if (!season.active) return null;
  const toneClass = tone === 'dark'
    ? 'border-white/40 text-white/90 hover:border-white hover:text-white focus-visible:outline-white'
    : 'border-artbar-navy/25 text-artbar-navy hover:border-artbar-navy focus-visible:outline-artbar-navy';

  return (
    <a
      href={`#${SECTION_ID}`}
      className={`group inline-flex min-h-11 items-center gap-2 border-b pb-0.5 text-sm font-semibold tracking-[0.04em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[15px] ${toneClass}`}
    >
      <Sparkles size={15} className="shrink-0 text-artbar-taupe" aria-hidden="true" />
      <JpText>{copy.heroLink}</JpText>
      <ArrowDown size={15} className="shrink-0 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden="true" />
    </a>
  );
}

/**
 * Seasonal year-end feature for the team building and private party pages.
 * Full-bleed navy band in the mounted-print hairline (premium pass, Nov 2026).
 */
export function YearEndPartySection({
  kind,
  facts,
  feeNote,
}: {
  kind: Kind;
  /** Price, duration, drinks and group size, taken from the page's published copy. */
  facts: YearEndFact[];
  feeNote: string;
}) {
  const { lang } = useContent();
  const season = useYearEndSeason();
  const copy = YEAR_END_PARTY_COPY[lang][kind];
  if (!season.active) return null;
  const jp = lang === 'jp';
  const inquiryUrl = kind === 'team' ? TEAM_BUILDING_INQUIRY_URL : PRIVATE_PARTY_INQUIRY_URL;
  const goToInquiry = () => {
    trackInquiryClick(kind === 'team' ? 'team_building' : 'private_party', `year_end_${kind}`);
    window.location.href = withBrowserAcquisition(inquiryUrl);
  };

  return (
    <section
      id={SECTION_ID}
      aria-labelledby={`${SECTION_ID}-title`}
      className="relative scroll-mt-20 overflow-hidden bg-artbar-navy text-white"
    >
      <Hairline className="inset-3 md:inset-6" />
      <DecoSplat seed={2025} color={PAINT.blue} className="-right-24 top-24 h-80 w-80" opacity={0.45} />
      <div className={`${WRAP} relative grid gap-14 py-20 md:py-28 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-7">
          <Eyebrow tone="light"><JpText>{withYear(copy.badge, season.year)}</JpText></Eyebrow>
          <h2 id={`${SECTION_ID}-title`} className={`mt-5 text-white ${h2Class(lang)}`}>
            <span className="block"><JpText>{copy.title}</JpText></span>
            <span className="relative isolate block w-fit text-artbar-light-taupe">
              <BrushStroke className="-bottom-[0.04em] left-[-2%] -z-10 h-[0.38em] w-[104%] opacity-60" color={PAINT.taupe} />
              <JpText>{copy.titleHighlight}</JpText>
            </span>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.95] text-white/85 md:text-[17px]"><JpText>{copy.intro}</JpText></p>
          <p className="mt-4 text-[15px] leading-[1.95] text-artbar-light-taupe md:text-[17px]"><JpText>{copy.formats}</JpText></p>

          <dl className="mt-10 grid grid-cols-2 border-t border-white/15">
            {facts.map((fact, i) => (
              <div key={i} className={`border-b border-white/15 py-5 ${i % 2 ? 'border-l border-white/15 pl-5 md:pl-8' : 'pr-5'}`}>
                <dt className="sr-only"><JpText>{fact.label}</JpText></dt>
                <dd className={`${jp ? 'text-lg font-semibold tracking-[0.03em]' : 'font-heading text-xl font-semibold'} leading-tight md:text-2xl`}><JpText>{fact.value}</JpText></dd>
                <dd className="mt-1.5 text-[12px] leading-snug text-white/60 md:text-sm"><JpText>{fact.label}</JpText></dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-white/55 md:text-sm"><JpText>{feeNote}</JpText></p>

          <div className="mt-9">
            <PrimaryAction onClick={goToInquiry}><JpText>{copy.cta}</JpText></PrimaryAction>
          </div>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65"><JpText>{copy.ctaNote}</JpText></p>
          {'corporateTitle' in copy && (
            <a
              href={`${localizeHrefForLanguage('/team-building', lang)}#${SECTION_ID}`}
              className="group mt-10 flex items-center justify-between gap-4 border-y border-white/15 py-5 transition-colors hover:border-white/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span>
                <span className="block text-base font-semibold md:text-lg"><JpText>{copy.corporateTitle}</JpText></span>
                <span className="mt-1 block text-sm text-artbar-light-taupe"><JpText>{copy.corporateLink}</JpText></span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-artbar-taupe transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden bg-white/5 lg:sticky lg:top-28">
            <Image src={copy.primaryImage} alt={cleanDisplayText(copy.primaryImageAlt)} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 40vw" />
            <Hairline className="inset-3 md:inset-4" />
          </div>
          <div className="absolute -bottom-8 -left-4 w-36 rotate-[-4deg] bg-white p-2 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] sm:w-44 md:-left-10 md:w-52 md:p-2.5">
            <div className="relative aspect-[4/5]">
              <Image src={copy.secondaryImage} alt={cleanDisplayText(copy.secondaryImageAlt)} fill className="object-cover" sizes="220px" />
            </div>
          </div>
        </div>
      </div>

      <div className={`${WRAP} relative pb-20 md:pb-28`}>
        <div className="border-t border-white/15 pt-12">
          <h3 className={`${jp ? 'text-lg font-semibold tracking-[0.04em]' : 'font-heading text-2xl font-semibold'} text-white`}><JpText>{copy.stepsTitle}</JpText></h3>
          <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {copy.steps.map((step, i) => (
              <li key={i} className="flex gap-5">
                <span className="relative -mt-2 flex h-14 w-14 shrink-0 items-center justify-center" aria-hidden="true">
                  <Splat seed={900 + i * 7} color={i % 2 ? PAINT.lightTaupe : PAINT.taupe} className="absolute -inset-1 h-[calc(100%+0.5rem)] w-[calc(100%+0.5rem)]" />
                  <span className="relative font-heading text-lg font-semibold text-artbar-navy">{i + 1}</span>
                </span>
                <div>
                  <p className="text-base font-semibold md:text-lg"><JpText>{step.title}</JpText></p>
                  <p className="mt-1.5 text-sm leading-[1.85] text-white/65 md:text-[15px]"><JpText>{step.desc}</JpText></p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Seasonal home page feature: pushes company year-end parties, with private parties as the alternative. */
export function HomeYearEndFeature() {
  const { lang } = useContent();
  const season = useYearEndSeason();
  if (!season.active) return null;
  const copy = YEAR_END_HOME_COPY[lang];
  const teamPage = `${localizeHrefForLanguage('/team-building', lang)}#${SECTION_ID}`;
  const privatePage = `${localizeHrefForLanguage('/private-parties', lang)}#${SECTION_ID}`;
  const goToInquiry = () => {
    trackInquiryClick('team_building', 'home_year_end');
    window.location.href = withBrowserAcquisition(TEAM_BUILDING_INQUIRY_URL);
  };

  return (
    <section aria-labelledby="home-year-end-title" className="bg-artbar-bg px-4 py-14 md:px-10 md:py-20">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-[3rem] bg-artbar-navy text-white shadow-2xl">
        <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-5 blur-[100px]" aria-hidden="true" />
        <div className="relative grid lg:grid-cols-[1fr_1fr]">
          <div className="relative h-72 sm:h-96 lg:h-auto lg:min-h-[560px]">
            <Image src={copy.image} alt={cleanDisplayText(copy.imageAlt)} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/90 via-artbar-navy/20 to-transparent lg:hidden" aria-hidden="true" />
            <div className="absolute bottom-8 right-8 hidden w-48 rotate-[4deg] overflow-hidden rounded-[1.5rem] border-4 border-white shadow-2xl lg:block xl:w-56">
              <div className="relative aspect-[4/5]">
                <Image src={copy.insetImage} alt={cleanDisplayText(copy.insetImageAlt)} fill className="object-cover" sizes="224px" />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-16">
            <span className="mb-6 inline-flex w-fit items-center rounded-full border border-white/20 bg-white/10 px-5 py-2 font-heading text-xs font-bold uppercase tracking-widest md:text-sm">
              <JpText>{withYear(copy.badge, season.year)}</JpText>
            </span>
            <h2 id="home-year-end-title" className="mb-6 font-heading text-4xl font-heavy leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
              <span className="block"><JpText>{copy.title}</JpText></span>
              <span className="block text-artbar-taupe"><JpText>{copy.titleHighlight}</JpText></span>
            </h2>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-white/90 md:text-lg"><JpText>{copy.body}</JpText></p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Button variant="taupe" size="cta" className="w-full shadow-xl sm:w-auto" onClick={goToInquiry}>
                <JpText>{copy.cta}</JpText>
              </Button>
              <a href={teamPage} className="inline-flex min-h-11 items-center gap-2 font-heading text-sm font-bold text-white/85 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                <JpText>{copy.detailsLink}</JpText><ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <a href={privatePage} className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 border-b border-white/30 py-1 text-sm text-artbar-light-taupe transition-colors hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <JpText>{copy.privateLink}</JpText><ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
