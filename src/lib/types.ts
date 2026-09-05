export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  /** Plain-language name for what this IS — the bold line on the grid tile.
   * Client-facing: a visitor who has never heard of the client should understand
   * it. The client's own name lives in `client`, not here. */
  title: string;
  /** Small uppercase line above the title on the tile, e.g. "Accounting ·
   * Member portal". Sector first so the breadth reads at a glance. */
  sector: string;
  /** The real client / product name. Kept for case studies and credibility;
   * not currently shown on the grid. */
  client: string;
  summary: string;
  description: string;
  role: string;
  stack: string[];
  highlights: string[];
  links?: ProjectLink[];
  /**
   * Grid tile image for the Projects section, served from /public.
   * Spelled out rather than derived from the slug so a wrong or missing
   * filename is visible here instead of silently 404-ing at request time.
   */
  image: string;
  /** Hex color used for section accents / 3D theming per project. */
  accentColor?: string;
  featured?: boolean;
}

/** Copy for the pinned-photo hero's scroll beats, in scroll order. */
export interface HeroContent {
  /** Occluded display line — passes behind the subject in the photo. */
  lineBehind: string;
  /** Front display line — layered over the photo, sweeps opposite. */
  lineFront: string;
  /** Beat-2 standalone statement that slides through after the lines exit. */
  statement: string;
  /** Small caps line above the resolve headline. */
  eyebrow: string;
  /** Beat-3 resolve headline (the page's h1). */
  headline: string;
  /** Reveals one at a time under the headline; keep to 4 short items. */
  checklist: string[];
  cta: { label: string; href: string };
}

/** Copy for the About section. Client-facing throughout — this section talks to
 * someone deciding whether to hire, not to another engineer reading a résumé. */
export interface AboutContent {
  /** Section h2. */
  title: string;
  /** Body paragraphs, in order. */
  paragraphs: string[];
  /** Muted one-liner under the capability groups. Keeps a credibility signal
   * for technical buyers without making the tag list read as a résumé. */
  stackNote: string;
}

/** Copy for the intro beat (the particle sphere between About and Projects). */
export interface IntroContent {
  /** Shown while the sphere is still gathering; fades out before `formed`
   * appears — the two never coexist. A few words each, read in a glance. */
  gathering: string;
  /** Shown once the sphere is whole (IntroAct's GROW_END). */
  formed: string;
}

export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  email: string;
  location?: string;
  socials: ProjectLink[];
  nav: { label: string; href: string }[];
  /** What the client gets, named as the problem they came here to solve —
   * NOT a capability or technology list. A tag cloud of technical nouns
   * ("APIs", "CI/CD") reads as a résumé; nobody shops for an API. */
  outcomes: { title: string; detail: string }[];
  hero: HeroContent;
  about: AboutContent;
  intro: IntroContent;
  /** Subtitle under the Projects heading. */
  projectsIntro: string;
  /** Contact section copy. This is where the hero's "Start a project" CTA
   * lands, so it must read as an invitation to hire, not to chat. */
  contact: { title: string; description: string };
}
