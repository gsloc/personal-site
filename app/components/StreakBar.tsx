'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const TARGET_DAYS = 30;

interface StreakData {
  daysRemaining: number;
  message: string;
}

type StreakState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: StreakData };

function barColor(daysRemaining: number): string {
  if (daysRemaining < 0) return '#EF4444';
  if (daysRemaining <= 9) return '#EF4444';
  if (daysRemaining <= 19) return '#FBBF24';
  return '#22D3AA';
}

export default function StreakBar() {
  const [state, setState] = useState<StreakState>({ status: 'loading' });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchStreak() {
      try {
        // If site gets significant traffic, migrate this fetch to a serverless function with a GITHUB_TOKEN to raise rate limit to 5000/hr
        const res = await fetch(
          'https://api.github.com/repos/gsloc/personal-site/commits?per_page=1'
        );

        if (!res.ok) {
          throw new Error(`GitHub API responded with ${res.status}`);
        }

        const commits = await res.json();
        const latest = commits[0];
        if (!latest) {
          throw new Error('No commits returned');
        }

        const commitDate = new Date(latest.commit.committer.date);
        const daysSince = Math.floor((Date.now() - commitDate.getTime()) / 86400000);
        const daysRemaining = TARGET_DAYS - daysSince;
        const message: string = latest.commit.message.split('\n')[0];

        if (!cancelled) {
          setState({ status: 'ready', data: { daysRemaining, message } });
        }
      } catch (err) {
        console.error('Failed to fetch commit streak:', err);
        if (!cancelled) {
          setState({ status: 'error' });
        }
      }
    }

    fetchStreak();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === 'error') {
    return null;
  }

  const containerClass =
    'w-[280px] rounded-xl bg-surface/80 backdrop-blur-md border border-slate/20 p-3 shadow-lg';

  if (state.status === 'loading') {
    return (
      <div className={containerClass}>
        <div className="h-2.5 w-24 rounded bg-slate/20" />
        <div className="mt-3 h-8 w-16 rounded bg-slate/20" />
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate/20" />
        <div className="mt-3 h-2.5 w-full rounded bg-slate/20" />
      </div>
    );
  }

  const { daysRemaining, message } = state.data;
  const overdue = daysRemaining < 0;
  const shouldPulse = daysRemaining < 10;
  const color = barColor(daysRemaining);
  const width = Math.max(0, Math.min(100, (daysRemaining / TARGET_DAYS) * 100));

  const Wrapper = shouldPulse && !reducedMotion ? motion.div : 'div';
  const wrapperMotionProps =
    shouldPulse && !reducedMotion
      ? {
          animate: { scale: [1, 1.02, 1] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }
      : {};

  const BarInner = shouldPulse && !reducedMotion ? motion.div : 'div';
  const barMotionProps =
    shouldPulse && !reducedMotion
      ? {
          animate: { opacity: [1, 0.7, 1] },
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }
      : {};

  return (
    <Wrapper className={containerClass} {...wrapperMotionProps}>
      <p className="font-mono text-[10px] uppercase tracking-widest text-aurora">
        SHIPPING STREAK
      </p>
      <div className="mt-2">
        {overdue ? (
          <span className="text-xl font-bold uppercase text-red-500">OVERDUE</span>
        ) : (
          <span>
            <span className="text-[32px] font-bold text-ice">{daysRemaining}</span>{' '}
            <span className="text-xs text-slate">days left</span>
          </span>
        )}
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate/10 overflow-hidden">
        <BarInner
          className="h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: color }}
          {...barMotionProps}
        />
      </div>
      <p className="mt-3 text-[11px] text-slate overflow-hidden text-ellipsis whitespace-nowrap">
        Last: &quot;{message}&quot;
      </p>
    </Wrapper>
  );
}
