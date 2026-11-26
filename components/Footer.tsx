'use client';

import React from 'react';
import { Instagram, Facebook, Youtube, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { JpText } from './JpText';
import { stripJpSentinel } from '../lib/jp-attr';
import { useContent } from '../context/ContentContext';
import { SOCIAL_PROFILES } from '../constants';
import { Seal } from './premium/Kit';
import { localizeHrefForLanguage } from '../lib/locale-routing';
import { locationPath } from '../lib/location-pages';
import { getScheduleUrlForPathname } from '../lib/location-booking';
import { trackBookingClick } from '../lib/analytics';

// lucide-react has no TikTok icon (brand icons are deprecated upstream); inline SVG keeps the row consistent.
const TikTokIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.83a8.16 8.16 0 0 0 4.77 1.52V6.93a4.85 4.85 0 0 1-1.84-.24Z" />
  </svg>
);

// Plain-text studio directory for the footer — name + ward + nearest station.
// The ward/station strings are curated here (LOCATIONS.access* is multi-line and
// too verbose for a compact two-line entry) to boost relevance for location-based
// search. Include every listed studio, with the same nearest stations as its access page.
const FOOTER_STUDIOS = [
  {
    id: 'daikanyama',
    nameEn: 'Daikanyama',
    nameJp: '代官山',
    metaEn: 'Shibuya, Tokyo · Tokyu Toyoko Line, Daikanyama Station',
    metaJp: '渋谷区・東急東横線「代官山駅」',
  },
  {
    id: 'harajuku',
    nameEn: 'Cat Street Harajuku',
    nameJp: 'キャットストリート原宿',
    metaEn: 'Shibuya, Tokyo · Meiji-jingumae / Shibuya Station',
    metaJp: '渋谷区・「明治神宮前駅」／「渋谷駅」',
  },
  {
    id: 'ginza',
    nameEn: 'Ginza',
    nameJp: '銀座',
    metaEn: 'Chuo, Tokyo · Metro Ginza-itchome / JR Yurakucho Station',
    metaJp: '中央区・東京メトロ「銀座一丁目駅」／JR「有楽町駅」',
  },
  {
    id: 'yokohama',
    nameEn: 'Yokohama Motomachi',
    nameJp: '横浜元町',
    metaEn: 'Naka, Yokohama · Minatomirai Line, Motomachi-Chukagai Station',
    metaJp: '横浜市中区・みなとみらい線「元町・中華街駅」',
  },
  {
    id: 'osaka_namba',
    nameEn: 'Osaka Namba SkyO',
    nameJp: '大阪 なんばスカイオ',
    metaEn: 'Chuo, Osaka · Nankai Namba / Metro Namba Station',
    metaJp: '大阪市中央区・南海「なんば駅」／大阪メトロ「なんば駅」',
  },
  {
    id: 'osaka_umeda',
    nameEn: 'Osaka Umeda',
    nameJp: '大阪 梅田',
    metaEn: 'Kita, Osaka · JR Osaka Station',
    metaJp: '大阪市北区・JR「大阪駅」',
  },
  {
    id: 'osaka_hirakata',
    nameEn: 'Lab Hirakata',
    nameJp: 'Lab 枚方',
    metaEn: 'Hirakata, Osaka · Keihan Hirakatashi Station',
    metaJp: '大阪府枚方市・京阪「枚方市駅」',
  },
] as const;

