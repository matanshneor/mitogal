"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * The single scroll-reveal wrapper used across the whole site.
 *
 * Keeping it in one small leaf component means Framer Motion is never pulled
 * into the section components themselves — those stay Server Components and
 * ship no JavaScript.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Stagger siblings by passing 0.05, 0.1, ... */
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      // The server renders this with opacity:0, so a <noscript> rule in
      // app/layout.tsx forces it visible when JavaScript never arrives.
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
