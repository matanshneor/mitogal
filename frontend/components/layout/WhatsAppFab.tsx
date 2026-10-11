"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { waDefaultMessage, waLink } from "@/lib/site.config";

/**
 * The always-available conversion path.
 *
 * Deliberately pinned to the physical bottom-LEFT rather than a logical
 * inset: in this RTL layout that is the trailing corner, and it is what was
 * specified. `left-4` is therefore correct and must not be swapped for `ms-`.
 */
export default function WhatsAppFab() {
  const reduced = useReducedMotion();
  // On /admin it would sit over the gallery's edit buttons, and Gal has no
  // reason to message herself.
  if (usePathname().startsWith("/admin")) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 print:hidden">
      {/* Expanding ring. Purely decorative and never intercepts taps. */}
      {!reduced && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-whatsapp"
          animate={{ scale: [1, 1.5], opacity: [0.35, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      <motion.a
        href={waLink(waDefaultMessage)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="שליחת הודעה בוואטסאפ"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-warm-lg transition-transform duration-200 hover:scale-105"
        animate={reduced ? undefined : { scale: [1, 1.06, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <MessageCircle className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
      </motion.a>
    </div>
  );
}
