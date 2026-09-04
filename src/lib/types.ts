export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  slug: string;
  title: string;
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

export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  email: string;
  location?: string;
  socials: ProjectLink[];
  nav: { label: string; href: string }[];
  skills: { area: string; items: string[] }[];
  hero: HeroContent;
}
