/**
 * Single source of truth for every business detail on the site.
 *
 * Changing the phone number, the Instagram handle or the site URL is a
 * one-line edit HERE — no component hard-codes any of it.
 */

export const site = {
  name: "מיתוגל",
  nameLatin: "Mitogal",
  owner: "גל אהרוני",
  /** Gal's own tagline, taken from her logo — not invented copy. */
  tagline: "מיתוג לכל אירוע",
  description:
    "מיתוגל — עיצוב ומיתוג לאירועים וחגיגות. שלטים, מיתוג מודפס ועיצוב בהתאמה אישית לחתונות, הצעות נישואין, ימי הולדת, מתנות ממותגות, חגים ואירועי קונספט.",

  /** Display format, for humans. */
  phoneDisplay: "052-336-6998",
  /** E.164 without the +, for wa.me and tel: links. */
  phoneIntl: "972523366998",

  instagram: "https://www.instagram.com/mito_gal/",
  instagramHandle: "@mito_gal",

  /** The year Gal started the business — drives the footer and the JSON-LD. */
  foundedYear: 2024,

  /** Update to the real domain once it is connected in Netlify. */
  url: "https://mitogal.netlify.app",
} as const;

/** `tel:` href built from the canonical number. */
export const telHref = `tel:+${site.phoneIntl}`;

/**
 * Build a WhatsApp deep link. Works on both mobile (opens the app) and
 * desktop (opens WhatsApp Web) with no backend involved.
 */
export function waLink(message?: string): string {
  const base = `https://wa.me/${site.phoneIntl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Default CTA message used by the floating button, the header and the hero.
 *
 * No emoji, deliberately. A trailing emoji in an RTL line is a neutral
 * character, so the bidi algorithm parks it at the LEFT edge — detached from
 * the sentence it belongs to — and a first business enquiry reads better
 * without one anyway.
 */
export const waDefaultMessage = `היי גל! הגעתי מהאתר ואשמח לשמוע פרטים על עיצוב ומיתוג לאירוע שלי`;

/** Contact-form payload. Every field is optional except the name. */
export type LeadFields = {
  name: string;
  phone?: string;
  eventType?: string;
  date?: string;
  message?: string;
};

/**
 * Compose the contact form into a ready-to-send WhatsApp message.
 *
 * This is what replaces a server: the visitor fills the form, we build the
 * message, WhatsApp opens pre-filled, they hit send. Nothing to host, nothing
 * to maintain, and the lead lands directly on Gal's phone.
 */
export function waLeadLink(lead: LeadFields): string {
  const lines = [
    "היי גל! הגעתי דרך האתר",
    "",
    `שם: ${lead.name}`,
    lead.phone && `טלפון: ${lead.phone}`,
    lead.eventType && `סוג האירוע: ${lead.eventType}`,
    lead.date && `תאריך משוער: ${formatDate(lead.date)}`,
    lead.message && `פרטים: ${lead.message}`,
  ].filter(Boolean);

  return waLink(lines.join("\n"));
}

/**
 * `<input type="date">` always hands back ISO (2026-09-12) regardless of the
 * locale shown in the picker, and that string was going straight into the
 * message — nobody in Israel writes a date that way, and it read like a
 * system field inside a personal note.
 *
 * Anything that isn't a plain ISO date is passed through untouched.
 */
function formatDate(value: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return iso ? `${iso[3]}.${iso[2]}.${iso[1]}` : value;
}
