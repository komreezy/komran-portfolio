# FC Tortalona: Club Record

Mode: Approved vintage certificate redesign; implemented and visually reviewed at desktop, phone, and the 831px panel width.

## Palette and assets

Keep this route-specific design scoped to Tortalona. Use ivory paper `#f7f0df`, royal-blue ink `#15375b`, blue accent `#315d91`, antique gold `#ae833e`, and muted blue-gray `#566374`. The CSS aliases are `--tt-ground`, `--tt-ink`, `--tt-accent`, `--tt-gold`, and `--tt-muted`. The ivory texture repeats at 700px. The engraved floral border is a nine-slice CSS border from `certificate-frame.webp` with `125 round`, so its corners and rails continue around longer documents. `curtains-over-frame-long.webp` is transparent 3:2 artwork positioned flush to the sheet’s top and side edges, above the frame and behind content. Its continuous top valance and shallow swags stay unchanged, while the narrow side drapes extend nearly to the bottom of the source canvas. The artwork scales proportionally with width. Keep the centered crest separate and unchanged. `curtains-over-frame.webp` is the previously saved shorter variant; `curtains-v2.webp` remains an earlier historical asset. Neither is used by the current page.

The generated assets use prompts saved beside them: `prompts/frame.txt`, `prompts/curtains.txt`, `prompts/curtains-refined.txt`, `prompts/curtains-over-frame.txt`, `prompts/curtains-over-frame-shorter.txt`, `prompts/curtains-over-frame-long.txt`, and `prompts/paper.txt`. `goal-net.webp` remains a historical asset and is not used by the current page.

## Type and layout

Use Instrument Serif (`TortalonaSerif`) for the masthead, nav, and section headings. The masthead is uppercase; “FC” inherits the same size and face as “Tortalona.” The tagline is exactly “Pasión, Pan, y Pelota.” Use Barlow Condensed Bold (`TortalonaSport`) for uppercase player names and numeric goals, and Manrope (`TortalonaSans`) as the route’s interface face for helper copy and controls.

The sheet is centered and capped at 1600px. Responsive inset and crown spacing reserve room for the title, unchanged crest, and top bar. At widths up to 1100px, narrow the summary and gaps; at 760px and below, stack the season overview after the table; at 520px and below, give the tab navigation a full row and the season selector a full-width row below it. The 700px tiled paper and scalable frame remain behind the content at every breakpoint; the curtain overlay sits above the frame and behind page content.

## Record behavior

Retain the semantic leaderboard table, season selector, Goalscorers / Season history tabs, inline admin editor, and match history. The connected nine-game strip fills five recorded games from the initial baseline and leaves four open; do not invent separate game totals for the baseline. The initial record has cumulative totals through game 5 and individual entries for games 6–9. New seasons start with zero baseline and preserve earlier seasons.

The `/lab/tortalona/preview` page uses the sample leaderboard Alex 8, Marco 6, Sam 5, Leo 3, and Chris 2, with baseline 5 only. Its footer labels sample data and its top bar links to the live record. The live route has the Club admin action. Admin edits remain a draft until saved; errors preserve the draft and unsaved changes prompt before discard.

Operations: public leaderboard reads are available from Supabase. Admin writes require server-side authorization and the service role key. Apply `supabase/migrations/20261020000000_tortalona.sql` before expecting live reads or writes; while unavailable, show the error state and keep it distinct from an empty season. Asset provenance is in `public/lab/tortalona/provenance.md`.
