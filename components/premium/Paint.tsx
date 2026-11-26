'use client';

/**
 * Paint toolkit for the premium home page: procedural splats in Artbar's own
 * colours, a hero layer that throws paint where you click, scroll-grown
 * decorative splats, a brush stroke, a tilting canvas card, a count-up and a
 * section you can paint across. Everything respects reduced motion.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const PAINT = {
  navy: '#053761',
  blue: '#3E6686',
  taupe: '#A39384',
  lightTaupe: '#D1C7B8',
  white: '#FFFFFF',
} as const;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Drop = { cx: number; cy: number; rx: number; ry: number; rot: number };

/** A splat in a 100×100 box: lobed body (closed Catmull-Rom) plus flung droplets. */
export function splatShape(seed: number) {
  const r = rng(seed);
  const n = 20;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (r() - 0.5) * 0.2;
    let rad = 0.64 + r() * 0.2;
    if (r() < 0.24) rad = 0.95 + r() * 0.38;
    pts.push([50 + Math.cos(a) * rad * 28, 50 + Math.sin(a) * rad * 28]);
  }
  const f = (p: [number, number]) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  let d = `M${f(pts[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: [number, number] = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: [number, number] = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1)} ${f(c2)} ${f(p2)}`;
  }
  d += 'Z';
  const drops: Drop[] = [];
  const m = 7 + Math.floor(r() * 7);
  for (let i = 0; i < m; i++) {
    const a = r() * Math.PI * 2;
    const dist = 33 + r() * 15;
    const s = 0.7 + r() * 2.4;
    const streak = r() < 0.4;
    drops.push({ cx: 50 + Math.cos(a) * dist, cy: 50 + Math.sin(a) * dist, rx: streak ? s * 2.1 : s, ry: s, rot: (a * 180) / Math.PI });
  }
  return { d, drops };
}

export function Splat({ seed, color, className = '', style }: { seed: number; color: string; className?: string; style?: React.CSSProperties }) {
  const { d, drops } = useMemo(() => splatShape(seed), [seed]);
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden fill={color}>
      <path d={d} className="splat-body" />
      <g className="splat-drops">
        {drops.map((p, i) => (
          <ellipse key={i} cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} transform={`rotate(${p.rot} ${p.cx} ${p.cy})`} />
        ))}
      </g>
    </svg>
  );
}

/** Decorative splat that lands when it scrolls into view, with gentle parallax. */
export function DecoSplat({ seed, color, className = '', speed = 0, delay = 0, opacity = 1 }: { seed: number; color: string; className?: string; speed?: number; delay?: number; opacity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0 });
    io.observe(el);
    if (!speed || prefersReducedMotion()) return () => io.disconnect();
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        const off = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
        el.style.setProperty('--py', `${off.toFixed(1)}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [speed]);
  return (
    <div ref={ref} className={`pointer-events-none absolute ${className}`} style={{ transform: 'translate3d(0,var(--py,0px),0)' }} aria-hidden>
      <Splat seed={seed} color={color} className={`splat-land h-full w-full ${inView ? 'is-in' : ''}`} style={{ animationDelay: `${delay}ms`, opacity }} />
    </div>
  );
}

type Thrown = { id: number; x: number; y: number; size: number; seed: number; color: string; rot: number };

/**
 * Click or tap anywhere in the parent (except links and buttons) to throw paint.
 * Splats dry and fade after a few seconds; at most 14 stay on screen.
 */
export function SplatterLayer({ targetRef, colors, onFirst }: { targetRef: React.RefObject<HTMLElement | null>; colors: string[]; onFirst?: () => void }) {
  const [splats, setSplats] = useState<Thrown[]>([]);
  const idRef = useRef(0);
  const firstRef = useRef(false);
  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button,input,select,textarea,[data-no-splat]')) return;
      const rect = el.getBoundingClientRect();
      const id = ++idRef.current;
      const base = rect.width < 768 ? 90 : 130;
      const s: Thrown = {
        id,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size: base + Math.random() * base * 0.8,
        seed: Math.floor(Math.random() * 1e9),
        color: colors[id % colors.length],
        rot: Math.random() * 360,
      };
      setSplats((prev) => [...prev.slice(-13), s]);
      window.setTimeout(() => setSplats((prev) => prev.filter((p) => p.id !== id)), 6500);
      if (!firstRef.current) { firstRef.current = true; onFirst?.(); }
    };
    el.addEventListener('pointerdown', onDown);
    return () => el.removeEventListener('pointerdown', onDown);
  }, [targetRef, colors, onFirst]);
  return (
    <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden>
      {splats.map((s) => (
        <div key={s.id} className="absolute" style={{ left: s.x - s.size / 2, top: s.y - s.size / 2, width: s.size, height: s.size, transform: `rotate(${s.rot}deg)` }}>
          <Splat seed={s.seed} color={s.color} className="splat-thrown h-full w-full" />
        </div>
      ))}
    </div>
  );
}

/** Hand-made taupe brush stroke that paints in from left to right. */
export function BrushStroke({ className = '', color = PAINT.taupe, delay = 900 }: { className?: string; color?: string; delay?: number }) {
  return (
    <svg viewBox="0 0 600 48" preserveAspectRatio="none" className={`brush-in pointer-events-none absolute ${className}`} style={{ animationDelay: `${delay}ms` }} aria-hidden fill={color}>
      <path d="M6 26 C 70 12, 170 9, 280 12 S 470 15, 594 11 L 596 19 C 560 22, 520 21, 470 25 C 400 30, 330 27, 250 31 C 170 35, 90 34, 10 38 C 4 36, 3 30, 6 26 Z" />
      <path d="M40 40 C 140 36, 260 37, 380 33" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M120 8 C 220 5, 330 6, 420 8" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** Canvas that tilts toward the pointer like a painting on an easel. */
export function Tilt({ children, className = '', max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${(x * max).toFixed(2)}deg) rotateX(${(-y * max).toFixed(2)}deg)`;
    el.style.setProperty('--gx', `${(x + 0.5) * 100}%`);
    el.style.setProperty('--gy', `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt ${className}`}>
      {children}
    </div>
  );
}

