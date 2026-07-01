'use client';

import { useEffect, useState } from 'react';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const updateScrolled = () => {
      setScrolled(window.scrollY > 8);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrolled);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-midnight/80 backdrop-blur-sm border-b border-slate/10'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between h-16">
        <a href="#" className="text-indigo text-xl font-semibold">
          GS
        </a>
        <div className="flex items-center gap-8">
          <a href="#work" className="text-slate hover:text-ice transition-colors">
            Work
          </a>
          <a href="#about" className="text-slate hover:text-ice transition-colors">
            About
          </a>
          <a href="#contact" className="text-slate hover:text-ice transition-colors">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}
