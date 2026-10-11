/**
 * First focusable element on the page. Invisible until it receives focus,
 * then lets keyboard users jump past the header straight into the content.
 */
export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
    >
      דילוג לתוכן הראשי
    </a>
  );
}
