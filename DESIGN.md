---
name: My Data Toolbox
description: Night-bench work UI for generating, anonymizing, and querying JSON/XML in the browser.
colors:
  harbor-steel: "hsl(209 52% 68%)"
  harbor-steel-ink: "hsl(209 58% 32%)"
  inkwell: "hsl(212 24% 8%)"
  night-paper: "hsl(212 20% 10%)"
  sidebar-well: "hsl(212 26% 7%)"
  ink-text: "hsl(210 20% 94%)"
  muted-ink: "hsl(212 10% 64%)"
  bench-edge: "hsl(212 12% 18%)"
  day-paper: "hsl(212 32% 96%)"
  day-card: "hsl(212 40% 99%)"
  day-ink: "hsl(214 28% 12%)"
  day-muted: "hsl(211 10% 40%)"
  day-edge: "hsl(212 14% 84%)"
  danger: "hsl(0 55% 42%)"
typography:
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.06em"
  ui:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
components:
  button-primary:
    backgroundColor: "{colors.harbor-steel}"
    textColor: "{colors.inkwell}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "36px"
    typography: "{typography.ui}"
  button-primary-hover:
    backgroundColor: "hsl(209 52% 62%)"
    textColor: "{colors.inkwell}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.md}"
    height: "32px"
  card:
    backgroundColor: "{colors.night-paper}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.inkwell}"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 8px"
  nav-item-active:
    backgroundColor: "hsl(212 18% 14%)"
    textColor: "{colors.ink-text}"
    rounded: "{rounded.md}"
    height: "32px"
    padding: "0 8px"
---

# Design System: My Data Toolbox

## Overview

**Creative North Star: "The Night Bench"**

My Data Toolbox looks like a workbench after hours: dark, quiet, tools within reach, no theater. The visitor came to paste a skeleton, run an action, and copy a result. Chrome exists so the editors can disappear into the task.

The system is dense and cool. Inter carries every UI role. Harbor Steel is the only accent and it is scarce. Surfaces stack as inkwell → sidebar well → night paper, with hairline edges instead of shadows. Light mode inverts the same steel-and-ink pair; it is not a second identity.

**Key Characteristics:**
- Dark-first (default theme); light is the same grammar inverted
- One accent, used on primary actions and selection only
- Flat tonal layering; no rest-state shadows
- Compact Operate density: 32–36px controls, 15px titles, 4px spacing base
- Editors (mono fields) occupy most of the viewport

## Colors

A desaturated blue-steel family. Neutrals are inky, not pure gray. Accent is rare.

### Primary
- **Harbor Steel** (`{colors.harbor-steel}`): primary buttons, focus ring, active emphasis in dark mode.
- **Harbor Steel Ink** (`{colors.harbor-steel-ink}`): the same hue, darker, for primary on light surfaces.

### Neutral
- **Inkwell** (`{colors.inkwell}`): app canvas in dark mode; primary-button text.
- **Night Paper** (`{colors.night-paper}`): cards and popovers, one step up from the canvas.
- **Sidebar Well** (`{colors.sidebar-well}`): navigation rail, slightly deeper than the canvas.
- **Ink Text** (`{colors.ink-text}`): primary copy in dark mode.
- **Muted Ink** (`{colors.muted-ink}`): secondary copy, idle nav, placeholders.
- **Bench Edge** (`{colors.bench-edge}`): borders, input strokes, scrollbar thumb.
- **Day Paper / Day Card / Day Ink / Day Muted / Day Edge**: light-mode inversions of the same roles.

### Named Rules
**The One Steel Rule.** Harbor Steel appears on primary actions, focus, and selection. It does not fill backgrounds, cards, or decorative bars. Rarity is the point.

**The Inkwell Rule.** Neutrals stay in the 209–214 hue band. Do not introduce warm grays or pure `#000` / `#fff` slabs except on destructive text.

## Typography

**Display Font:** none. Operate UI does not use a display face.
**Body Font:** Inter (self-hosted `public/fonts/inter-latin.woff2`), system sans fallback.
**Label/Mono Font:** Inter for labels; UI monospace stack for JSON/XML editors.

**Character:** One workhorse sans. Hierarchy comes from size, weight 400/500, and space — not from a second family.

### Hierarchy
- **Title** (500, 15px, tight leading): page title in the header, card titles.
- **Body** (400, 14px, 1.5): card descriptions, empty-state copy. Short lines; this is a tool, not an article.
- **UI** (400, 13px): nav items, compact controls.
- **Label** (500, 11px, 0.06em, uppercase): JSON / XML category labels in the rail.
- **Mono** (400, 14px): textareas and result `<pre>` blocks.

