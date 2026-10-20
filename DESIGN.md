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
  tortalona-paper: "#f7f0df"
  tortalona-ink: "#15375b"
  tortalona-accent: "#315d91"
  tortalona-gold: "#ae833e"
  tortalona-muted: "#566374"
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
  tortalona-display:
    fontFamily: "TortalonaSerif, Instrument Serif, Georgia, serif"
    fontSize: "clamp(42px, 8.1vw, 124px)"
    fontWeight: 400
    lineHeight: 0.85
  tortalona-sport:
    fontFamily: "TortalonaSport, Barlow Condensed, sans-serif"
    fontSize: "40px"
    fontWeight: 700
  tortalona-interface:
    fontFamily: "TortalonaSans, Manrope, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
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

The implemented `/lab/tortalona` experience presents the club record as an engraved vintage certificate, scoped to this route so the portfolio shell remains as designed. Its palette is light ivory paper (`#f7f0df`), deep royal-blue ink (`#15375b`), blue accent (`#315d91`), antique gold (`#ae833e`), and muted blue-gray (`#566374`). A 700px repeating ivory-paper texture sits under the content. The certificate frame uses `certificate-frame.webp` as a CSS nine-slice border (`125 round`), so the ornaments follow the document’s height as content grows. The transparent `curtains-v2.webp` remains a 3:2 illustration rendered with `contain`; it scales as a complete ornament across widths instead of stretching with page height. The supplied crest image is unchanged.

The desktop sheet is capped at 1600px, with responsive horizontal inset and top crown spacing. The centered masthead overlays the crest and uses Instrument Serif. Its title is uppercase, `clamp(42px, 8.1vw, 124px)` at larger widths and `clamp(34px, 10.7vw, 54px)` at 520px and below, with “FC” inheriting the same font size and style as “Tortalona.” The exact italic tagline is “Pasión, Pan, y Pelota.” Instrument Serif also sets navigation and section headings; Barlow Condensed Bold sets uppercase player names and goal totals. Manrope is the route’s base interface face and supports helper copy and controls. Font-family aliases for design detection are `TortalonaSport`, `TortalonaSerif`, and `TortalonaSans`.

The semantic scoring table has rank, player, and goals columns; Goalscorers and Season history switch in place, with a season selector. The overview shows team goals, recorded/remaining progress, connected game dots, and the match ledger. The nine-game strip fills all five baseline games and leaves games 6–9 open in the initial record. History shows the cumulative baseline and any recorded games, with the game addition beneath each cumulative value. Never infer weekly values within the baseline. The initial preview sample is Alex 8, Marco 6, Sam 5, Leo 3, and Chris 2, with baseline 5 only.

At 1100px and below, spacing and the summary sidebar narrow. At 760px and below, the overview stacks after the table. At 520px and below, the tab navigation occupies its own full row and the season selector occupies a full-width row beneath it; masthead and table typography shrink, and the footer stacks. The page keeps content inside the frame and reduces curtain depth for narrow screens.

The live route provides a Club admin action. The inline editor requests the site admin password, keeps edits as a draft, and supports player names, baseline or game goals, recording a game, and starting a new nine-game season while preserving previous seasons. Failed saves preserve the draft and surface an error; unsaved changes trigger a discard prompt. Reduced-motion preferences disable transitions.

The preview route `/lab/tortalona/preview` uses sample data, identifies it in the footer, links to the live club record from the top bar, and omits the admin action. The Supabase migration `supabase/migrations/20261020000000_tortalona.sql` must be applied before live reads and writes work; storage failures remain distinct from an empty record. Asset prompts and provenance are documented under `public/lab/tortalona/`.
