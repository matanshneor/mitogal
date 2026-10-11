import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GalleryGrid from "@/components/gallery/GalleryGrid";
import Contact from "@/components/sections/Contact";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { galleryFor } from "@/data/gallery";
import { serviceBySlug, services } from "@/data/services";
import { site, waLink } from "@/lib/site.config";

/**
 * One template → six statically generated category pages.
 *
 * These exist for Google (a page that can rank for "מיתוג לחתונות" instead of
 * one generic homepage) and for sharing a direct link to a single category in
 * a WhatsApp conversation. The landing page's in-place filter remains the
 * primary path for Instagram traffic.
 *
 * Adding a seventh category to data/services.ts creates its page, its
 * metadata and its sitemap entry with no changes here.
 */

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ category: service.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const service = serviceBySlug.get(category);
  if (!service) return {};

  const url = `${site.url}/gallery/${service.slug}`;

  return {
    title: service.pageTitle,
    description: service.pageIntro,
    alternates: { canonical: `/gallery/${service.slug}` },
    openGraph: {
      type: "article",
      locale: "he_IL",
      url,
      siteName: site.name,
      title: `${service.pageTitle} | ${site.name}`,
      description: service.pageIntro,
    },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const service = serviceBySlug.get(category);
  if (!service) notFound();

  const items = galleryFor(service.slug);

  return (
    <>
      <section
        aria-labelledby="category-title"
        className="mx-auto max-w-[1200px] px-6 pb-16 pt-28 sm:pt-36"
      >
        <nav aria-label="פירורי לחם" className="mb-8">
          <Link
            href="/#portfolio"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-accent"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" aria-hidden="true" />
            לכל הגלריה
          </Link>
        </nav>

        <SectionHeading
          id="category-title"
          as="h1"
          eyebrow="גלריה"
          title={service.pageTitle}
          intro={service.pageIntro}
        />

        <div className="mt-12">
          <GalleryGrid items={items} filterKey={service.slug} />
        </div>

        <div className="mt-12">
          <ButtonLink
            href={waLink(
              `היי גל! ראיתי את הגלריה של ${service.label} באתר ואשמח להזמין עיצוב ל${service.labelSingular}`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Singular: "עיצוב לחתונה" is this visitor's wedding, whereas
                "עיצוב לחתונות" would read as the category in general. */}
            להזמנת עיצוב ל{service.labelSingular}
          </ButtonLink>
        </div>
      </section>

      {/* Other categories — keeps visitors moving and links the pages together
          for crawlers. */}
      <section
        aria-labelledby="other-categories"
        className="mx-auto max-w-[1200px] px-6 pb-20"
      >
        <h2
          id="other-categories"
          className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted"
        >
          קטגוריות נוספות
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {services
            .filter((s) => s.slug !== service.slug)
            .map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/gallery/${s.slug}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  {s.label}
                </Link>
              </li>
            ))}
        </ul>
      </section>

      <Contact />
    </>
  );
}
