# Design Standards (Non-AI-Looking, Consistent, Responsive)

Goal: interfaces that feel designed by a person with a point of view, consistent like Google products, responsive on every screen.

## 1. The AI-template tells to AVOID

Most AI output looks the same because it defaults to the same choices. Never ship these:

- Purple/blue-to-pink gradient hero, gradient text on the headline, glowing blobs
- Pill badge above the headline ("New: AI-powered...")
- Centered headline + subtitle + two buttons (primary filled, secondary ghost) with nothing else
- Headline clichés: "Supercharge", "Unlock", "Revolutionize", "Seamless", "Effortless", "Elevate your..."
- Inter / Roboto / system font for everything, one weight, no hierarchy
- Three identical feature cards with emoji or generic icons, same radius, same shadow
- Everything `rounded-xl` with `shadow-lg` and glassmorphism
- Fake logo strip ("Trusted by...") with invented brands, lorem ipsum, fake testimonials with stock avatars
- Pure `#000` on `#fff`, or pure grey neutrals with a random saturated accent
- Footer: 4 columns of dead links + copyright and nothing else
- Same section rhythm repeated: hero -> logos -> 3 cards -> testimonial -> pricing -> CTA
- Decorative animation on everything (fade-up on every element)

## 2. Start every UI with a design brief (5 minutes)

Write this before any code:

1. **Audience**: who, what device, what mood?
2. **Personality**: pick 3 adjectives (e.g. "precise, calm, editorial" or "playful, bold, tactile"). Reject "modern, clean, minimal" - they mean nothing.
3. **One memorable idea**: a signature element (oversized type, a real product screenshot, a unique grid, a distinct motion, an illustration style).
4. **References**: collect 5 real references (see `links.md`) and note what you take from each.
5. **Content first**: real copy and real data, not lorem ipsum. Design around actual content length.

## 3. Design tokens (single source of truth)

Define once, use everywhere. Components never contain raw hex, px or font names.

```css
:root {
  /* color: tinted neutrals + ONE accent + semantic */
  --bg: oklch(98% 0.006 85);
  --surface: oklch(100% 0 0);
  --text: oklch(22% 0.02 260);
  --text-muted: oklch(48% 0.02 260);
  --border: oklch(90% 0.01 260);
  --accent: oklch(62% 0.19 38);      /* pick your own hue */
  --accent-contrast: oklch(99% 0 0);
  --success: oklch(65% 0.17 150);
  --warning: oklch(78% 0.15 80);
  --danger: oklch(58% 0.21 25);

  /* type scale (fluid) */
  --step--1: clamp(0.83rem, 0.8rem + 0.15vw, 0.9rem);
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
  --step-2: clamp(1.56rem, 1.4rem + 0.8vw, 2rem);
  --step-3: clamp(1.95rem, 1.6rem + 1.7vw, 3rem);
  --step-4: clamp(2.4rem, 1.8rem + 3vw, 4.5rem);

  /* spacing: 4/8pt scale */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px;

  /* shape + depth */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --shadow-1: 0 1px 2px oklch(20% 0.02 260 / 0.08);
  --shadow-2: 0 8px 24px oklch(20% 0.02 260 / 0.12);

  /* motion */
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dur-fast: 120ms; --dur: 220ms; --dur-slow: 420ms;
}
[data-theme="dark"] { /* redefine surface, text, border, shadows - do not just invert */ }
```

Rules:
- Dark mode is designed, not inverted (lower contrast surfaces, desaturated accent).
- Contrast: WCAG AA minimum (4.5:1 body text, 3:1 large text and UI).
- Name tokens by role (`--text-muted`), not value (`--grey-500`).

## 4. Color

- 60 / 30 / 10: neutrals / secondary surfaces / accent.
- One accent hue. Add a second only with purpose.
- Tint neutrals toward the brand hue (warm or cool) instead of pure grey.
- Generate and test palettes with tools in `links.md` (Realtime Colors, Coolors, Radix Colors, Contrast checker).
- Use accent for actions and key data only. If everything is colorful, nothing is.
- Never convey meaning with color alone (add icon or text).

## 5. Typography

- Max 2 families: one display/heading, one body (or one family with strong range).
- Use real hierarchy: size, weight, tracking, case. At least 5 distinct levels.
- Body 16-18px, line-height 1.5-1.7, measure 60-75 characters.
- Headlines: tighter line-height (1.05-1.2) and slight negative tracking at large sizes.
- Load fonts with `font-display: swap`, self-host (Fontsource), subset, preload the main one.
- Use `font-variant-numeric: tabular-nums` for tables and dashboards.

Pairings to start from (swap the usual Inter):

| Mood | Heading | Body |
|---|---|---|
| Editorial, premium | Instrument Serif / Fraunces | Geist / DM Sans |
| Technical, sharp | Space Grotesk / Geist | JetBrains Mono accents + Geist |
| Friendly, product | General Sans / Satoshi (Fontshare) | Manrope / DM Sans |
| Bold, brand-heavy | Clash Display / Cabinet Grotesk (Fontshare) | Satoshi |
| Calm, corporate | Plus Jakarta Sans / Sora | Source Sans 3 |

## 6. Layout and spacing

