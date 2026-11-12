'use client';

import type { CSSProperties } from 'react';

/** Warm gold with red and green accents, so the string reads festive without fighting the navy brand. */
const BULB_COLORS = ['#FFD27A', '#E5484D', '#FFD27A', '#3FB27F'] as const;

const SWAGS = 4;
const BULBS_PER_SWAG = 6;
/** Wire anchors near the top edge; each swag sags this far (in % of the strip height). */
const ANCHOR_Y = 8;
const SAG = 42;

type Bulb = { left: number; top: number; tilt: number; color: string; delay: number };

/** Points along a quadratic swag: endpoints at ANCHOR_Y, control point twice the sag below. */
function buildString() {
  const width = 100 / SWAGS;
  const control = ANCHOR_Y + SAG * 2;
  let path = `M0 ${ANCHOR_Y}`;
  const bulbs: Bulb[] = [];
  for (let s = 0; s < SWAGS; s++) {
    const x0 = s * width;
    path += ` Q${x0 + width / 2} ${control} ${x0 + width} ${ANCHOR_Y}`;
    for (let b = 1; b <= BULBS_PER_SWAG; b++) {
      const t = b / (BULBS_PER_SWAG + 1);
      const y = (1 - t) ** 2 * ANCHOR_Y + 2 * (1 - t) * t * control + t ** 2 * ANCHOR_Y;
      const dy = 2 * (1 - t) * (control - ANCHOR_Y) - 2 * t * (control - ANCHOR_Y);
      const i = s * BULBS_PER_SWAG + b - 1;
      bulbs.push({
        left: x0 + t * width,
        top: y,
        // The strip is much wider than tall, so the visual slope is gentle: tilt a little, not fully.
        tilt: Math.max(-28, Math.min(28, -dy * 0.35)),
        color: BULB_COLORS[i % BULB_COLORS.length],
        // Three interleaved groups blink in turn, with a little drift so it never looks mechanical.
        delay: -((i % 3) * 0.6 + ((i * 7) % 5) * 0.05),
      });
    }
  }
  return { path, bulbs };
}

const STRING = buildString();

/** Christmas lights strung across the top of the home hero. Decorative only, hidden from screen readers. */
export function HolidayLights() {
  return (
    <div className="holiday-fade-in pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top,0px)+4.5rem)] z-[4] h-12 sm:h-16 md:top-[4.75rem] md:h-20" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={STRING.path} fill="none" stroke="#14301f" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </svg>
      {STRING.bulbs.map((b, i) => (
        <span
          key={i}
          className="absolute flex flex-col items-center"
          style={{ left: `${b.left}%`, top: `${b.top}%`, transform: `translateX(-50%) rotate(${b.tilt}deg)`, transformOrigin: 'top center' }}
        >
          <span className="h-[5px] w-[6px] rounded-[1px] bg-[#1d3a28] md:h-[6px] md:w-[8px]" />
          <span
            className="holiday-bulb block h-[11px] w-[8px] md:h-[16px] md:w-[11px]"
            style={{ '--bulb': b.color, animationDelay: `${b.delay}s` } as CSSProperties}
          />
        </span>
      ))}
    </div>
  );
}

/** A small holly sprig: two leaves and three berries. */
export function HollySprig({ className = '', style }: { className?: string; style?: CSSProperties }) {
  const leaf =
    'M0 0 C6 -7 10 -2 14 -8 C16 -3 22 -6 26 -5 C26 -1 32 1 36 0 C32 -1 26 1 26 5 C22 6 16 3 14 8 C10 2 6 7 0 0Z';
  return (
    <svg viewBox="-40 -26 80 44" className={className} style={style} aria-hidden="true" focusable="false">
      <g transform="rotate(-24)">
        <path d={leaf} fill="#1f6b43" />
        <path d="M0 0 L32 0" stroke="#3f9466" strokeWidth="1.2" fill="none" />
      </g>
      <g transform="scale(-1 1) rotate(-24)">
        <path d={leaf} fill="#2a7d50" />
        <path d="M0 0 L32 0" stroke="#4fa576" strokeWidth="1.2" fill="none" />
      </g>
      <circle cx="-5" cy="2" r="5" fill="#c8102e" />
      <circle cx="5" cy="2" r="5" fill="#d62839" />
      <circle cx="0" cy="-5" r="5" fill="#e03a48" />
      <circle cx="-6.5" cy="0.5" r="1.4" fill="#fff" opacity="0.55" />
      <circle cx="3.5" cy="0.5" r="1.4" fill="#fff" opacity="0.55" />
      <circle cx="-1.5" cy="-6.5" r="1.4" fill="#fff" opacity="0.55" />
    </svg>
  );
}
