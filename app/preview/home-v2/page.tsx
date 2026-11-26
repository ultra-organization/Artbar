import type { Metadata } from 'next';
import { Zen_Kaku_Gothic_New } from 'next/font/google';
import { HomeV2 } from '@/views/HomeV2';

/**
 * Design-upgrade concept of the home page (Nov 2026). Same content, same
 * section order and the same tracked booking actions as `/`, in a new visual
 * language. Hidden from search; nothing links here.
 */
const zenKaku = Zen_Kaku_Gothic_New({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-zen',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: { absolute: 'Artbar Tokyo | Home concept' },
  robots: { index: false, follow: false },
};

export default function HomeV2Page() {
  return (
    <div className={zenKaku.variable}>
      <HomeV2 />
    </div>
  );
}
