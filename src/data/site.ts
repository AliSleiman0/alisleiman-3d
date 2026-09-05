import type { SiteConfig } from "@/lib/types";

export const site: SiteConfig = {
  name: "Ali Sleiman",
  role: "Software Engineer",
  tagline:
    "Software engineer building web apps, client portals and applied AI — one partner from first idea to launch.",
  email: "sleimana181@gmail.com",
  socials: [
    { label: "GitHub", url: "https://github.com/AliSleiman0" },
    { label: "LinkedIn", url: "https://linkedin.com/in/AliSleiman11" },
  ],
  whatsapp: {
    display: "+961 78 991 778",
    url: "https://wa.me/96178991778",
  },
  nav: [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
    { label: "Contact", href: "#contact" },
  ],
  // Placeholder copy — rewrite freely; the hero renders whatever is here.
  hero: {
    lineBehind: "Big Ideas",
    lineFront: "Real Value",
    statement:
      "I turn ambitious ideas into fast, reliable software your customers will love.",
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
  about: {
    title: "One partner, start to finish",
    paragraphs: [
      "I help companies turn an idea into software their customers actually use — the interface people touch, the systems behind it, and the infrastructure that keeps it running, handled by one person end to end.",
      "Much of my recent work is applied AI: an agent that reads across research sources and answers the question directly, and document-heavy workflows where automation saves real hours.",
      "You get visible progress every week and clear updates in plain language, from first idea through launch and beyond.",
    ],
    stackNote:
      "Built with React, Next.js, Node.js, Spring Boot, SQL Server and Docker.",
  },
  // Rides the sphere's own story — say what working together feels like,
  // never what the 3D is. `gathering` shows while the seed is still pulling
  // together; `formed` replaces it once the sphere is whole.
  intro: {
    gathering: "Rough idea in.",
    formed: "Working product out.",
  },
  contact: {
    title: "Let's build something",
    description:
      "Tell me what you're trying to build and I'll come back with an honest view of scope, timeline and cost.",
  },
  projectsIntro:
    "Work I've shipped across accounting, life sciences, education and retail — and one robot built on my own time.",
  // Named as the problem the client arrived with, not as capability. The
  // technology lives in one muted line (`about.stackNote`) and nowhere else.
  outcomes: [
    {
      title: "Bring a product to market",
      detail: "Idea to launched app, without you having to assemble a team first.",
    },
    {
      title: "Replace manual work",
      detail:
        "Spreadsheets, copy-paste and email chains become software your team actually likes using.",
    },
    {
      title: "Put AI on document busywork",
      detail:
        "Reading, extracting and summarising at volume — where it saves real hours, not as a demo.",
    },
    {
      title: "Keep it running",
      detail: "Hosting, monitoring and improvements long after launch day.",
    },
  ],
};