export const Footer: React.FC = () => {
  const { site, lang, localizedCopy } = useContent();
  const pathname = usePathname();
  const scheduleUrl = getScheduleUrlForPathname(pathname, lang);
  const currentYear = new Date().getFullYear();
  const jp = lang === 'jp';
  const socialIconClass = 'flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/85 transition-colors duration-300 hover:border-artbar-taupe hover:bg-artbar-taupe hover:text-artbar-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  const linkClass = 'group inline-flex min-h-[44px] items-center gap-2 text-[15px] text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';
  const headClass = 'flex items-center gap-3 text-[12px] font-medium tracking-[0.16em] text-artbar-light-taupe md:text-[13px]';
  const footerMetaLinkClass = 'inline-flex min-h-[44px] items-center transition-colors hover:text-white';
  const href = (path: string) => localizeHrefForLanguage(path, lang);
  const Rule = () => <span className="h-px w-8 shrink-0 bg-artbar-taupe" aria-hidden />;

  return (
    <footer className="relative overflow-hidden bg-artbar-navy pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] text-white">
      {/* Mounted-print hairline, the same frame as the hero. */}
      <div className="pointer-events-none absolute inset-3 border border-white/15 md:inset-6" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-7 pt-20 sm:px-8 md:px-12 md:pt-28">
        {/* Sign-off */}
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <Logo variant="light" />
            <p className="mt-7 text-[15px] leading-[1.95] text-white/70 md:text-base">
              <JpText>{site.footer.tagline}</JpText>
            </p>
            <a
              href={scheduleUrl}
              onClick={() => trackBookingClick('footer')}
              className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-artbar-taupe px-8 text-[15px] font-bold tracking-[0.04em] text-artbar-navy transition-colors duration-300 hover:bg-artbar-light-taupe focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-taupe"
            >
              <JpText>{site.nav.schedule}</JpText>
              <ArrowRight size={16} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </a>
          </div>
          <Seal className="hidden w-32 shrink-0 text-[12px] md:block lg:w-36" />
        </div>

        {/* Directory */}
        <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-14 border-t border-white/15 pt-12 md:mt-20 md:grid-cols-12 md:pt-14">
          <div className="col-span-2 md:col-span-6">
            <h4 className={headClass}><Rule /><JpText>{jp ? 'スタジオ' : 'Studios'}</JpText></h4>
            <ul className="mt-6 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {FOOTER_STUDIOS.map((studio) => (
                <li key={studio.id} className="border-b border-white/10">
                  <Link href={href(locationPath(studio.id))} className="group block py-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                    <span className="flex items-center justify-between gap-3 text-[15px] font-semibold text-white/90 transition-colors group-hover:text-white">
                      {jp ? <JpText>{studio.nameJp}</JpText> : studio.nameEn}
                      <ArrowRight size={14} className="shrink-0 text-artbar-taupe opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                    </span>
                    <span className="mt-1 block text-[12px] leading-relaxed text-white/50">
                      {jp ? <JpText>{studio.metaJp}</JpText> : studio.metaEn}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 md:col-start-8">
            <h4 className={headClass}><Rule /><JpText>{site.footer.explore}</JpText></h4>
            <ul className="mt-4">
              <li><Link href={href('/team-building')} className={linkClass}><JpText>{site.nav.teamBuilding}</JpText></Link></li>
              <li><Link href={href('/private-parties')} className={linkClass}><JpText>{site.nav.privateParties}</JpText></Link></li>
              <li><Link href={href('/instructors')} className={linkClass}><JpText>{site.nav.instructors}</JpText></Link></li>
              <li><Link href={href('/locations')} className={linkClass}><JpText>{site.footer.locations}</JpText></Link></li>
              <li><Link href={href('/guides')} className={linkClass}><JpText>{jp ? 'ガイド' : 'Guides'}</JpText></Link></li>
              <li><Link href={href('/blog')} className={linkClass}><JpText>{site.nav.blog}</JpText></Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className={headClass}><Rule /><JpText>{site.footer.support}</JpText></h4>
            <ul className="mt-4">
              <li><Link href={href('/contact')} className={linkClass}><JpText>{site.nav.contact}</JpText></Link></li>
              <li><Link href={href('/contact')} className={linkClass}><JpText>{localizedCopy.ui.footer.faq}</JpText></Link></li>
              <li><Link href={href('/contact')} className={linkClass}><JpText>{localizedCopy.ui.footer.careers}</JpText></Link></li>
            </ul>
          </div>
        </div>

        {/* Social + legal */}
        <div className="mt-14 flex flex-col gap-8 border-t border-white/15 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-3">
            <a href={SOCIAL_PROFILES.instagram} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label={stripJpSentinel(localizedCopy.ui.footer.instagramLabel)}><Instagram size={17} /></a>
            <a href={SOCIAL_PROFILES.facebook} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label={stripJpSentinel(localizedCopy.ui.footer.facebookLabel)}><Facebook size={17} /></a>
            <a href={SOCIAL_PROFILES.tiktok} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label="TikTok"><TikTokIcon size={17} /></a>
            <a href={SOCIAL_PROFILES.youtube} target="_blank" rel="noopener noreferrer" className={socialIconClass} aria-label="YouTube"><Youtube size={17} /></a>
            <a href="mailto:tokyo@artbar.co.jp" className={socialIconClass} aria-label={stripJpSentinel(localizedCopy.ui.footer.emailLabel)}><Mail size={17} /></a>
          </div>
          <div className="flex flex-wrap gap-x-5 text-xs tracking-wide text-white/55">
            <Link href={href('/privacy-policy')} className={footerMetaLinkClass}><JpText>{site.footer.privacy}</JpText></Link>
            <Link href={href('/terms-of-service')} className={footerMetaLinkClass}><JpText>{site.footer.terms}</JpText></Link>
            <Link href={href('/specified-commercial-transactions')} className={footerMetaLinkClass}><JpText>{site.footer.commercial}</JpText></Link>
            <span className="inline-flex min-h-[44px] items-center"><JpText>{site.footer.company}</JpText></span>
          </div>
        </div>
        <p className="mt-4 pb-8 text-xs tracking-wide text-white/40 md:pb-10">{`© ${currentYear} Artbar Tokyo · Paint and Wine Art Studio · All rights reserved`}</p>
      </div>
    </footer>
  );
};
