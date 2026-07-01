import ProjectCard, { ProjectCardProps } from './ProjectCard';

const projects: ProjectCardProps[] = [
  {
    title: 'CSV Insight Pipeline',
    description:
      'Drop in any CSV, get back a full data-quality report and interactive dashboard. FastAPI + Pandas backend, Next.js + Recharts frontend, 65 tests in CI.',
    tags: ['Python', 'FastAPI', 'Pandas', 'Next.js', 'TypeScript', 'Docker'],
    status: 'shipped',
    links: [
      { label: 'Live demo', href: 'https://csv-insight-pipeline.vercel.app' },
      { label: 'GitHub', href: 'https://github.com/gsloc/CSV-Insight-Pipeline' },
    ],
  },
  {
    title: 'HOOKUP AI',
    description:
      'An AI-powered fishing assistant that recommends what to fish, when, and where — based on real-time weather, tides, and location. Currently building Phase 3.',
    tags: ['Next.js', 'TypeScript', 'Google Gemini', 'Tailwind'],
    status: 'in-progress',
    links: [{ label: 'GitHub', href: 'https://github.com/gsloc/HOOKUP_AI.project' }],
  },
  {
    title: 'SidePlot',
    description:
      'Building a platform to improve the private seller / private buyer experience. V1 releasing soon.',
    tags: ['TBD'],
    status: 'coming-soon',
    links: [],
  },
];

export default function Work() {
  return (
    <section id="work" className="py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-aurora">
        SELECTED WORK
      </p>
      <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl font-semibold text-ice">
        Things I&apos;ve built
      </h2>
      <p className="mt-4 text-base text-slate">
        A mix of shipped projects and current builds. Every one taught me
        something.
      </p>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}
