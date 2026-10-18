'use client';

import { withBrowserAcquisition } from '@/lib/painta-acquisition';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, MessageCircle, Globe, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useContent } from '../context/ContentContext';
import { PRIVATE_PARTY_INQUIRY_URL, TEAM_BUILDING_INQUIRY_URL } from '../constants';
import { getScheduleUrlForPathname } from '../lib/location-booking';
import { localizeHrefForLanguage, stripLocalePrefix } from '../lib/locale-routing';
import { trackBookingClick, trackInquiryClick, type BookingClickLocation } from '../lib/analytics';

type NavLink = {
  name: string;
  path: string;
  external?: boolean;
};

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { site, lang, toggleLang, jpCopy } = useContent();
  const barePathname = stripLocalePrefix(pathname);
  const scheduleUrl = getScheduleUrlForPathname(pathname, lang);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isHome = barePathname === '/';
  const inquiryType = barePathname === '/private-parties' ? 'private_party' : barePathname === '/team-building' ? 'team_building' : null;
  const ActionIcon = inquiryType ? MessageCircle : CalendarDays;
  const actionLabel = inquiryType === 'private_party'
    ? (lang === 'jp' ? '貸切の相談をする' : 'Plan a private event')
    : inquiryType === 'team_building'
      ? (lang === 'jp' ? '見積もりを依頼' : 'Request a quote')
      : site.nav.book;
  /** Hero/top-of-home bar height — must not depend on `isOpen` or the logo jumps when the mobile menu opens. */
  const isHeroNavLayout = isHome && !scrolled;
  const isTransparent = isHeroNavLayout && !isOpen;

  const navLinks: NavLink[] = [
    { name: site.nav.instructors, path: '/instructors' },
    { name: site.nav.teamBuilding, path: '/team-building' },
    { name: site.nav.privateParties, path: '/private-parties' },
    { name: site.nav.locations, path: '/locations' },
    { name: site.nav.blog, path: '/blog' },
    { name: site.nav.gifts, path: 'https://booking.artbar.co.jp/gift-certificates', external: true },
    { name: site.nav.contact, path: '/contact' },
  ];

  const isLinkActive = (link: { path: string; external?: boolean }) => {
    if (link.external) return false;
    if (link.path === '/blog') return barePathname === '/blog' || barePathname.startsWith('/blog/');
    return barePathname === link.path;
  };

  const getLinkActiveClass = (link: NavLink, isActive: boolean, isMobile: boolean = false) => {
    const active = isActive;

    if (isMobile) {
        return `flex min-h-[44px] items-center text-xl font-heading font-bold leading-snug ${active ? 'text-artbar-taupe' : 'text-artbar-navy'} hover:text-artbar-taupe sm:text-2xl`;
    }

    // Shrink JP text size slightly (13px vs 15px) to prevent wrapping
    const fontSizeClass = lang === 'jp' ? "text-[13px]" : "text-[15px]";
    const base = `${fontSizeClass} font-heading font-bold transition-colors whitespace-nowrap `;

    if (isTransparent) {
      return base + "text-white hover:text-white/80";
    } else {
      return base + (active ? "text-artbar-taupe" : "text-artbar-navy hover:text-artbar-taupe");
    }
  };

  const handleBookClick = (source: BookingClickLocation = 'nav_book_button') => {
      if (inquiryType) {
        trackInquiryClick(inquiryType, source);
        window.location.href = withBrowserAcquisition(inquiryType === 'private_party' ? PRIVATE_PARTY_INQUIRY_URL : TEAM_BUILDING_INQUIRY_URL);
      } else {
        trackBookingClick(source);
        window.location.href = withBrowserAcquisition(scheduleUrl);
      }
      setIsOpen(false);
  };

  const handleMobileLanguageToggle = () => {
    mobileMenuButtonRef.current?.focus();
    setIsOpen(false);
    toggleLang();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (barePathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const mobileBarTransition = 'duration-300 ease-out';

  const showMobileStickyCta = !isOpen && scrolled && barePathname !== '/contact';

  return (
    <>
    <nav
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-[background-color,box-shadow] ${mobileBarTransition} ${
        isTransparent ? 'bg-transparent shadow-none' : 'bg-artbar-bg/95 backdrop-blur-md shadow-sm'
      }`}
    >
      <div
        className={`max-w-[1400px] mx-auto px-4 sm:px-6 md:px-16 lg:px-12 2xl:px-24 flex justify-between items-center ${
          isHeroNavLayout ? 'py-6 md:py-10' : 'py-4'
        }`}
      >
        <Link href={localizeHrefForLanguage('/', lang)} onClick={handleLogoClick} className="z-50 group relative flex min-h-[44px] items-center py-1">
          <Logo variant={isTransparent ? 'light' : 'dark'} />
        </Link>

        {/* Desktop Nav: Tighter spacing for Japanese (space-x-4 vs space-x-6) */}
        <div className={`hidden xl:flex ${lang === 'jp' ? 'space-x-3 2xl:space-x-4' : 'space-x-6'} items-center`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.external ? link.path : localizeHrefForLanguage(link.path, lang)}
              className={getLinkActiveClass(link, isLinkActive(link))}
            >
              {link.name}
            </Link>
          ))}

          <div className={`h-4 w-px mx-2 ${isTransparent ? 'bg-white/50' : 'bg-artbar-light-taupe'}`}></div>

          <button
             onClick={toggleLang}
             aria-label={lang === 'en' ? jpCopy.ui.navbar.switchToJapanese : jpCopy.ui.navbar.switchToEnglish}
             className={`${isTransparent ? 'text-white' : 'text-artbar-navy'} hover:text-artbar-taupe font-heading font-bold text-sm flex items-center gap-1 uppercase w-8 shrink-0 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
          >
             {lang === 'en' ? jpCopy.ui.navbar.compactJapanese : jpCopy.ui.navbar.compactEnglish}
          </button>

          <button
            onClick={() => handleBookClick('nav_book_button')}
            className="px-6 py-2.5 rounded-full font-heading font-bold transition bg-artbar-taupe text-artbar-navy hover:bg-artbar-taupe/90 shadow-sm text-sm hover:scale-105 active:scale-[0.96] pt-3 pb-2 shrink-0 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-artbar-taupe"
          >
            {actionLabel}
          </button>
        </div>

        <div className="xl:hidden z-50 flex items-center gap-3">
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-sheet"
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 ${isTransparent ? 'text-white' : 'text-artbar-navy'} transition-colors`}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* No JS delays — open/close are one state; CSS `transition-opacity` only. */}
        <div
          id="mobile-nav-sheet"
          className={`xl:hidden fixed inset-0 z-40 flex flex-col bg-artbar-bg pt-[calc(6.75rem+env(safe-area-inset-top,0px))] px-6 sm:px-8 pb-10 pb-[max(2.5rem,env(safe-area-inset-bottom,0px))] overflow-y-auto min-h-[100dvh] transition-opacity duration-300 ease-out ${
            isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-hidden={!isOpen}
          inert={!isOpen}
        >
          <div className="flex flex-col gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={() => handleBookClick('mobile_menu_book_button')}
              className="mb-2 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-artbar-taupe px-6 pt-3 pb-2 text-center font-heading text-base font-bold tracking-wide text-artbar-navy shadow-lg transition-transform active:scale-[0.98] sm:text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-artbar-taupe"
            >
              {/* Optical alignment: Josefin's glyphs render high in the flex-centered line box,
                  so the icon must rise to the text's measured ink center (baseline-probe verified) */}
              <ActionIcon size={18} className="shrink-0 -translate-y-[2px]" aria-hidden />
              {actionLabel}
            </button>

            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.external ? link.path : localizeHrefForLanguage(link.path, lang)}
                onClick={() => {
                  setIsOpen(false);
                }}
                className={getLinkActiveClass(link, isLinkActive(link), true)}
              >
                {link.name}
              </Link>
            ))}

            <div className="h-px w-full bg-artbar-light-taupe my-1"></div>
            <button
              type="button"
              onClick={handleMobileLanguageToggle}
              className="flex min-h-[44px] items-center gap-2 text-left text-base font-heading font-bold text-artbar-navy sm:text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
            >
              <Globe size={18} className="shrink-0" /> {lang === 'en' ? jpCopy.ui.navbar.switchToJapanese : jpCopy.ui.navbar.switchToEnglish}
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div
      className={`fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.85rem,env(safe-area-inset-bottom,0px))] pt-3 transition-[transform,opacity] duration-300 ease-out xl:hidden ${
        showMobileStickyCta ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
      aria-hidden={!showMobileStickyCta}
      inert={!showMobileStickyCta}
    >
      <div className="mx-auto max-w-sm rounded-full border border-white/70 bg-artbar-bg/95 p-1.5 shadow-[0_14px_45px_-14px_rgba(5,55,97,0.55)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => handleBookClick('mobile_sticky_book_button')}
          className="inline-flex h-[46px] w-full items-center justify-center rounded-full bg-artbar-taupe px-6 py-0 text-center font-heading text-sm font-bold leading-none tracking-wide text-artbar-navy shadow-md transition-transform active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-artbar-taupe"
        >
          <span className="inline-flex translate-y-px items-center gap-2 leading-none">
            <ActionIcon size={17} className="shrink-0 -translate-y-[2px]" aria-hidden />
            <span>{actionLabel}</span>
          </span>
        </button>
      </div>
    </div>
    </>
  );
};
