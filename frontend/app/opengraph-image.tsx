import { ImageResponse } from "next/og";
import {
  loadHebrewFont,
  logoDataUri,
  LOGO_ASPECT,
  rtl,
  OG,
  OG_SIZE,
  OG_CONTENT_TYPE,
} from "@/lib/og";

/**
 * The link-preview card.
 *
 * This matters more here than on most sites: essentially all traffic arrives
 * from the Instagram bio link or from someone forwarding the URL on WhatsApp,
 * and both render this image. Without it the link shows as a blank rectangle.
 *
 * Every Hebrew string goes through rtl() — see the note there on why Satori
 * needs text pre-reversed.
 */
export const alt = `${OG.site.name} — ${OG.site.tagline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
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
        {/* Turquoise arch bleeding off the left edge — the site's motif. */}
        <div
          style={{
            position: "absolute",
            left: -150,
            bottom: -200,
            width: 470,
            height: 580,
            borderRadius: "999px 999px 40px 40px",
            background: OG.brand,
            opacity: 0.3,
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
            <img src={logo} alt="" width={260} height={260 / LOGO_ASPECT} />
          ) : (
            <div style={{ fontSize: 44, color: OG.ink, display: "flex" }}>
              {rtl(OG.site.name)}
            </div>
          )}
          <div
            style={{
              marginTop: 8,
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 4,
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
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: OG.ink,
              lineHeight: 1.12,
              display: "flex",
            }}
          >
            {rtl("הופכים כל רגע")}
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: OG.brandDeep,
              lineHeight: 1.12,
              display: "flex",
            }}
          >
            {rtl("לבלתי נשכח")}
          </div>

          <div
            style={{
              marginTop: 30,
              fontSize: 32,
              color: OG.muted,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Phone stays in logical order — reversing digits would break it. */}
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
            <span>{rtl("שלטים · מתנות · פינות צילום")}</span>
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
