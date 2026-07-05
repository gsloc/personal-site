import ProjectCard from './ProjectCard';
import StreakBar from './StreakBar';
import { projects } from '../data/projects';

export default function Work() {
  const sortedProjects = [...projects].sort((a, b) => a.sortOrder - b.sortOrder);

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
        {sortedProjects.map(({ slug, sortOrder, ...cardProps }) => (
          <ProjectCard key={slug} {...cardProps} />
        ))}
      </div>
      <div className="mt-16">
        <StreakBar />
      </div>
    </section>
  );
}
