'use client';

import { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

// ---- Tuning knobs -------------------------------------------------------
const PARTICLE_COUNT_DESKTOP = 28; // blobs when viewport width >= 768px
const PARTICLE_COUNT_MOBILE = 14; // blobs when viewport width < 768px
const PARTICLE_RADIUS = 60; // base blob radius in pixels (large soft blob)
const PARTICLE_RADIUS_VARIANCE = 30; // +/- radius jitter so blob sizes vary
const CELL_SIZE = 20; // flow-field grid cell size in pixels
const FIELD_SCALE = 0.002; // noise spatial frequency (smaller = smoother, sweeping curves)
const TIME_SCALE = 0.00015; // noise temporal frequency (how fast the field morphs)
const ACCELERATION = 0.03; // how lazily blobs align with the field per frame
const RANDOM_JITTER = 0.02; // per-frame random velocity nudge for organic drift
const MAX_VELOCITY = 0.5; // autonomous drift velocity cap in pixels per frame
const CURSOR_INFLUENCE_RADIUS = 180; // px radius within which cursor wind reaches blobs
const WIND_STRENGTH = 0.15; // how strongly cursor motion translates to blob force
const CURSOR_VELOCITY_DECAY = 0.85; // per-frame wind fade so gusts trail off after the cursor stops
const TRAIL_FADE = 0.25; // background fade alpha per frame (higher = shorter trails)
const MIN_AGE = 1200; // minimum blob lifetime in frames (~20s at 60fps)
const MAX_AGE = 3000; // maximum blob lifetime in frames (up to ~50s)
const FADE_IN_FRAMES = 60; // frames over which a new blob fades in (~1s)
const FADE_OUT_FRAMES = 90; // frames over which a dying blob fades out (~1.5s)
// -------------------------------------------------------------------------

const MOBILE_BREAKPOINT = 768;
const MIDNIGHT = '15, 23, 42'; // rgb components of the midnight background token
const MINT_SPEED_THRESHOLD = 0.8; // speed above which a blob tints mint (only reachable via wind gusts)
const WIND_EPSILON = 0.01; // below this the wind is treated as zero (no per-particle force)

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  radius: number;
}

