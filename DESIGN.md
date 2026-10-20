---
name: Komran Portfolio
description: A monochrome monospace playground with scoped immersive Lab experiments.
colors:
  portfolio-paper: "#F0F0F0"
  portfolio-ink: "#0C0C0C"
  portfolio-accent: "#FFB327"
  mountain-paper: "#f8f5ed"
  mountain-ink: "#282d2f"
  mountain-muted: "#6d6b63"
  mountain-line: "#d8d3c8"
  mountain-gold: "#a67a28"
  mountain-focus: "#a46b14"
  mountain-danger: "#a33427"
  mountain-live: "#f2dab0"
typography:
  portfolio-label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
    lineHeight: "16px"
    letterSpacing: "0.025em"
  mountain-display:
    fontFamily: "MountainDisplay, Arial Narrow, sans-serif"
    fontSize: "clamp(44px, 4.6vw, 76px)"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-1.5px"
  mountain-body:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
  mountain-panel-title:
    fontFamily: "MountainDisplay, sans-serif"
    fontSize: "31px"
    fontWeight: 600
    letterSpacing: "0.5px"
  mountain-note:
    fontFamily: "Georgia, serif"
    fontSize: "15px"
    lineHeight: 1.5
rounded:
  square: "0px"
  mountain-score: "3px"
  mountain-segment: "25px"
  mountain-switch: "30px"
  mountain-sheet: "18px 18px 0 0"
  avatar: "50%"
spacing:
  portfolio-page: "32px"
  portfolio-card: "24px"
  mountain-page: "30px"
  mountain-mobile: "18px"
  mountain-control-gap: "9px"
components:
  portfolio-navigation:
    backgroundColor: "{colors.portfolio-paper}"
    textColor: "{colors.portfolio-ink}"
    typography: "{typography.portfolio-label}"
    padding: "4px 8px"
  portfolio-navigation-hover:
    backgroundColor: "{colors.portfolio-ink}"
    textColor: "{colors.portfolio-paper}"
  portfolio-card:
    backgroundColor: "{colors.portfolio-ink}"
    textColor: "{colors.portfolio-paper}"
    rounded: "{rounded.square}"
  mountain-mode-active:
    backgroundColor: "{colors.mountain-ink}"
    textColor: "{colors.mountain-paper}"
    rounded: "{rounded.mountain-segment}"
  mountain-status-live:
    backgroundColor: "{colors.mountain-live}"
    textColor: "{colors.mountain-ink}"
    padding: "5px 9px"
  mountain-week:
    textColor: "{colors.mountain-ink}"
    padding: "9px 0"
  mountain-row:
    textColor: "{colors.mountain-ink}"
    padding: "6px 7px"
  mountain-sheet:
    backgroundColor: "{colors.mountain-paper}"
    rounded: "{rounded.mountain-sheet}"
    padding: "0 17px"
---

# Design System: Komran Portfolio

## Overview

**Creative North Star: "A playground with an expedition inside the Lab"**

The portfolio is a compact monospace playground: pale gray ground, near-black type, uppercase navigation, sharp rectangular project tiles, and a warm accent. Existing portfolio pages retain that identity and their shared header and marquee.

Weekly Meat Mountain is a scoped immersive Lab extension at `/lab/meat-mountain`. Its approved ivory engraved expedition scene, charcoal contours, restrained amber, and condensed display typography belong to this experience. Geist Mono labels and figures provide continuity with the portfolio. The extension uses its own Back to Lab navigation and native pointer behavior.

**Key Characteristics:**

- Compact monospace navigation and figures connect the portfolio and its experiments.
- Sharp, flat portfolio surfaces give way to an illustrated ivory mountain within this route.
- The mountain carries the scene; restrained controls and aligned data support it.

## Colors

The portfolio’s high-contrast monochrome foundation has a warm accent. The mountain uses a separate warm paper palette, with descriptive tokens in the frontmatter matching the implementation.

### Primary

- **Portfolio Ink** anchors the existing navigation and dark project cards.
- **Mountain Ink** anchors the expedition’s text and active view segment.

### Secondary

- **Portfolio Accent** is the existing warm status accent.
- **Mountain Gold** emphasizes expedition affordances; **Mountain Live** is the live-status wash.
- **Mountain Danger** emphasizes low-finish probability. Names, icons, and text accompany color meaning.

### Neutral

- **Portfolio Paper** remains the ordinary page ground.
- **Mountain Paper**, **Mountain Muted**, and **Mountain Line** provide the expedition’s warm canvas, supporting text, and thin dividers.
- **Mountain Focus** is the keyboard outline color, separate from subtle divider colors.

**The Scoped Expedition Rule.** Apply the warm map palette and display face inside Weekly Meat Mountain; preserve the portfolio’s incumbent visual identity elsewhere.

