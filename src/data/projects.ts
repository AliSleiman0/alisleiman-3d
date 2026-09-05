import type { Project } from "@/lib/types";

/**
 * Order is meaningful: the Projects grid assigns tile geometry by index, and
 * index 2 is the centre anchor — the tall portrait tile, and the first to
 * arrive in the scroll assembly. It is the only slot with a portrait source
 * image, so whatever sits there must have one. Reordering reshuffles the
 * layout; see components/sections/ProjectsGrid.
 *
 * `title` is what the thing IS in plain language, not the client's name — a
 * visitor who has never heard of LACPA should still understand the tile. The
 * client name is kept in `client` for case studies and credibility.
 *
 * `description` is the long-form case-study paragraph. It is not rendered on
 * the grid today — the tile caption shows `sector` + `title` only — so it
 * exists for the case-study pages that don't exist yet. Keep it client-facing
 * and claim nothing that can't be backed up: no metrics, no dates.
 */
export const projects: Project[] = [
  {
    slug: "member-portal",
    title: "Members, renewals and dues in one place",
    sector: "Accounting · Member portal",
    client: "LACPA",
    summary:
      "Applications, renewals, dues and credentials for a professional accounting body — handled in one system instead of across email and spreadsheets.",
    description:
      "Full membership lifecycle: application workflows and approvals, automated renewals, dues and payment handling, and a self-service portal where members manage their own records and credentials.",
    role: "Full-Stack Engineer",
    stack: ["React", "Spring Boot", "SQL Server", "Docker"],
    highlights: [
      "Applications and renewals, start to finish",
      "Dues and payments handled automatically",
      "Members serve themselves instead of emailing staff",
    ],
    image: "/images/projects/member-portal.jpg",
    accentColor: "#0ea5e9",
    featured: true,
  },
  {
    slug: "research-agent",
    title: "Research answers, not search results",
    sector: "Life sciences · AI agent",
    client: "TA Scan Agent",
    summary:
      "An AI agent that reads across sources and answers the question directly, instead of handing back a list of documents to sift through.",
    description:
      "Ask a question in plain language and get an answer back, not a reading list. The agent works across the whole document corpus rather than one file at a time, pulls the relevant passages together, and attaches the sources behind every claim so the answer can be checked instead of trusted. It replaces the hours spent opening documents one by one just to find out whether they matter.",
    role: "Software Engineer",
    stack: ["React", "Node.js", "Agentic AI"],
    highlights: [
      "Answers with the source attached",
      "Reads across a whole corpus, not one file",
      "Cuts manual review time",
    ],
    image: "/images/projects/research-agent.jpg",
    accentColor: "#a855f7",
    featured: true,
  },
  {
    // Centre anchor — needs the portrait source image.
    slug: "desk-companion-robot",
    title: "An AI companion that lives on your desk",
    sector: "Hardware · AI companion",
    client: "Avid",
    summary:
      "A desktop robot with a voice interface and an expressive face — hardware and software built together, so the AI is something you look at and talk to rather than a chat window.",
    description:
      "An AI you look at and talk to rather than type at. Built end to end — electronics, firmware and software — so the voice, the face and the behaviour behind them are one system rather than three bolted together: it listens, answers out loud, and shows what it is doing while it works.",
    role: "Creator",
    stack: ["Agentic AI", "Node.js", "Embedded"],
    highlights: [
      "Voice in, expression out",
      "Custom hardware and firmware",
      "Agentic AI behind the face",
    ],
    image: "/images/projects/desk-companion-robot.jpg",
    accentColor: "#6366f1",
    featured: true,
  },
  {
    slug: "academic-advisor",
    title: "Course plans that actually fit",
    sector: "Education · Student platform",
    client: "MAG",
    summary:
      "Academic advising and course planning — students see what to take and when, and advisors see who is drifting off track before it becomes a problem.",
    description:
      "Degree planning that understands the rules. Students build a schedule against the real requirements and prerequisites and can see what to take and when, instead of reconstructing it from a PDF catalogue every semester. Advisors get the same picture across everyone they look after, with students drifting off track surfaced while there is still time to act.",
    role: "Software Engineer",
    stack: ["React", "Node.js", "SQL Server"],
    highlights: [
      "Plans that respect prerequisites",
      "Progress visible to student and advisor",
      "At-risk students surfaced early",
    ],
    image: "/images/projects/academic-advisor.jpg",
    accentColor: "#f59e0b",
  },
  {
    slug: "fitness-storefront",
    title: "A storefront built to convert",
    sector: "Retail · Online store",
    client: "Beastfit Wear",
    summary:
      "An online store for a fitness apparel brand — browsing, product pages and checkout built to get people from looking to buying.",
    description:
      "A direct-to-consumer store for a fitness apparel brand: a catalogue people can actually browse, product pages written and built to sell, and a checkout that keeps them moving instead of losing them a step before the end. The brand runs its own storefront on its own terms rather than renting shelf space in someone else's marketplace.",
    role: "Full-Stack Engineer",
    stack: ["React", "Node.js"],
    highlights: [
      "Product pages built to sell",
      "Checkout that doesn't lose people",
      "Runs on the brand's own terms",
    ],
    image: "/images/projects/fitness-storefront.jpg",
    accentColor: "#22c55e",
  },
];
