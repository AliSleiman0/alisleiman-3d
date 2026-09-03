"use client";

import { motion } from "framer-motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/** Fade-up entrance when the element scrolls into view (once). */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotionPref();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
