"use client";

import { useGalleryFilter } from "@/components/gallery/FilterContext";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { classesFor, services } from "@/data/services";

/**
 * The six event categories.
 *
 * Replaces the previous white-card-with-a-small-icon grid, which is the most
 * generic pattern on the web. Each tile is now a solid block of its own
 * category colour with the icon at display size — the grid itself becomes the
 * page's colour, which is what lets the site feel festive before a single
 * photograph has been uploaded.
 *
 * Ink text on the vivid fills, never white: at these saturations white fails
 * contrast on every one of them, while ink clears 4.5:1 on all six.
 */
export default function Services() {
  const { selectAndScroll } = useGalleryFilter();

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="mx-auto max-w-[1200px] px-6 py-20 sm:py-28"
    >
      <SectionHeading
        id="services-title"
        eyebrow="מה אנחנו מעצבים"
        title="לכל אירוע"
        accent="שפה משלו"
        intro="בוחרים סוג אירוע כדי לראות עבודות מתוכו."
      />

      <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
        {services.map((service, i) => {
          const Icon = service.icon;
          const c = classesFor(service.slug);

          return (
            <li key={service.slug}>
              <Reveal delay={i * 0.05} className="h-full">
                <button
                  type="button"
                  onClick={() => selectAndScroll(service.slug)}
                  className={`group flex h-full w-full flex-col items-start gap-3 rounded-[1.5rem] p-5 text-start text-ink transition-all duration-300 hover:-translate-y-1 hover:shadow-ink-lg sm:p-6 ${c.bg}`}
                >
                  <Icon
                    className="h-9 w-9 transition-transform duration-300 group-hover:scale-110"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="font-display text-h3 font-semibold">
                    {service.label}
                  </span>
                  <span className="text-sm text-ink/70">{service.tagline}</span>
                </button>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
