import type { NextConfig } from "next";
import imageSizes from "./lib/image-sizes.json";

const nextConfig: NextConfig = {
  // The site's own WhatsApp button lives in the bottom-left corner, which is
  // where Next puts its dev overlay by default. Moving the overlay keeps the
  // real button clickable and visible while developing. Dev-only setting.
  devIndicators: {
    position: "bottom-right",
  },

  images: {
    // Photos are resized once at build time (scripts/optimize-images.mjs)
    // instead of on every request: on-request resizing kept ~500MB of memory
    // busy on the server around the clock, which was most of the Railway bill.
    // The loader points <Image> at the prepared files; the widths here must be
    // the ones the script prepares, so both read the same list.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: imageSizes.deviceSizes,
    imageSizes: imageSizes.imageSizes,
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