## Typography

Geist Mono is loaded by the root layout and retained across both worlds. Portfolio navigation and labels use compact uppercase text. The mountain uses tabular numerals, mostly 8–12px labels, and stronger projected totals for quick column comparison.

`MountainDisplay` is the local face at `/lab/meat-mountain/display.ttf`; asset provenance identifies Barlow Condensed Bold. The CSS requests 650 for the title and 600 for panel headings; this is a bundled static font asset, not a promise of multiple font weights. Georgia supplies occasional expedition notes and chart headings, not the data table.

The desktop title follows the frontmatter clamp, becomes 45px on intermediate widths, and uses `clamp(35px, 9.5vw, 57px)` on mobile. At widths of 1600px and above it is 82px. Timeline mode reduces its title to 40px, or 31px on mobile. Display labels are uppercase; body explanation paragraphs use sentence case and a maximum measure of 75ch.

## Layout

The ordinary Lab index uses 32px horizontal padding, an 896px maximum content width, and a one-column project grid that becomes two columns at 640px. Cards retain a 4:3 aspect ratio.

The immersive route is full width. A 57px top bar and compact toolbar sit above a flexible mountain scene and a 500px standings panel. From 761px through 1150px the panel is 420px; at 1600px and above it is 550px. The mountain title sits in the scene’s upper-left negative space, with the illustrated ascent running diagonally toward the summit. The image uses full scene dimensions and multiply blending.

At 760px and below, the toolbar stacks and the leaderboard becomes a fixed bottom sheet. Its rendered height stays 87dvh; transforms reveal a 105px peek plus safe-area allowance, a middle 57dvh view, or the full 87dvh view. A drag handle also works as a button that cycles the three states. The mobile app is a flex column with a 100dvh height and a 650px minimum. The workspace fills the remaining space with a zero minimum height and a bottom margin of 105px plus the safe-area inset; its scene fills that workspace with no minimum height. The top bar, toolbar, and error warning do not shrink, so delayed-data warnings consume layout space while replay controls remain above the sheet’s peek. The explanation panel is capped at 35dvh and scrolls internally. Sheet scrolling contains overscroll and reserves bottom safe-area padding.

**The Honest Altitude Rule.** Vertical position encodes projected points on the fixed 0–180 scale. Resolve crowding horizontally, and keep totals above the summit cap visible in standings.

## Elevation & Depth

Portfolio chrome is flat. The expedition gets depth from engraving and tonal separation, not elevated dashboard cards. Hiker avatars use a small `0 2px 5px #282d2f30` shadow and a paper outline; score tags use `0 2px 5px #282d2f12`. The mobile sheet uses `0 -5px 25px #342e2010` to separate it from the illustration. Thin borders organize the desktop standings and detail content.

Hikers transition in 1.2 seconds with `cubic-bezier(0.16, 1, 0.3, 1)`; the sheet transforms in 0.35 seconds with the same easing. Button color changes take 0.2 seconds. Live status pulses over two seconds. The route disables animations and transitions under reduced motion. Replay still presents recorded data; decorative transitions are optional.

## Shapes

Portfolio project tiles and navigation remain square. Mountain avatars are circular, score tags and endpoint row highlights are lightly rounded, and the two-option view switch is a capsule. Only the mobile sheet receives large rounded top corners. Fine strokes and compact icon outlines keep controls subordinate to the illustration.

## Components

- **Portfolio navigation and project cards:** compact uppercase links, inverted hover treatment, square 4:3 project surfaces, and a bottom-aligned overlay with tags. Their existing shared components remain authoritative for ordinary pages.
- **Expedition navigation:** Back to Lab, league identification, and an explanation control replace the normal portfolio header on this route.
- **Week selector and status:** a native borderless select sits beside a text status chip and update age. Stale or failed data exposes a retry action and preserves last-known content when available.
- **View switch:** two equally sized capsule segments use `aria-pressed`; the active segment is ink on paper inverted. Keyboard focus is a 2px outline with 4px offset. The same focus treatment covers route links, buttons, selects, and focusable chart content.
- **Hiker marker:** a Sleeper avatar or initials, roster-colored border, score tag, and optional name. Selection, hover, and focus raise stacking order and expose the name. Highest and lowest markers have distinct icons. The selected hiker uses its team color for the outline.
- **Standings row:** rank, team, actual, projected, high probability, and low probability share a stable grid. The top and bottom rows use faint amber and red washes. Clicking a row or hiker opens the associated player detail in the same panel or sheet.
- **Timeline and replay:** timeline traces distinguish actual and projected scores with solid and dashed lines. Replay controls play, pause, restart, and return to current data; replay has no scrubber. Historical availability is described honestly.
- **Mobile sheet:** a visible grab handle offers pointer dragging and keyboard activation. Its interior scrolls independently when expanded.

