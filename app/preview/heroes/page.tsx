import type { Metadata } from 'next';
import { HeroLab } from '@/views/HeroLab';

/** Hero direction pitches (Nov 2026). Hidden from search; nothing links here. */
export const metadata: Metadata = {
  title: { absolute: 'Artbar Tokyo | Hero directions' },
  robots: { index: false, follow: false },
};

export default async function HeroLabPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  return <HeroLab direction={d ?? '1'} />;
}
