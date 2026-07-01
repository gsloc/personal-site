'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type Variant = 'default' | 'hover' | 'active';

const variantConfig: Record<Variant, { size: number; borderColor: string; backgroundColor: string }> = {
  default: { size: 24, borderColor: 'rgba(241, 245, 249, 0.6)', backgroundColor: 'transparent' },
  hover: { size: 48, borderColor: 'rgba(34, 211, 170, 0.5)', backgroundColor: 'transparent' },
  active: { size: 16, borderColor: 'rgba(241, 245, 249, 0.6)', backgroundColor: 'transparent' },
};

export default function CustomCursor() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [variant, setVariant] = useState<Variant>('default');
  const [visible, setVisible] = useState(true);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { damping: 25, stiffness: 300 });
  const springY = useSpring(rawY, { damping: 25, stiffness: 300 });

  useEffect(() => {
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
    };

    const isOverMagnetic = (target: EventTarget | null) =>
      target instanceof Element && target.closest('[data-magnetic="true"]') !== null;

    const onMouseOver = (e: MouseEvent) => {
      setVariant(isOverMagnetic(e.target) ? 'hover' : 'default');
    };

    const onMouseDown = () => setVariant('active');
    const onMouseUp = (e: MouseEvent) => {
      setVariant(isOverMagnetic(e.target) ? 'hover' : 'default');
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [rawX, rawY]);

  const { size, borderColor, backgroundColor } = variantConfig[variant];
  const x = reducedMotion ? rawX : springX;
  const y = reducedMotion ? rawY : springY;

  return (
    <motion.div
      className="custom-cursor fixed top-0 left-0 z-50 pointer-events-none rounded-full border"
      style={{
        x,
        y,
        translateX: '-50%',
        translateY: '-50%',
        borderStyle: 'solid',
        borderWidth: '1.5px',
        backgroundColor,
        opacity: visible ? 1 : 0,
      }}
      animate={{ width: size, height: size, borderColor }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    />
  );
}
