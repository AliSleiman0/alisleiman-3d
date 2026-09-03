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
  /** Hex color used for section accents / 3D theming per project. */
  accentColor?: string;
  featured?: boolean;
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
}
