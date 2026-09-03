import { projects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function Projects() {
  return (
    <section id="projects" className="py-24 sm:py-32">
      <div className="section-shell">
        <Reveal>
          <SectionHeading
            overline="02 · Projects"
            title="Selected work"
            description="Products I've built or contributed to — from legal AI to construction SaaS."
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal
              key={project.slug}
              delay={0.05 * (i % 2)}
              className={cn(project.featured && i === 0 && "md:col-span-2")}
            >
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