/** Button wrapper that leans toward the cursor. */
export function Magnetic({ children, className = '', strength = 0.22 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * strength).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * strength).toFixed(1)}px)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = ''; };
  return (
    <span ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`magnetic inline-flex ${className}`}>
      {children}
    </span>
  );
}

/** Counts up to `value` the first time it scrolls into view. Renders the final value on the server. */
export function CountUp({ value, from, decimals = 0, locale = 'en-US', duration = 1600 }: { value: number; from?: number; decimals?: number; locale?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = useCallback((n: number) => n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }), [locale, decimals]);
  const [text, setText] = useState(fmt(value));
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const start = from ?? value * 0.9;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - k, 4);
        setText(fmt(start + (value - start) * eased));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      setText(fmt(start));
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value, from, duration, fmt]);
  return <span ref={ref} className="tabular-nums">{text}</span>;
}

/**
 * Paint across the section. Mouse paints on hover; touch paints while dragging
 * sideways (vertical drags still scroll). Strokes slowly dry away. On first
 * view it paints one demo swash on its own so the idea is obvious.
 */
export function PaintCanvas({ targetRef, color }: { targetRef: React.RefObject<HTMLElement | null>; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(color);
  colorRef.current = color;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = targetRef.current;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let last: { x: number; y: number; t: number } | null = null;
    let width = 18;
    const stroke = (x: number, y: number, c = colorRef.current) => {
      const t = performance.now();
      if (!last || t - last.t > 120) { last = { x, y, t }; return; }
      const dx = x - last.x, dy = y - last.y;
      const dist = Math.hypot(dx, dy);
      const speed = dist / Math.max(1, t - last.t);
      const target = Math.max(6, Math.min(30, 30 - speed * 9));
      width += (target - width) * 0.35;
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = c; ctx.fillStyle = c;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.globalAlpha = 0.92;
      ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(x, y); ctx.stroke();
      // bristle edges
      ctx.globalAlpha = 0.35; ctx.lineWidth = Math.max(1, width * 0.12);
      const nx = -dy / (dist || 1), ny = dx / (dist || 1);
      for (const k of [-0.42, 0.46]) {
        ctx.beginPath(); ctx.moveTo(last.x + nx * width * k, last.y + ny * width * k); ctx.lineTo(x + nx * width * k, y + ny * width * k); ctx.stroke();
      }
      if (speed > 1.6 && Math.random() < 0.5) {
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 3; i++) {
          const a = Math.random() * Math.PI * 2, d = width * (0.9 + Math.random() * 1.6);
          ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1 + Math.random() * 3, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      last = { x, y, t };
    };

    let dragging = false;
    const local = (e: PointerEvent) => { const r = host.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onMove = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a,button,[data-no-splat]')) { last = null; return; }
      if (e.pointerType === 'mouse' || dragging) { const p = local(e); stroke(p.x, p.y); }
    };
    const onDown = (e: PointerEvent) => { if (e.pointerType !== 'mouse') { dragging = true; last = null; const p = local(e); stroke(p.x, p.y); } };
    const onUp = () => { dragging = false; last = null; };
    const onLeave = () => { last = null; };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    host.addEventListener('pointercancel', onUp);
    host.addEventListener('pointerleave', onLeave);

    // Drying: slowly erase. Runs only while visible.
    let raf = 0, visible = false, demoed = false;
    const loop = () => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.012)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(loop);
    };
    const demo = () => {
      if (demoed || reduced) return;
      demoed = true;
      const t0 = performance.now();
      const run = (t: number) => {
        const k = Math.min(1, (t - t0) / 1800);
        const x = w * (0.52 + 0.42 * k);
        const y = h * (0.62 + Math.sin(k * Math.PI * 1.6) * 0.12);
        stroke(x, y, PAINT.taupe);
        if (k < 1) requestAnimationFrame(run); else last = null;
      };
      last = null;
      requestAnimationFrame(run);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) { raf = requestAnimationFrame(loop); window.setTimeout(demo, 500); }
    }, { threshold: 0.35 });
    io.observe(host);

    return () => {
      ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      host.removeEventListener('pointercancel', onUp);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [targetRef]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[1]" aria-hidden />;
}
