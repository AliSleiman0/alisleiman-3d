import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/ui/Reveal";

export function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="section-shell">
        <div className="section-divider mb-24 sm:mb-32" />
        <Reveal>
          <SectionHeading overline="01 · About" title="Engineer across the stack" />
        </Reveal>

        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div className="space-y-5 text-base leading-7 text-muted">
              <p>
                I&apos;m {site.name}, a software engineer who builds products
                end-to-end — from React frontends and Spring Boot or Node.js
                backends to the Docker pipelines and SQL Server schemas that keep
                them running.
              </p>
              <p>
                Lately my focus has been agentic AI: shipping an AI-powered
                pre-trial intelligence agent for legal teams and building a
                desktop companion robot on my own time. I like problems where
                the interesting part is the system, not just the screen.
              </p>
              <p>
                This site is one of those problems — a scroll-driven 3D
                portfolio built with React Three Fiber, GSAP, and Next.js.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-8">
              {site.skills.map((group) => (
                <div key={group.area}>
                  <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                    {group.area}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
