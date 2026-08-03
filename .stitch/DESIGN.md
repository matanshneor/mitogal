---
name: מיתוגל — Print Shop
implementedIn: app/globals.css (@theme)
logoSource: brand/logo-original.jpeg
colors:
  paper: '#F7F9F9'
  surface: '#FFFFFF'
  ink: '#15191A'
  muted: '#66716F'
  line: '#E1E7E7'
  brand: '#6ED7D8'
  brand-deep: '#3C7677'
  brand-tint: '#E9F9F9'
  whatsapp: '#25D366'
categories:
  weddings:  { vivid: '#E8A0AE', deep: '#8C6169', tint: '#FCF4F5' }
  gifts:     { vivid: '#F5906B', deep: '#9D5C44', tint: '#FEF2ED' }
  proposals: { vivid: '#DE6088', deep: '#AE4B6B', tint: '#FBECF1' }
  birthdays: { vivid: '#F5C25A', deep: '#846931', tint: '#FEF8EB' }
  holidays:  { vivid: '#7CC98D', deep: '#497753', tint: '#EFF9F1' }
  concept:   { vivid: '#8E9BE0', deep: '#616A99', tint: '#F1F3FB' }
fonts:
  display: Fredoka
  body: Assistant
radius:
  card: 1.5rem
  button: 9999px
  arch: 999px 999px 1.5rem 1.5rem
spacing:
  container-margin: 24px
  max-width: 1200px
  section-gap-mobile: 80px
  section-gap-desktop: 112px
---

# מיתוגל — Design System

Source of truth for the visual language. Every token above is implemented
verbatim in the `@theme` block of [`app/globals.css`](../app/globals.css) —
there is no `tailwind.config.js`. Change a value there and it propagates.

## Creative North Star: "Print Shop"

Gal prints, cuts, folds and packs. Her actual products are branded chocolate
wrappers, printed snack bags, acrylic plaques, menus and gift packaging — not
venue styling. The site is built from that material world: fresh paper stock,
saturated inks, die-cut rounded corners, and arches.

The arch is not a decorative choice. It shows up in Gal's own work — the
acrylic thank-you plaques are literally arch-shaped — and it doubles as the
silhouette of a balloon arch. It is reserved for key imagery so it stays a
motif rather than a texture.

> **Superseded:** an earlier version of this site used a warm cream canvas,
> a serif display face and a gold hairline accent. That is the single most
> common default in AI-generated design, it looked templated, and it was
> replaced. Do not drift back toward it.

## Colour

**The brand colour was sampled, not invented.** `#6ED7D8` comes straight out
of the "Gal" in Gal's own wordmark. It is light, which makes it a **fill
colour only — always with ink text** (10.4:1). `brand-deep` `#3C7677` is the
variant that carries white text and works as a text colour on paper.

**One colour per category.** Each of the six categories owns a hue that colours
its tile, its filter chip and its social share image. Every hue exists in three
roles:

| Role | Use | Pairs with |
|---|---|---|
| `vivid` | large fills — category tiles | **ink text only** |
| `-deep` | small text, white-on-colour | white, or paper |
| `-tint` | full-width section bands, placeholder tiles | ink text |

The hues are warm so they read as one family against the cool brand turquoise.
Holidays is green rather than teal specifically so it cannot be mistaken for
the brand colour.

> **All 26 colour pairs were verified against WCAG AA and pass.** The rule that
> makes a colourful site accessible here is *ink on vivid fills, never white* —
> white fails on every one of these hues. Re-check contrast before adding a
> shade.

## Typography

| Role | Family | Where |
|---|---|---|
| Display | **Fredoka** 500–700 | h1/h2/h3, numerals, buttons, nav, logo fallback |
| Body | **Assistant** 400–700 | paragraphs, labels, form fields, captions |

Never set body copy in Fredoka. Never set a heading in Assistant.

