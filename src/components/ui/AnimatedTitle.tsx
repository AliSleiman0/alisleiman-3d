"use client";

import { motion } from "framer-motion";
import { useReducedMotionPref } from "@/lib/useReducedMotionPref";

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

/** H1 with a per-letter staggered rise-in. Screen readers get the plain text. */
export function AnimatedTitle({ text, className }: AnimatedTitleProps) {
  const reduceMotion = useReducedMotionPref();

  if (reduceMotion) {
    return <h1 className={className}>{text}</h1>;
  }

  return (
    <motion.h1
      aria-label={text}
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.035 } } }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          variants={{
            hidden: { opacity: 0, y: "0.35em" },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
            },
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
