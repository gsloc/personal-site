export type ProjectStatus = 'currently-building' | 'in-progress' | 'shipped';

export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  links: Array<{ label: string; href: string }>;
  /** Display order — lower number = shown first. Currently building always sorts to top. */
  sortOrder: number;
};

export const projects: Project[] = [
  {
    slug: 'sideplot',
    title: 'SidePlot',
    description: 'Building a platform to improve the private seller / private buyer experience. V1 releasing soon.',
    tags: ['TBD'],
    status: 'currently-building',
    links: [],
    sortOrder: 1,
  },
  {
    slug: 'hookup-ai',
    title: 'HOOKUP AI',
    description: 'An AI-powered fishing assistant that recommends what to fish, when, and where — with live weather from Open-Meteo, tide predictions from NOAA, and browser geolocation.',
    tags: ['Next.js', 'TypeScript', 'Google Gemini', 'Tailwind', 'Open-Meteo', 'NOAA'],
    status: 'shipped',
    links: [
      { label: 'Live demo', href: 'https://hookup-ai-project.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/gsloc/HOOKUP_AI.project' },
    ],
    sortOrder: 2,
  },
  {
    slug: 'csv-insight-pipeline',
    title: 'CSV Insight Pipeline',
    description: 'Drop in any CSV, get back a full data-quality report and interactive dashboard. FastAPI + Pandas backend, Next.js + Recharts frontend, 65 tests in CI.',
    tags: ['Python', 'FastAPI', 'Pandas', 'Next.js', 'TypeScript', 'Docker'],
    status: 'shipped',
    links: [
      { label: 'Live demo', href: 'https://csv-insight-pipeline.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/gsloc/CSV-Insight-Pipeline' },
    ],
    sortOrder: 3,
  },
];