- 12-column grid, max content width 1200-1280px, wide margins on large screens.
- Spacing only from the scale. Generous vertical rhythm between sections (96-160px desktop).
- Break the grid on purpose: asymmetric hero, offset images, overlapping elements, full-bleed bands.
- Vary section layouts; no two adjacent sections should share the same structure.
- Align to a baseline; consistent gutters; consistent radius.

## 7. Hero section (what to do instead)

A strong hero answers in 5 seconds: what is it, who is it for, why trust it, what next.

- **Headline**: specific and concrete ("Admissions answers for every Nepali student, in minutes"), not generic hype. Max ~10 words.
- **Subhead**: one sentence of proof or mechanism.
- **Primary CTA**: one clear action with a specific verb ("Compare 40 colleges"). Secondary is a quiet text link.
- **Real visual**: actual product screenshot, live demo, real photo, or custom illustration. Not an abstract gradient.
- **Proof near the fold**: a real number, real user quote, real logo, or real metric.
- **Composition**: choose one: split asymmetric, oversized type with a small image, product-in-context mockup, interactive demo, editorial collage.
- Motion: one meaningful entrance or interaction, not everything fading up.
- Mobile: headline, CTA and visual all work at 360px width.

## 8. Footer (what to do instead)

- Purposeful structure: brand statement, 3 meaningful link groups, contact, social, legal.
- A real closing CTA or newsletter with a clear promise.
- Large wordmark or oversized brand type as a design moment.
- Show location, support hours, status link, version, language/theme switcher where relevant.
- Same tokens as the rest of the site; not a different gray block.
- Accessible: real `<footer>`, link groups with headings, 44px tap targets.

## 9. Components and consistency

- Build a small design system first: Button, Input, Select, Checkbox, Card, Modal, Toast, Tabs, Table, Badge, Avatar, Skeleton, EmptyState.
- Every component has all states: default, hover, focus-visible, active, disabled, loading, error, empty.
- One button hierarchy: primary, secondary, ghost, destructive. One primary per view.
- Icons from a single family (Lucide, Phosphor, Tabler), same stroke width.
- Use shadcn/ui + Radix primitives as the base, then restyle with your tokens so it does not look default.
- Document components (Storybook or a `/design-system` page).

## 10. Responsive rules (Google-like consistency)

- Mobile-first. Test at 360, 390, 768, 1024, 1280, 1536.
- Breakpoints: 640 / 768 / 1024 / 1280 / 1536.
- Fluid type and spacing with `clamp()`. Use CSS grid, flex, container queries.
- Touch targets at least 44x44px. No hover-only interactions.
- No horizontal scroll. Images with `aspect-ratio` and `sizes`.
- Navigation collapses to a drawer or bottom bar; tables become cards or scroll with sticky first column.
- Respect `prefers-reduced-motion`, `prefers-color-scheme`, safe-area insets.
- Use Material 3 and Apple HIG for patterns, not for look.

## 11. Motion

- Purpose: orient, give feedback, express brand. Never decoration.
- 120-240ms for UI feedback, 300-600ms for page-level moments.
- Animate `transform` and `opacity` only. Use Framer Motion / Motion One / GSAP / CSS scroll-driven animations.
- Stagger sparingly; one signature moment per page.
- Always provide reduced-motion fallback.

## 12. Dashboards

- Start with the question each dashboard answers; top row = KPIs, then trend, then breakdown, then detail table.
- Max 4-6 KPI tiles; each with value, delta, sparkline and time range.
- Charts: pick by purpose (line = trend, bar = compare, stacked = composition, table = exact values). Direct labels over legends. Avoid 3D and pie charts with more than 4 slices.
- Consistent chart colors tied to tokens; colorblind-safe palette.
- Dense but scannable: tabular numerals, right-aligned numbers, sticky headers, filters at top, URL-synced filters.
- States: loading skeletons, empty, error, no-permission, stale data.
- Features users expect: date range, search, sort, export, saved views, keyboard shortcuts, dark mode.
- Layout: left sidebar + top bar, collapsible; content max-width fluid; cards on a grid with consistent gaps.
- Libraries: Recharts, Visx, Apache ECharts, TanStack Table, Tremor.

## 13. Landing page structure (adapt, do not copy)

1. Hero with real visual and proof
2. Problem / insight (specific, not generic)
3. How it works (3 steps, diagram or interactive)
4. Product depth (feature showcase with real screens, varied layouts)
5. Proof (metrics, case study, real quotes)
6. Pricing or offer (clear, honest)
7. FAQ (real objections)
8. Closing CTA + designed footer

Rework order and layout per brand; the personality from the brief should show in every section.

## 14. Accessibility (non-negotiable)

- Semantic HTML first, ARIA only when needed. Landmarks, headings in order.
- Visible `:focus-visible` rings. Full keyboard navigation. Skip link.
- Alt text, labels for every input, error messages tied to fields (`aria-describedby`).
- Test with axe, Lighthouse, and a screen reader pass.

## 15. Design QA checklist

- [ ] Tokens only, no raw values in components
- [ ] None of the AI-template tells in section 1
- [ ] Real copy and real imagery
- [ ] All component states exist
- [ ] Checked at 360px, 768px, 1280px and 1536px
- [ ] Light and dark verified
- [ ] Contrast AA, keyboard path works
- [ ] Squint test: hierarchy still clear when blurred
- [ ] Lighthouse accessibility and best-practices 95+
