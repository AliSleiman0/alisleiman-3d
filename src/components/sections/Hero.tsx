import { site } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-svh items-center overflow-hidden"
    >
      <div className="section-shell py-24">
        <Reveal>
          <p className="mb-4 font-mono text-sm tracking-widest text-accent">
            {site.role.toUpperCase()}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-7xl">
            {site.name}
          </h1>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            {site.tagline}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="#projects">View projects</Button>
            <Button href="#contact" variant="ghost">
              Get in touch
            </Button>
          </div>
        </Reveal>
      </div>

      <a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted transition-colors hover:text-foreground"
      >
        <span className="block animate-bounce text-xl" aria-hidden>
          ↓
        </span>
      </a>
    </section>
  );
}
