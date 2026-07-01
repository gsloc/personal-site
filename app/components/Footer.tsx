import Magnetic from './Magnetic';

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-300 group-hover/link:translate-x-1"
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-slate/10 py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <p className="font-mono text-xs uppercase tracking-widest text-aurora">
          GET IN TOUCH
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-ice">
          Let&apos;s connect.
        </h2>
        <p className="mt-4 max-w-[600px] text-base text-slate">
          Currently open to conversations about software engineering roles,
          entrepreneurial collaborations, or interesting problems worth
          solving. Reach out anytime.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Magnetic>
            <a
              href="https://github.com/gsloc"
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center gap-1 text-aurora text-sm font-medium"
            >
              GitHub
              <ArrowIcon />
            </a>
          </Magnetic>
          {/* TODO: replace with real LinkedIn URL */}
          <Magnetic>
            <a
              href="#"
              className="group/link flex items-center gap-1 text-aurora text-sm font-medium"
            >
              LinkedIn
              <ArrowIcon />
            </a>
          </Magnetic>
          <Magnetic>
            <a
              href="mailto:gsloc@unc.edu"
              className="group/link flex items-center gap-1 text-aurora text-sm font-medium"
            >
              Email
              <ArrowIcon />
            </a>
          </Magnetic>
        </div>
        <p className="mt-8 text-xs text-slate/60">
          Garrett Slocumb · Built in Chapel Hill · {year}
        </p>
      </div>
    </footer>
  );
}
