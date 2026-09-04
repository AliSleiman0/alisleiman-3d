import type { Project } from "@/lib/types";

/**
 * Order is meaningful: the Projects grid assigns tile geometry by index, and
 * slot 3 (index 2) is the tall portrait tile at the centre of the composition.
 * Reordering here reshuffles the layout — see components/sections/ProjectsGrid.
 *
 * Prose is still placeholder; real case-study copy is a pending content task.
 */
export const projects: Project[] = [
  {
    slug: "avid",
    title: "Avid",
    summary:
      "An AI-powered agent that assembles pre-trial intelligence from case documents, filings, and public records.",
    description:
      "Placeholder description — full case study to come. Covers document ingestion, entity extraction, and agentic research workflows that surface relevant precedent and risk signals for legal teams ahead of trial.",
    role: "Software Engineer",
    stack: ["React", "Node.js", "Agentic AI", "SQL Server"],
    highlights: [
      "Agentic document analysis pipeline",
      "Entity and relationship extraction",
      "Research synthesis for legal teams",
    ],
    image: "/images/projects/avid.jpg",
    accentColor: "#6366f1",
    featured: true,
  },
  {
    slug: "lacpa",
    title: "LACPA",
    summary:
      "A portal managing the full membership lifecycle for a CPA organization — applications, renewals, dues, and credentials.",
    description:
      "Placeholder description — full case study to come. End-to-end membership management including application workflows, renewal automation, and member self-service.",
    role: "Full-Stack Engineer",
    stack: ["React", "Spring Boot", "SQL Server", "Docker"],
    highlights: [
      "Application and renewal workflows",
      "Dues and payment lifecycle",
      "Member self-service portal",
    ],
    image: "/images/projects/lacpa.jpg",
    accentColor: "#0ea5e9",
    featured: true,
  },
  {
    slug: "ta-scan-agent",
    title: "TA Scan Agent",
    summary:
      "Placeholder summary — full case study to come.",
    description:
      "Placeholder description — full case study to come.",
    role: "Software Engineer",
    stack: ["React", "Node.js", "Agentic AI"],
    highlights: [
      "Placeholder highlight",
      "Placeholder highlight",
      "Placeholder highlight",
    ],
    image: "/images/projects/ta-scan-agent.jpg",
    accentColor: "#a855f7",
    featured: true,
  },
  {
    slug: "mag",
    title: "MAG",
    summary:
      "A bid-analysis feature for a construction SaaS platform, helping companies evaluate and compare bids.",
    description:
      "Placeholder description — full case study to come. Structured bid comparison, cost breakdowns, and analysis tooling built into an existing SaaS product.",
    role: "Software Engineer",
    stack: ["React", "Node.js", "SQL Server"],
    highlights: [
      "Structured bid comparison",
      "Cost breakdown analysis",
      "Integrated into existing SaaS platform",
    ],
    image: "/images/projects/mag.jpg",
    accentColor: "#f59e0b",
  },
  {
    slug: "beastfit-wear",
    title: "Beastfit Wear",
    summary:
      "Placeholder summary — full case study to come.",
    description:
      "Placeholder description — full case study to come.",
    role: "Full-Stack Engineer",
    stack: ["React", "Node.js"],
    highlights: [
      "Placeholder highlight",
      "Placeholder highlight",
      "Placeholder highlight",
    ],
    image: "/images/projects/beastfit-wear.jpg",
    accentColor: "#22c55e",
  },
];
