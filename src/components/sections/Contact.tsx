import { site } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="glow pointer-events-none absolute bottom-[-40vmin] left-1/2 -z-10 h-[80vmin] w-[80vmin] -translate-x-1/2"
      />

      <div className="section-shell">
        <Reveal>
          <SectionHeading
            overline="03 · Contact"
            title="Let's build something"
            description="Open to interesting problems, collaborations, and good conversations about software."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-wrap items-center gap-4">
            <Button href={`mailto:${site.email}`}>{site.email}</Button>
            {site.socials.map((social) => (
              <Button key={social.label} href={social.url} variant="ghost" external>
                {social.label}
              </Button>
            ))}
          </div>
        </Reveal>

        <footer className="mt-24 border-t border-border-soft pt-8 text-sm text-muted">
          <p>
            © {new Date().getFullYear()} {site.name} · Built with Next.js, React
            Three Fiber &amp; GSAP
          </p>
        </footer>
      </div>
    </section>
  );
}