Implementation references: `src/app/globals.css`, `src/app/layout.tsx`, `src/components/Header.tsx`, `src/components/LabProjectCard.tsx`, and `src/app/lab/meat-mountain/{MeatMountain.tsx,mountain.css,page.tsx}`. The approved scene is `public/lab/meat-mountain/mountain.png`; provenance and font licensing live beside it. Product details remain in `PRODUCT.md` and `.impeccable/surfaces/meat-mountain.md`.

## Do's and Don'ts

### Do:

- Do retain the established portfolio palette and typography on ordinary portfolio pages.
- Do scope the ivory expedition palette, condensed title, and sheet to Weekly Meat Mountain.
- Do use the approved illustration and real Sleeper avatars, with initials when avatars fail.
- Do keep projected-point altitude faithful and distinguish actual points from estimates.
- Do retain visible keyboard focus, text status, and reduced-motion behavior.

### Don't:

- Don't turn the expedition art direction into a site-wide redesign.
- Don't move hikers vertically to resolve collisions; lateral lanes preserve score geometry.
- Don't add ghost hikers or place Arby’s signage outside the illustration.
- Don't fabricate historical motion or imply that simulation probabilities are guarantees.

## FC Tortalona: Club Record

FC Tortalona at `/lab/tortalona` is a complete, self-contained redesign of the club record. Keep the existing portfolio shell unchanged. Use pale blue-gray porcelain (`#edf2f2`) as the ground, deep ink blue (`#203d4e`) for primary text, sea glass (`#386e78`) for accents, copper (`#986244`) for secondary emphasis, muted blue-gray (`#586f7b`) for secondary text, and translucent ink-blue dividers (`#294e6326`). A transparent gray goal-net texture fills the fixed viewport background, centered so the page ground shows through. The supplied crest stays unchanged. Use Instrument Serif for the masthead and tagline, the existing Barlow Condensed Bold face (`/lab/meat-mountain/display.ttf`) for uppercase player names and numeric goal totals, and Manrope for navigation, labels, and controls. In “FC Tortalona,” FC uses the same font and size as Tortalona. Keep all Tortalona colors and typography scoped to this route.

The page fills the viewport. A 72px top bar places the Lab return, centered archive label, and club-admin action in one row. Center the masthead beneath it: unchanged crest, large “FC Tortalona” title, and the exact italic tagline “Pasión, Pan, y Pelota.” Set FC and Tortalona in Instrument Serif at the same size. Keep the layout open and restrained, with no separate matchday-programme framing. The record navigation directly joins the season selector and the Goalscorers / Season history tabs above the content. Below, use a flexible scoring table and a 238px season-summary sidebar separated by 50px. Avoid floating cards: fine translucent dividers, clear spacing, and typography structure the page. Use Barlow Condensed Bold for uppercase player names, goal numbers, and the season total; use Manrope for interface labels and Instrument Serif for the title and tagline. The leader row uses a light sea-glass wash with copper rank detail. The sidebar contains the season total, nine-game progress strip, and match ledger; filled dots and connecting lines show recorded games without visible game numbers. Repeat the tagline in the footer. At tablet widths narrow the sidebar and spacing; below 600px the page becomes one column, compresses the masthead and record navigation, and places the season summary after the table. The full-screen goal-net texture is centered behind the page content.

The leaderboard and history tabs switch the main content in place. The leaderboard ranks by total goals and breaks ties alphabetically; the leading row uses a light sea-glass wash (`#bbd3d04a`) without an extra label. History shows cumulative totals at the baseline and each recorded game, with that game’s addition beneath. The opening record treats goals through game 5 as a baseline, then tracks games 6–9 individually. Subsequent seasons use a zero-goal baseline and begin with game 1. The season selector changes the displayed record; the progress strip distinguishes recorded games from remaining games. Empty data and failed requests have distinct messages, and errors offer a retry.

Club admin expands an inline editor. The password is requested at the point of access; authorized edits remain a draft until Save changes. The editor can update names and goals, mark a game as played, and start a new nine-game season while preserving earlier seasons. Closing with unsaved edits asks before discarding. A save conflict or storage error should keep the draft available and explain the next action. Controls use a visible 2px sea-glass focus outline, rounded corners, and reduced-motion support. The dedicated `/lab/tortalona/preview` route uses sample names and goals, identifies itself as a design preview, links to the live route, and disables the admin entry point.

The Supabase migration `supabase/migrations/20261020000000_tortalona.sql` is pending application in the target database. The live page must show storage failure clearly until that migration and its server environment configuration are in place. Asset provenance is recorded in `public/lab/tortalona/provenance.md`; surface direction is recorded in `.impeccable/surfaces/tortalona.md`.
