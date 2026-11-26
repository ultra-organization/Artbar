import type { Metadata } from 'next';
import { Dela_Gothic_One, Klee_One, Zen_Kaku_Gothic_New } from 'next/font/google';
import { HomeV3 } from '@/views/HomeV3';

/**
 * Home page design upgrade, round two ("Paint everywhere", Nov 2026).
 * Same content, section order and tracked booking actions as `/`.
 * Hidden from search; nothing links here.
 */
const dela = Dela_Gothic_One({ weight: '400', subsets: ['latin'], variable: '--font-dela', display: 'swap', preload: false });
const klee = Klee_One({ weight: '600', subsets: ['latin'], variable: '--font-klee', display: 'swap', preload: false });
const zen = Zen_Kaku_Gothic_New({ weight: ['500', '700', '900'], subsets: ['latin'], variable: '--font-zen', display: 'swap', preload: false });

export const metadata: Metadata = {
  title: { absolute: 'Artbar Tokyo | Home concept (round two)' },
  robots: { index: false, follow: false },
};

export default function HomeV3Page() {
  return (
    <div className={`${dela.variable} ${klee.variable} ${zen.variable}`}>
      <HomeV3 />
    </div>
  );
}
