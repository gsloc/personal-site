import Magnetic from './Magnetic';

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-start justify-center relative">
      <p className="font-mono text-sm uppercase tracking-widest text-aurora">
        HELLO — I&apos;M
      </p>
      <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-semibold text-ice hero-text-shadow">
        Garrett Slocumb
      </h1>
      <p className="mt-4 text-xl lg:text-3xl font-normal text-[#E2E8F0] hero-text-shadow">
        Builder, entrepreneur, and innovator.
      </p>
      <hr className="w-[60px] my-8 border-t border-slate/20" />
      <p className="text-sm md:text-base text-[#CBD5E1]">
        <span className="font-mono">Currently —</span> Building a platform to
        improve the private seller / private buyer experience.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <Magnetic>
          <a
            href="#work"
            className="rounded-lg bg-indigo px-6 py-3 text-ice font-medium hover:bg-indigo/90 transition-colors"
          >
            View my work
          </a>
        </Magnetic>
        <Magnetic>
          <a
            href="#contact"
            className="rounded-lg border border-slate/40 px-6 py-3 text-slate font-medium hover:border-ice hover:text-ice transition-colors"
          >
            Get in touch
          </a>
        </Magnetic>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
