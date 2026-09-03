"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="border-b border-border-soft bg-background/70 backdrop-blur-md">
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
            {site.nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
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
                    className="block py-3 text-2xl font-medium text-foreground"
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
