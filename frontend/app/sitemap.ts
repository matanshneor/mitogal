import type { MetadataRoute } from "next";
import { services } from "@/data/services";
import { site } from "@/lib/site.config";

/** Derived from the same data as the pages, so it can never fall out of sync. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: site.url,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...services.map((service) => ({
      url: `${site.url}/gallery/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
