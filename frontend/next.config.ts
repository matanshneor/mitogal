import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The site's own WhatsApp button lives in the bottom-left corner, which is
  // where Next puts its dev overlay by default. Moving the overlay keeps the
  // real button clickable and visible while developing. Dev-only setting.
  devIndicators: {
    position: "bottom-right",
  },

  images: {
    // Photographs of events compress well as AVIF and it saves real bytes on
    // an image-heavy page loaded mostly over mobile data.
    formats: ["image/avif", "image/webp"],
    // 62 is used for the hero slideshow, whose first frame is the page's LCP
    // image and the single heaviest thing on a phone. 75 stays the default
    // for the gallery, where photos are viewed closely.
    qualities: [62, 75],
  },

  /*
   * Security headers.
   *
   * These were declared in netlify.toml, but verifying the live response
   * showed they never arrived: Netlify's `[[headers]]` apply to static files,
   * while every HTML response here is produced by the Next.js runtime and
   * bypasses them. Declaring them in Next means they travel with the response
   * regardless of host.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // The site loads nothing from a third party unless analytics are
            // configured, so the browser can be told to block the rest.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
