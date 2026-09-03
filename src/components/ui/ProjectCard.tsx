"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/types";
import { Tag } from "./Tag";

export function ProjectCard({ project }: { project: Project }) {
  const reduceMotion = useReducedMotion();
  const accent = project.accentColor ?? "var(--accent)";

  return (
    <motion.article
      whileHover={reduceMotion ? undefined : { y: -4 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{ "--card-accent": accent } as React.CSSProperties}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-white/20 sm:p-8"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-60 transition-opacity group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, var(--card-accent), transparent)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ background: "var(--card-accent)" }}
      />

      <p className="mb-2 font-mono text-xs" style={{ color: "var(--card-accent)" }}>
        {project.role}
      </p>
      <h3 className="text-xl font-semibold tracking-tight text-foreground">
        {project.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-muted">{project.summary}</p>

      <ul className="mt-5 space-y-1.5">
        {project.highlights.map((h) => (
          <li key={h} className="flex items-start gap-2 text-sm text-foreground/70">
            <span
              aria-hidden
              className="mt-2 h-1 w-1 shrink-0 rounded-full"
              style={{ background: "var(--card-accent)" }}
            />
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        {project.stack.map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
      </div>

      {project.links && project.links.length > 0 && (
        <div className="mt-4 flex gap-4">
          {project.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </motion.article>
  );
}
