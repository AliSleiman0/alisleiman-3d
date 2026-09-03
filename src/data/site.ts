import type { SiteConfig } from "@/lib/types";

export const site: SiteConfig = {
  name: "Ali Sleiman",
  role: "Software Engineer",
  tagline:
    "Building full-stack products and agentic AI systems — from courtrooms to construction sites.",
  email: "sleimana181@gmail.com",
  socials: [
    { label: "GitHub", url: "https://github.com/" },
    { label: "LinkedIn", url: "https://linkedin.com/" },
  ],
  nav: [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ],
  // Placeholder copy — rewrite freely; the hero renders whatever is here.
  hero: {
    lineBehind: "Deep Work",
    lineFront: "Clean Code",
    statement: "Building the future, line by line.",
    eyebrow: "Why clients work with me",
    headline: "Your product, built and shipped end to end.",
    checklist: [
      "One partner from first idea to production — no handoffs",
      "Interfaces and APIs your users can rely on",
      "AI that solves real business problems, not demos",
      "Clear communication and visible progress, every week",
    ],
    cta: { label: "Start a project", href: "#contact" },
  },
  skills: [
    { area: "Frontend", items: ["React", "TypeScript", "Next.js", "Tailwind CSS"] },
    { area: "Backend", items: ["Node.js", "Spring Boot", "REST APIs"] },
    { area: "Infrastructure", items: ["Docker", "SQL Server", "CI/CD"] },
    { area: "AI", items: ["Agentic AI tooling", "LLM integration", "Claude API"] },
  ],
};
