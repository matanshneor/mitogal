"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/ui/Logo";
import { site, waDefaultMessage, waLink } from "@/lib/site.config";

const NAV = [
  { href: "/#services", id: "services", label: "סוגי אירועים" },
  { href: "/#portfolio", id: "portfolio", label: "גלריה" },
  { href: "/#process", id: "process", label: "איך זה עובד" },
  { href: "/#about", id: "about", label: "אודות" },
  { href: "/#contact", id: "contact", label: "יצירת קשר" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const onHome = pathname === "/";

  // The header sits on paper, so it only needs a subtle lift once the page
  // starts moving — no colour inversion required any more.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the section currently in view, so the nav reports where you are
  // instead of being a static list.
  useEffect(() => {
    if (!onHome) return;

    const sections = NAV.map((n) => document.getElementById(n.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [onHome]);

  // While the menu is open: lock the page, trap focus, close on Escape.
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])"
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled || open
          ? "bg-paper/90 shadow-ink backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1200px] items-center justify-between px-6">
        <Link
          href="/"
          aria-label={`${site.name} — לעמוד הבית`}
          className="inline-flex items-center"
        >
          <Logo decorative priority size="sm" />
        </Link>

        <nav aria-label="ניווט ראשי" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => {
              const isActive = onHome && active === item.id;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "true" : undefined}
                    // min-h-11: the desktop nav appears from 768px, which is
                    // still a touch device, so these need real tap targets.
                    className={`relative inline-flex min-h-11 items-center font-display text-sm font-medium transition-colors hover:text-brand-deep ${
                      isActive ? "text-brand-deep" : "text-ink"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
            <li>
              <a
                href={waLink(waDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 font-display text-sm font-semibold text-ink transition-all hover:brightness-105"
              >
                דברו איתנו
              </a>
            </li>
          </ul>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "סגירת התפריט" : "פתיחת התפריט"}
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
        >
          {open ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            initial={reduced ? undefined : { opacity: 0, y: -8 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-line bg-paper md:hidden"
          >
            <nav aria-label="ניווט ראשי במובייל" className="px-6 py-4">
              <ul className="flex flex-col">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="block py-3.5 font-display text-xl font-medium text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <a
                href={waLink(waDefaultMessage)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-3 flex min-h-13 w-full items-center justify-center rounded-full bg-brand px-6 font-display font-semibold text-ink"
              >
                דברו איתנו בוואטסאפ
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
