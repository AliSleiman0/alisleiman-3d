"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/data/site";
import { getActiveSection, subscribeActiveSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { ScrollProgressBar } from "./ScrollProgressBar";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const activeSection = useSyncExternalStore(
    subscribeActiveSection,
    getActiveSection,
    () => "hero"
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="relative border-b border-border-soft bg-background/70 backdrop-blur-md">
        <ScrollProgressBar />
        <div className="section-shell flex h-16 items-center justify-between">
          <a
            href="#hero"
            className="font-mono text-sm font-semibold tracking-tight text-foreground"
            onClick={() => setOpen(false)}
          >
            {site.name.toLowerCase().replace(" ", ".")}
            <span className="text-accent">()</span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            {site.nav.map((item) => {
              const isActive = item.href === `#${activeSection}`;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "relative text-sm transition-colors hover:text-foreground",
                      isActive ? "text-foreground" : "text-muted"
                    )}
                  >
                    {item.label}
                    <span
                      className={cn(
                        "absolute -bottom-1.5 left-0 h-px w-full bg-accent transition-opacity",
                        isActive ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center md:hidden"
          >
            <span
              className={cn(
                "absolute h-px w-5 bg-foreground transition-transform duration-200",
                open ? "rotate-45" : "-translate-y-1"
              )}
            />
            <span
              className={cn(
                "absolute h-px w-5 bg-foreground transition-transform duration-200",
                open ? "-rotate-45" : "translate-y-1"
              )}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-lg md:hidden"
          >
            <ul className="flex flex-col gap-2 px-6 py-10">
              {site.nav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block py-3 text-2xl font-medium",
                      item.href === `#${activeSection}`
                        ? "text-accent"
                        : "text-foreground"
                    )}
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
