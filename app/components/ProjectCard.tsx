export type ProjectStatus = 'shipped' | 'in-progress' | 'coming-soon';

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  status: ProjectStatus;
  links: ProjectLink[];
}

const statusLabel: Record<Exclude<ProjectStatus, 'shipped'>, string> = {
  'in-progress': 'In progress',
  'coming-soon': 'Coming soon',
};

const statusClasses: Record<Exclude<ProjectStatus, 'shipped'>, string> = {
  'in-progress': 'text-aurora bg-aurora/10',
  'coming-soon': 'text-slate bg-slate/10',
};

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

export default function ProjectCard({
  title,
  description,
  tags,
  status,
  links,
}: ProjectCardProps) {
  return (
    <div className="relative rounded-2xl bg-surface border-[0.5px] border-slate/20 p-8 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-indigo/40 hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]">
      {status !== 'shipped' && (
        <span
          className={`absolute top-8 right-8 font-mono text-[10px] uppercase tracking-wide px-2 py-1 rounded ${statusClasses[status]}`}
        >
          {statusLabel[status]}
        </span>
      )}
      <h3 className="text-xl font-semibold text-ice pr-24">{title}</h3>
      <p className="mt-3 text-slate text-sm leading-relaxed">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="font-mono text-xs text-slate bg-midnight px-2.5 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
      {links.length > 0 && (
        <div className="mt-4 flex items-center gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-center gap-1 text-aurora text-sm font-medium"
            >
              {link.label}
              <ArrowIcon />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
