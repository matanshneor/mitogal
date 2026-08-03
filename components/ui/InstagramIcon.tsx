import type { SVGProps } from "react";

/**
 * lucide-react v1 dropped its brand icons, so this is a local stand-in drawn
 * in the same thin-stroke geometric style (24px grid, 2px stroke, round caps)
 * to stay visually consistent with the rest of the icon set.
 *
 * Always decorative here — every use site supplies its own aria-label on the
 * surrounding link.
 */
export default function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
