import type { Metadata } from 'next';
import { HomePremium } from '@/views/HomePremium';

/**
 * Home page premium pass ("The Original", Nov 2026): same content, section
 * order and tracked actions as `/`. Hidden from search; nothing links here.
 */
export const metadata: Metadata = {
  title: { absolute: 'Artbar Tokyo | Home (premium preview)' },
  robots: { index: false, follow: false },
};

export default function HomePremiumPage() {
  return <HomePremium />;
}
