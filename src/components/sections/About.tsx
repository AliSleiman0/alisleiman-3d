import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

export function About() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="section-shell">
        <div className="section-divider mb-24 sm:mb-32" />
        <Reveal>
          <SectionHeading overline="01 · About" title={site.about.title} />
        </Reveal>

        <div className="grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <div className="space-y-5 text-base leading-7 text-muted">
              {site.about.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="space-y-8">
              {site.outcomes.map((outcome) => (
                <div key={outcome.title}>
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                    {outcome.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-muted">
                    {outcome.detail}
                  </p>
                </div>
              ))}

              {/* The actual tech, demoted: credibility for technical buyers
                  without the capability tags above reading as a résumé. */}
              <p className="border-t border-border-soft pt-6 text-sm leading-6 text-muted">
                {site.about.stackNote}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
