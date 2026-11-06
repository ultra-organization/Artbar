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
    ? 'border-white/30 bg-white/10 text-white hover:bg-white/20'
    : 'border-artbar-taupe/40 bg-white text-artbar-navy hover:border-artbar-taupe';

  return (
    <a
      href={`#${SECTION_ID}`}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-2 font-heading text-sm font-bold tracking-wide backdrop-blur-md transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-taupe ${toneClass}`}
    >
      <Sparkles size={16} className="shrink-0 text-artbar-taupe" aria-hidden="true" />
      <JpText>{copy.heroLink}</JpText>
      <ArrowDown size={16} className="shrink-0" aria-hidden="true" />
    </a>
  );
}

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
  const inquiryUrl = kind === 'team' ? TEAM_BUILDING_INQUIRY_URL : PRIVATE_PARTY_INQUIRY_URL;
  const goToInquiry = () => {
    trackInquiryClick(kind === 'team' ? 'team_building' : 'private_party', `year_end_${kind}`);
    window.location.href = withBrowserAcquisition(inquiryUrl);
  };

  return (
    <section
      id={SECTION_ID}
      aria-labelledby={`${SECTION_ID}-title`}
      className="relative mb-16 scroll-mt-28 overflow-hidden rounded-[3rem] bg-artbar-navy text-white shadow-2xl md:mb-24"
    >
      <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-5 blur-[100px]" aria-hidden="true" />

      <div className="relative grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="order-2 p-6 sm:p-10 lg:order-1 lg:p-16">
          <span className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-2 font-heading text-xs font-bold uppercase tracking-widest md:text-sm">
            <JpText>{withYear(copy.badge, season.year)}</JpText>
          </span>
          <h2 id={`${SECTION_ID}-title`} className="mb-6 font-heading text-4xl font-heavy leading-[1.05] tracking-tight sm:text-5xl xl:text-6xl">
            <span className="block"><JpText>{copy.title}</JpText></span>
            <span className="block text-artbar-taupe"><JpText>{copy.titleHighlight}</JpText></span>
          </h2>
          <p className="mb-4 text-base leading-relaxed text-white/90 md:text-lg"><JpText>{copy.intro}</JpText></p>
          <p className="mb-8 text-base leading-relaxed text-artbar-light-taupe md:text-lg"><JpText>{copy.formats}</JpText></p>

          <dl className="mb-4 grid border-t border-white/15 sm:grid-cols-2 sm:gap-x-10">
            {facts.map((fact, i) => (
              <div key={i} className="border-b border-white/15 py-4 md:py-5">
                <dt className="sr-only"><JpText>{fact.label}</JpText></dt>
                <dd className="font-heading text-xl font-bold leading-tight md:text-2xl"><JpText>{fact.value}</JpText></dd>
                <dd className="mt-1 text-sm leading-snug text-white/65"><JpText>{fact.label}</JpText></dd>
              </div>
            ))}
          </dl>
          <p className="mb-8 text-xs text-white/60 md:text-sm"><JpText>{feeNote}</JpText></p>

          <Button variant="taupe" size="cta" className="w-full shadow-xl sm:w-auto" onClick={goToInquiry}>
            <JpText>{copy.cta}</JpText>
          </Button>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70"><JpText>{copy.ctaNote}</JpText></p>
          {'corporateTitle' in copy && (
            <a
              href={`${localizeHrefForLanguage('/team-building', lang)}#${SECTION_ID}`}
              className="group mt-8 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-white/5 p-4 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:p-5"
            >
              <span>
                <span className="block font-heading text-base font-bold md:text-lg"><JpText>{copy.corporateTitle}</JpText></span>
                <span className="mt-1 block text-sm text-artbar-light-taupe"><JpText>{copy.corporateLink}</JpText></span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-artbar-taupe transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
          )}
        </div>

        <div className="relative order-1 h-72 sm:h-96 lg:order-2 lg:h-auto lg:min-h-[640px]">
          <Image
            src={copy.primaryImage}
            alt={cleanDisplayText(copy.primaryImageAlt)}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-artbar-navy/90 via-artbar-navy/20 to-transparent lg:hidden" aria-hidden="true" />
          <div className="absolute bottom-8 left-8 hidden w-52 rotate-[-4deg] overflow-hidden rounded-[1.5rem] border-4 border-white shadow-2xl lg:block xl:w-60">
            <div className="relative aspect-[4/5]">
              <Image
                src={copy.secondaryImage}
                alt={cleanDisplayText(copy.secondaryImageAlt)}
                fill
                className="object-cover"
                sizes="240px"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-6 py-8 sm:px-10 lg:px-16 lg:py-10">
        <h3 className="mb-6 font-heading text-xl font-bold text-white md:text-2xl"><JpText>{copy.stepsTitle}</JpText></h3>
        <ol className="grid gap-6 md:grid-cols-3 md:gap-8">
          {copy.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-artbar-taupe font-heading font-bold text-artbar-navy" aria-hidden="true">{i + 1}</span>
              <div>
                <p className="font-heading text-lg font-bold"><JpText>{step.title}</JpText></p>
                <p className="mt-1 text-sm leading-relaxed text-white/70 md:text-base"><JpText>{step.desc}</JpText></p>
              </div>
            </li>
          ))}
        </ol>
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
