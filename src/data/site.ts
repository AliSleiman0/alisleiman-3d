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
};