The scale is defined once in `@theme` (`text-display`, `text-h1`, `text-h2`,
`text-h3`, `text-body-lg`, `text-label`) and has a deliberately filled-in
middle — the previous design had nothing between the h1 and 16px body, which
is what made it read as flat.

Hebrew needs air: body `line-height` never below 1.7 (set globally on `p`).

Both faces are self-hosted by `next/font/google` with the `hebrew` subset —
no runtime request to Google, no layout shift.

## Layout & RTL

Mobile-first; most visitors arrive from an Instagram bio link on a phone.
24px side margins, centred `max-width: 1200px`, 80px section gaps on mobile
and 112px from `sm` up.

`<html lang="he" dir="rtl">`. Throughout the codebase use only logical
properties — `ps-`/`pe-`/`ms-`/`me-`/`text-start`/`text-end`/`start-`/`end-`.
Never `pl-`/`pr-`/`left-`/`right-`.

**One deliberate exception:** `WhatsAppFab` is pinned with the physical
`left-4`, because the requirement is the physical bottom-left corner.

## Rhythm

The failure mode of the previous design was seven sections that opened
identically. Structure now varies deliberately:

```
hero            paper
marquee         brand-deep band, full bleed   ← signature
categories      paper, six vivid tiles
gallery         white
process         brand-tint band, full bleed
about           white, asymmetric
testimonials    paper, cards in mixed tints
contact         brand-deep band, full bleed   ← strong close
```

## Depth

Shadows carry the hue of the thing casting them, like ink bleeding into paper
— `shadow-ink`, `shadow-ink-lg`, `shadow-brand`. Never a neutral grey drop
shadow, never pure black.

## Components

**Section heading** — eyebrow → Fredoka headline with one `accent` word in
colour. The old gold rule underneath is gone; the emphasis lives in the type.

**Media tile** — `shape="card"` (1.5rem) for gallery tiles, `shape="arch"` for
the hero and portrait. With no `src` it renders a category-tinted placeholder
of identical dimensions, so adding a real photo never shifts the layout.

**Filter chips** — a single horizontally scrolling row. Active chip is filled
with its category colour. They are toggle buttons with `aria-pressed`, **not**
an ARIA tablist: the tabs pattern requires arrow-key navigation and a roving
tabindex, and marking them as tabs without that is worse than not doing it.

**Lightbox** — `role="dialog"`, `aria-modal`, focus trap, Escape to close,
focus returned to the tile that opened it. Arrow keys are mirrored for RTL:
ArrowLeft advances.

**Marquee** — the signature. A duplicated track translated -50% loops
seamlessly. `aria-hidden`, with the same list exposed once as `sr-only` text,
and it stops under `prefers-reduced-motion`.

## Motion

All scroll reveals go through `components/ui/Reveal.tsx`. Keeping it in one
leaf component means Framer Motion never enters the section components.
`useReducedMotion` short-circuits every animation, `globals.css` has a global
`prefers-reduced-motion` block as a second line of defence, and a `<noscript>`
rule forces revealed blocks visible when JavaScript never runs.

## Social share images

`app/opengraph-image.tsx` and the per-category variant render through Satori,
which **does not implement the Unicode bidi algorithm** — Hebrew comes out
letter-reversed. Every Hebrew string is passed through `rtl()` in
[`lib/og.tsx`](../lib/og.tsx), which pre-reverses it. Latin text and the phone
number must be left alone.

Satori also needs a **static-weight** Hebrew font; a variable font crashes it.
`brand/Assistant-Bold.ttf` exists solely for this.

## Do / Don't

**Do** put ink text on vivid category fills.
**Do** keep the arch for hero and portrait only.
**Do** verify contrast before adding any colour.

**Don't** use white text on a `vivid` category colour — it fails every time.
**Don't** use the light brand turquoise as a text colour; that is `brand-deep`.
**Don't** reintroduce cream + serif + gold.
