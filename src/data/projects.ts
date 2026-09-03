import type { Project } from "@/lib/types";

export const projects: Project[] = [
  {
    slug: "pretrial-intelligence-agent",
    title: "AI Pre-Trial Intelligence Agent",
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
    accentColor: "#6366f1",
    featured: true,
  },
  {
    slug: "cpa-membership-portal",
    title: "CPA Membership Lifecycle Portal",
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
    accentColor: "#0ea5e9",
    featured: true,
  },
  {
    slug: "bid-analysis-saas",
    title: "SaaS Bid-Analysis for Construction",
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
    accentColor: "#f59e0b",
    featured: true,
  },
  {
    slug: "taxi-platform",
    title: "Taxi Platform",
    summary:
      "A ride-hailing platform covering dispatch, tracking, and trip management.",
    description:
      "Placeholder description — full case study to come. Dispatching, live tracking, and trip lifecycle management for a taxi service.",
    role: "Full-Stack Engineer",
    stack: ["React", "Node.js", "Docker"],
    highlights: [
      "Dispatch and trip management",
      "Live tracking",
      "Driver and rider experiences",
    ],
    accentColor: "#22c55e",
  },
  {
    slug: "ai-desktop-companion",
    title: "AI Desktop Companion Robot",
    summary:
      "A personal project: a desktop companion robot powered by an AI agent.",
    description:
      "Placeholder description — full case study to come. Hardware + software personal project exploring embodied AI: voice interaction, expressive behavior, and agentic capabilities on the desk.",
    role: "Creator",
    stack: ["Agentic AI", "Node.js", "Embedded"],
    highlights: [
      "Voice interaction",
      "Expressive robot behaviors",
      "Agentic AI integration",
    ],
    accentColor: "#ec4899",
  },
];
