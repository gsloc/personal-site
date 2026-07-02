'use client';

import { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

// ---- Tuning knobs -------------------------------------------------------
const PARTICLE_COUNT_DESKTOP = 200; // particles when viewport width >= 768px
const PARTICLE_COUNT_MOBILE = 80; // particles when viewport width < 768px
const CELL_SIZE = 20; // flow-field grid cell size in pixels
const FIELD_SCALE = 0.005; // noise spatial frequency (smaller = smoother field)
const TIME_SCALE = 0.0002; // noise temporal frequency (how fast the field evolves)
const ACCELERATION = 0.1; // how strongly particles align with the field per frame
const MAX_VELOCITY = 1.5; // velocity magnitude cap in pixels per frame
const CURSOR_INFLUENCE_RADIUS = 120; // px radius within which the cursor pushes particles
const CURSOR_STRENGTH = 0.3; // peak repelling strength at the cursor's center
const TRAIL_FADE = 0.06; // background fade alpha per frame (lower = longer trails)
const PARTICLE_RADIUS = 1.2; // drawn particle radius in pixels
const MIN_AGE = 200; // minimum particle lifetime in frames
const MAX_AGE = 400; // maximum particle lifetime in frames
// -------------------------------------------------------------------------

const MOBILE_BREAKPOINT = 768;
const MIDNIGHT = '15, 23, 42'; // rgb components of the midnight background token

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
}

export default function FlowFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const cursorEnabled = !window.matchMedia('(hover: none)').matches;

    const noise3D = createNoise3D();

    // Logical (CSS-pixel) dimensions used for all drawing.
    let width = window.innerWidth;
    let height = window.innerHeight;

    const spawnParticle = (p: Particle) => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.vx = 0;
      p.vy = 0;
      p.age = 0;
      p.maxAge = MIN_AGE + Math.random() * (MAX_AGE - MIN_AGE);
    };

    const count =
      window.innerWidth < MOBILE_BREAKPOINT
        ? PARTICLE_COUNT_MOBILE
        : PARTICLE_COUNT_DESKTOP;

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const p: Particle = { x: 0, y: 0, vx: 0, vy: 0, age: 0, maxAge: 0 };
      spawnParticle(p);
      particles.push(p);
    }

    // Size the canvas backing store for retina sharpness, keep CSS at 100vw/vh.
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      // Reset (not compound) the transform so drawing uses logical pixels.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const drawParticle = (p: Particle) => {
      const speed = Math.hypot(p.vx, p.vy);
      let color: string;
      if (speed < 0.5) {
        color = 'rgba(34, 211, 170, 0.35)'; // aurora, low velocity
      } else if (speed <= 1.0) {
        color = 'rgba(34, 211, 170, 0.6)'; // aurora, medium velocity
      } else {
        color = 'rgba(110, 231, 183, 0.7)'; // mint, high velocity
      }
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(p.x, p.y, PARTICLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    };

    // Reduced motion: draw a single static snapshot, no animation loop.
    if (reducedMotion) {
      ctx.fillStyle = `rgb(${MIDNIGHT})`;
      ctx.fillRect(0, 0, width, height);
      for (const p of particles) drawParticle(p);
      return;
    }

    let time = 0;

    const step = () => {
      // Fade the previous frame slightly to leave trailing streaks.
      ctx.fillStyle = `rgba(${MIDNIGHT}, ${TRAIL_FADE})`;
      ctx.fillRect(0, 0, width, height);

      const cursor = cursorRef.current;

      for (const p of particles) {
        // 1. Look up the field angle at the particle's current cell.
        const cellX = Math.floor(p.x / CELL_SIZE) * CELL_SIZE;
        const cellY = Math.floor(p.y / CELL_SIZE) * CELL_SIZE;
        const angle =
          noise3D(cellX * FIELD_SCALE, cellY * FIELD_SCALE, time * TIME_SCALE) *
          Math.PI *
          2;

        // 2. Accelerate toward the field direction.
        p.vx += Math.cos(angle) * ACCELERATION;
        p.vy += Math.sin(angle) * ACCELERATION;

        // Cursor repulsion (desktop / pointer devices only).
        if (cursorEnabled && cursor.active) {
          const dx = p.x - cursor.x;
          const dy = p.y - cursor.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0 && dist < CURSOR_INFLUENCE_RADIUS) {
            const strength =
              (1 - dist / CURSOR_INFLUENCE_RADIUS) * CURSOR_STRENGTH;
            p.vx += (dx / dist) * strength;
            p.vy += (dy / dist) * strength;
          }
        }

        // 3. Cap velocity magnitude.
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > MAX_VELOCITY) {
          p.vx = (p.vx / speed) * MAX_VELOCITY;
          p.vy = (p.vy / speed) * MAX_VELOCITY;
        }

        // 4. Update position. 5. Age.
        p.x += p.vx;
        p.y += p.vy;
        p.age += 1;

        // 6. Respawn when expired or off-screen.
        if (
          p.age >= p.maxAge ||
          p.x < 0 ||
          p.x > width ||
          p.y < 0 ||
          p.y > height
        ) {
          spawnParticle(p);
        }

        drawParticle(p);
      }

      time += 1;
      rafRef.current = requestAnimationFrame(step);
    };

    const start = () => {
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(step);
      }
    };
    const stop = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    // Debounced resize handler to avoid thrashing.
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 100);
    };

    const onMouseMove = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      cursorRef.current.active = true;
    };

    // Pause when the tab is hidden to save CPU.
    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    window.addEventListener('resize', onResize);
    if (cursorEnabled) window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('visibilitychange', onVisibilityChange);

    start();

    return () => {
      stop();
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      if (cursorEnabled) window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
