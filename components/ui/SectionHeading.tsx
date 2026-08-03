import Reveal from "./Reveal";

/**
 * Section headings.
 *
 * The previous version opened all seven sections identically (eyebrow → serif
 * → gold rule), which is what made the page read as one long template. This
 * one drops the rule entirely and puts the accent inside the type: an
 * `accent` word rendered in the section's colour, so the heading itself
 * carries the emphasis instead of a decoration underneath it.
 */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  /** Rendered in `accentClass` immediately after the title. */
  accent,
  intro,
  as: Tag = "h2",
  align = "start",
  accentClass = "text-brand-deep",
  className = "",
}: {
  id: string;
  eyebrow?: string;
  title: string;
  accent?: string;
  intro?: string;
  /** Category pages use h1; landing-page sections use h2. */
  as?: "h1" | "h2";
  align?: "start" | "center";
  accentClass?: string;
  className?: string;
}) {
  const centered = align === "center";

  return (
    <Reveal className={`${centered ? "text-center" : "text-start"} ${className}`}>
      {eyebrow && (
        <p className="text-label font-semibold uppercase text-muted">{eyebrow}</p>
      )}

      <Tag
        id={id}
        className={`font-display font-semibold text-ink ${
          Tag === "h1" ? "text-h1" : "text-h2"
        } ${eyebrow ? "mt-2" : ""}`}
      >
        {title}
        {accent && <span className={accentClass}> {accent}</span>}
      </Tag>

      {intro && (
        <p
          className={`mt-4 max-w-prose text-body-lg text-muted ${
            centered ? "mx-auto" : ""
          }`}
        >
          {intro}
        </p>
      )}
    </Reveal>
  );
}