export default function FlowFieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
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

    // Cull margin > max respawn offset (200px) so a blob spawned just off-screen
    // isn't immediately re-culled before it drifts into view.
    const CULL_MARGIN = 250;

    const randomRadius = () =>
      PARTICLE_RADIUS -
      PARTICLE_RADIUS_VARIANCE +
      Math.random() * PARTICLE_RADIUS_VARIANCE * 2;

    // Initial spawn: distributed across the viewport so the field is populated at load.
    const spawnParticle = (p: Particle) => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.vx = 0;
      p.vy = 0;
      p.age = 0;
      p.maxAge = MIN_AGE + Math.random() * (MAX_AGE - MIN_AGE);
      p.radius = randomRadius();
    };

    // Respawn: enter from just beyond a random edge, drifting inward — no "pop into center".
    const respawnParticle = (p: Particle) => {
      const beyond = 100 + Math.random() * 100; // 100-200px past the edge
      const inward = 0.3 + Math.random() * 0.2; // initial speed toward the interior
      const lateral = (Math.random() - 0.5) * 0.2; // slight sideways drift
      const edge = Math.floor(Math.random() * 4); // 0 top, 1 right, 2 bottom, 3 left
      if (edge === 0) {
        p.x = Math.random() * width;
        p.y = -beyond;
        p.vx = lateral;
        p.vy = inward;
      } else if (edge === 1) {
        p.x = width + beyond;
        p.y = Math.random() * height;
        p.vx = -inward;
        p.vy = lateral;
      } else if (edge === 2) {
        p.x = Math.random() * width;
        p.y = height + beyond;
        p.vx = lateral;
        p.vy = -inward;
      } else {
        p.x = -beyond;
        p.y = Math.random() * height;
        p.vx = inward;
        p.vy = lateral;
      }
      p.age = 0;
      p.maxAge = MIN_AGE + Math.random() * (MAX_AGE - MIN_AGE);
      p.radius = randomRadius();
    };

    const count =
      window.innerWidth < MOBILE_BREAKPOINT
        ? PARTICLE_COUNT_MOBILE
        : PARTICLE_COUNT_DESKTOP;

    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const p: Particle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        age: 0,
        maxAge: 0,
        radius: 0,
      };
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

    // Draw a blob as a soft radial gradient so it has feathered edges.
    // lifeOpacity (0-1) scales the fill so blobs can fade in/out over their life.
    const drawParticle = (p: Particle, lifeOpacity = 1) => {
      const speed = Math.hypot(p.vx, p.vy);
      const gradient = ctx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.radius
      );
      if (speed > MINT_SPEED_THRESHOLD) {
        // Fast (wind-swept) blob: mint center.
        gradient.addColorStop(0, `rgba(110, 231, 183, ${0.35 * lifeOpacity})`);
        gradient.addColorStop(0.5, `rgba(110, 231, 183, ${0.12 * lifeOpacity})`);
        gradient.addColorStop(1, 'rgba(110, 231, 183, 0)');
      } else {
        // Calm blob: aurora center.
        gradient.addColorStop(0, `rgba(34, 211, 170, ${0.3 * lifeOpacity})`);
        gradient.addColorStop(0.5, `rgba(34, 211, 170, ${0.1 * lifeOpacity})`);
        gradient.addColorStop(1, 'rgba(34, 211, 170, 0)');
      }
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
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

    // Wind mechanic state: cursor motion since last frame, decaying over time.
    let prevCursorX = 0;
    let prevCursorY = 0;
    let cursorSeen = false;
    let cursorVx = 0;
    let cursorVy = 0;

    const step = () => {
      // Fade the previous frame; aggressive fade gives fog motion-blur, not streaks.
      ctx.fillStyle = `rgba(${MIDNIGHT}, ${TRAIL_FADE})`;
      ctx.fillRect(0, 0, width, height);

      // --- Update the wind (cursor velocity) once per frame. ---
      if (cursorEnabled) {
        const cursor = cursorRef.current;
        const moveX = cursor.x - prevCursorX;
        const moveY = cursor.y - prevCursorY;
        // Only refresh the gust when the cursor actually moved this frame;
        // otherwise let the existing wind decay instead of snapping to zero.
        if (moveX !== 0 || moveY !== 0) {
          cursorVx = moveX;
          cursorVy = moveY;
        }
        // Wind fade: a sweep keeps pushing for ~15-20 frames after the cursor stops.
        cursorVx *= CURSOR_VELOCITY_DECAY;
        cursorVy *= CURSOR_VELOCITY_DECAY;
      }
      const windActive =
        cursorEnabled &&
        (Math.abs(cursorVx) > WIND_EPSILON ||
          Math.abs(cursorVy) > WIND_EPSILON);

      for (const p of particles) {
        // 1. Look up the field angle at the particle's current cell.
        const cellX = Math.floor(p.x / CELL_SIZE) * CELL_SIZE;
        const cellY = Math.floor(p.y / CELL_SIZE) * CELL_SIZE;
        const angle =
          noise3D(cellX * FIELD_SCALE, cellY * FIELD_SCALE, time * TIME_SCALE) *
          Math.PI *
          2;

        // 2. Accelerate lazily toward the field direction.
        p.vx += Math.cos(angle) * ACCELERATION;
        p.vy += Math.sin(angle) * ACCELERATION;

        // 3. Independent organic jitter.
        p.vx += (Math.random() - 0.5) * RANDOM_JITTER;
        p.vy += (Math.random() - 0.5) * RANDOM_JITTER;

        // 4. Cap the autonomous drift velocity (wind is added on top, uncapped,
        //    so fast sweeps can gust past this and briefly tint mint).
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > MAX_VELOCITY) {
          p.vx = (p.vx / speed) * MAX_VELOCITY;
          p.vy = (p.vy / speed) * MAX_VELOCITY;
        }

        // 5. Wind: push blobs in the direction the cursor is moving.
        if (windActive) {
          const dx = p.x - cursorRef.current.x;
          const dy = p.y - cursorRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < CURSOR_INFLUENCE_RADIUS) {
            const strength =
              (1 - dist / CURSOR_INFLUENCE_RADIUS) * WIND_STRENGTH;
            p.vx += cursorVx * strength;
            p.vy += cursorVy * strength;
          }
        }

        // 6. Update position. 7. Age.
        p.x += p.vx;
        p.y += p.vy;
        p.age += 1;

        // 8. Respawn (from off-screen) when expired or drifted well past an edge.
        if (
          p.age >= p.maxAge ||
          p.x < -CULL_MARGIN ||
          p.x > width + CULL_MARGIN ||
          p.y < -CULL_MARGIN ||
          p.y > height + CULL_MARGIN
        ) {
          respawnParticle(p);
        }

        // 9. Fade in over the first frames, fade out near end of life.
        let lifeOpacity = 1;
        if (p.age < FADE_IN_FRAMES) {
          lifeOpacity = p.age / FADE_IN_FRAMES;
        } else if (p.age > p.maxAge - FADE_OUT_FRAMES) {
          lifeOpacity = (p.maxAge - p.age) / FADE_OUT_FRAMES;
        }

        drawParticle(p, lifeOpacity);
      }

      // Remember cursor position for next frame's wind calculation.
      if (cursorEnabled) {
        prevCursorX = cursorRef.current.x;
        prevCursorY = cursorRef.current.y;
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
      // On the first movement, seed prevCursor to avoid a huge (0,0)->pos gust.
      if (!cursorSeen) {
        prevCursorX = e.clientX;
        prevCursorY = e.clientY;
        cursorSeen = true;
      }
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
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
