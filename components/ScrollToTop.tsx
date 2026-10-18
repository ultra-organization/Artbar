'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      try {
        const target = document.getElementById(decodeURIComponent(hash));
        if (target) {
          target.scrollIntoView();
          return;
        }
      } catch {
        // A malformed percent-encoded fragment cannot identify an element.
      }
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
