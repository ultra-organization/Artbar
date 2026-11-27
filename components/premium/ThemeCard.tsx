'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { JpText } from '../JpText';
import { stripJpSentinel } from '../../lib/jp-attr';
import { themeSlugFromItem, type ThemeListItem } from '../../lib/theme-slugs';
import { localizeHrefForLanguage } from '../../lib/locale-routing';
import { getArtbarBookingThemeUrl } from '../../constants';
import { trackBookingClick, type BookingClickLocation } from '../../lib/analytics';
import { PAINT, Splat, Tilt } from './Paint';
import { TextLink } from './Kit';

/** Theme card from the premium home: square-cornered 4:5 photo, hairline on hover, splat behind. */
export function ThemeCard({ item, index, lang, bookLocation, sizes = '(max-width: 768px) 50vw, 33vw' }: {
  item: ThemeListItem;
  index: number;
  lang: 'en' | 'jp';
  /** When set, a tracked "View dates" link sits under the card. */
  bookLocation?: BookingClickLocation;
  sizes?: string;
}) {
  const jp = lang === 'jp';
  const slug = themeSlugFromItem(item);
  const plainTitle = stripJpSentinel(item.title.replace(/<wbr\s*\/?>/gi, ''));
  return (
    <article className="group relative min-w-0">
      <Splat seed={300 + index * 17} color={[PAINT.taupe, PAINT.blue, PAINT.lightTaupe][index % 3]} className="pointer-events-none absolute -right-8 -top-8 z-0 h-32 w-32 scale-50 opacity-0 transition duration-500 ease-[cubic-bezier(.2,1.5,.35,1)] group-hover:scale-100 group-hover:opacity-100 md:-right-16 md:-top-16 md:h-52 md:w-52" />
      <Link href={localizeHrefForLanguage(`/themes/${slug}`, lang)} className="relative z-[1] block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-artbar-navy">
        <Tilt className="hp-wipe">
          <div className="relative aspect-[4/5] overflow-hidden bg-artbar-light-taupe/40">
            <Image src={item.image} alt={plainTitle} fill sizes={sizes} className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]" />
            <div className="pointer-events-none absolute inset-2 border border-white/0 transition-colors duration-500 group-hover:border-white/60 md:inset-3" aria-hidden />
            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgba(255,255,255,0.22),transparent_55%)] group-hover:opacity-100" aria-hidden />
          </div>
        </Tilt>
        <h3 className={`mt-4 md:mt-6 ${jp ? 'text-base font-semibold leading-snug tracking-[0.04em] md:text-xl' : 'font-heading text-lg font-semibold leading-tight md:text-2xl'}`}><JpText>{item.title}</JpText></h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-[1.85] text-artbar-gray md:text-sm"><JpText>{item.desc}</JpText></p>
      </Link>
      {bookLocation && (
        <TextLink
          data-no-splat
          href={getArtbarBookingThemeUrl(slug)}
          onClick={() => trackBookingClick(bookLocation, { theme: slug })}
          aria-label={`${plainTitle}: ${jp ? '空き日程を見る' : 'View dates'}`}
          className="relative z-[1] mt-3 md:mt-4"
        >
          {jp ? '空き日程を見る' : 'View dates'}
        </TextLink>
      )}
    </article>
  );
}
