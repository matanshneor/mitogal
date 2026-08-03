import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import {
  loadHebrewFont,
  logoDataUri,
  LOGO_ASPECT,
  rtl,
  OG,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from "@/lib/og";
import { serviceBySlug, services } from "@/data/services";

/**
 * Per-category link preview, tinted with that category's own colour.
 *
 * Sending a client a direct link to /gallery/birthdays now previews as an
 * amber card reading "עיצוב ומיתוג לימי הולדת" instead of the generic
 * homepage card.
 */
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return services.map((s) => ({ category: s.slug }));
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const service = serviceBySlug.get(category);
  return [{ id: "og", size, contentType, alt: service?.pageTitle ?? OG.site.name }];
}

export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const service = serviceBySlug.get(category);
  if (!service) notFound();

  const [font, logo] = await Promise.all([loadHebrewFont(), logoDataUri()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          justifyContent: "space-between",
          background: OG.paper,
          padding: 72,
          fontFamily: font ? "Assistant" : "sans-serif",
        }}
      >
        {/* Arch in this category's own colour. */}
        <div
          style={{
            position: "absolute",
            left: -150,
            bottom: -200,
            width: 470,
            height: 580,
            borderRadius: "999px 999px 40px 40px",
            background: service.hex,
            opacity: 0.4,
            display: "flex",
          }}
        />

        {/* Script as an image, tagline as text — the header's construction. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {logo ? (
            <img src={logo} alt="" width={220} height={220 / LOGO_ASPECT} />
          ) : (
            <div style={{ fontSize: 40, color: OG.ink, display: "flex" }}>
              {rtl(OG.site.name)}
            </div>
          )}
          <div
            style={{
              marginTop: 7,
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 3.4,
              color: OG.taglineInk,
              display: "flex",
            }}
          >
            {rtl(OG.site.tagline)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div style={{ fontSize: 28, color: OG.muted, display: "flex" }}>
            {rtl("גלריה")}
          </div>
          <div
            style={{
              marginTop: 12,
              fontSize: 74,
              fontWeight: 700,
              color: OG.ink,
              lineHeight: 1.12,
              display: "flex",
            }}
          >
            {rtl(service.pageTitle)}
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 30,
              color: OG.muted,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span>{OG.site.phoneDisplay}</span>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 9,
                background: OG.brand,
                display: "flex",
              }}
            />
            <span>{rtl(OG.site.name)}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Assistant", data: font, style: "normal", weight: 700 }]
        : undefined,
    }
  );
}
