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
    eyebrow: "Ali Sleiman — Software Engineer",
    headline: "Shipping products, not just code.",
    checklist: [
      "TypeScript & React, end to end",
      "Node & Spring APIs that hold up under real load",
      "Agentic AI systems wired into real workflows",
      "CI/CD pipelines that ship every day",
    ],
    cta: { label: "View projects", href: "#projects" },
  },
  skills: [
    { area: "Frontend", items: ["React", "TypeScript", "Next.js", "Tailwind CSS"] },
    { area: "Backend", items: ["Node.js", "Spring Boot", "REST APIs"] },
    { area: "Infrastructure", items: ["Docker", "SQL Server", "CI/CD"] },
    { area: "AI", items: ["Agentic AI tooling", "LLM integration", "Claude API"] },
  ],
};