### Named Rules
**The No-Display Rule.** No hero type, no fluid clamp headings, no second family for “tech personality.” Inter plus mono for data.

## Layout

App shell is `h-dvh`, flex row: a 14rem (`w-56`) sidebar on `md+`, main column with a compact header and a filling workspace.

**The two-pane bench.** From `lg` (1024px), tool views are two equal columns (input | result) with 16px gap and 16–20px page padding. Below `lg`, panes stack and the workspace scrolls. Cards fill height only on `lg+`.

**Mobile.** Sidebar becomes a left sheet. Header is title + menu only; the long tool description hides until `md`. Touch targets stay 32px minimum.

**Rhythm.** 4px base. Tight inside a control group (4–8px); 16px between card sections; 16–20px around the workspace. Settings (locale, theme) pin to the sidebar footer.

**The Editor Leads Rule.** After the rail and a one-line title, remaining pixels belong to the editors. Do not reintroduce a marketing header, hero, or duplicated page chrome.

## Elevation & Depth

Tonal layering only at rest. Canvas (inkwell) → rail (sidebar well) → card (night paper). Hairline borders in Bench Edge separate layers. Overlays (dropdown, sheet) use the same card/popover fill, not a drop shadow vocabulary.

No rest-state `box-shadow` on cards or buttons.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Do not add ambient shadows, glows, or glass blur to the shell or cards.

## Shapes

Gently tooled, not pill-like. Base radius `--radius` is 10px (`lg`). Cards use 12px (`xl`). Controls use 8px (`md`). Category labels and tiny chips stay at 6–8px. No hard offsets, no squircle theater.

Borders are 1px Bench Edge. Never a 4px accent bar on nav, cards, or callouts.

Dashed 1px stroke is reserved for the compact file-drop row.

## Components

Refined and restrained. Same radius and type on every tool view.

### Buttons
- **Shape:** 8px radius (`md`), height 36px default / 32px `sm`.
- **Primary:** Harbor Steel fill, inkwell text, 8×14px padding. Hover at 90% opacity.
- **Outline:** 1px input border, transparent fill, accent wash on hover.
- **Ghost:** no border; muted ink; used in the rail footer and icon-only theme toggle.
- **Focus:** 2px Harbor Steel ring, 2px offset.
- **Disabled:** 50% opacity, no pointer.

### Cards / Containers
- **Corner Style:** 12px (`xl`)
- **Background:** Night Paper (dark) / Day Card (light)
- **Shadow Strategy:** none at rest (see Elevation)
- **Border:** 1px Bench Edge
- **Internal Padding:** 16px header and content; content `pt-0` under the header
- **Titles:** 15px medium, 16px icon

### Inputs / Fields
- **Style:** 8px radius, 1px stroke, inkwell/muted wash on textareas (`bg-muted/30`)
- **Height:** 40px for single-line; editors `min-height: 12rem` and flex to fill
- **Focus:** 2px Harbor Steel ring
- **Mono** inside JSON/XML fields
- **File drop:** one horizontal dashed row, 16px icon, not a large empty well

### Navigation
- **Rail:** 14rem, Sidebar Well, 1px trailing edge
- **Categories:** 11px uppercase muted labels, collapsible
- **Items:** 32px, 13px, 14px lucide icons; idle Muted Ink; active is Sidebar Accent fill + medium weight — no colored left bar
- **Footer:** compact EN/FR/KO code + icon theme toggle
- **Mobile:** left sheet, same rail content, 200ms motion

## Do's and Don'ts

### Do:
- **Do** keep Harbor Steel scarce: primary button, focus ring, selection.
- **Do** let the two editors fill the remaining viewport on desktop.
- **Do** stack panes and scroll the workspace on small screens (`h-full` only from `lg`).
- **Do** use Inter at 15 / 14 / 13 / 11px and a 4px spacing scale.
- **Do** separate layers with 1px Bench Edge and hue-matched neutrals.

### Don't:
- **Don't** add rest-state card shadows, backdrop-blur headers, or gradient text.
- **Don't** use a 4px (or thicker) accent border on nav, cards, or alerts.
- **Don't** introduce a display serif, geometric “tech” mono as UI type, or emoji as icons.
- **Don't** rebuild a marketing hero above the bench.
- **Don't** invent testimonials, customer logos, or usage metrics in the chrome.
