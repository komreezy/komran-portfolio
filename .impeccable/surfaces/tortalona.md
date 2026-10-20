# FC Tortalona: Club Record

Mode: Approved vintage certificate redesign; implemented and visually reviewed at desktop, phone, and the 831px panel width.

## Palette and assets

Keep this route-specific design scoped to Tortalona. Use ivory paper `#f7f0df`, royal-blue ink `#15375b`, blue accent `#315d91`, antique gold `#ae833e`, and muted blue-gray `#566374`. The CSS aliases are `--tt-ground`, `--tt-ink`, `--tt-accent`, `--tt-gold`, and `--tt-muted`. The ivory texture repeats at 700px. The engraved floral border is a nine-slice CSS border from `certificate-frame.webp` with `125 round`, so its corners and rails continue around longer documents. The current curtain overlay uses `curtain-half-retina.webp`, transparent 1536×1024 artwork placed as two mirrored half-panels flush to the sheet’s top and side edges, above the frame and behind content. Together, the panels preserve the continuous top valance, shallow swags, and short side drapes while providing 3072 source pixels across the sheet for retina clarity. The overlay uses an 8:3 aspect ratio. Keep the centered crest separate and unchanged. `curtains-over-frame.webp`, `curtains-over-frame-long.webp`, and `curtains-v2.webp` are historical assets and are not used by the current page.

The generated assets use prompts saved beside them: `prompts/frame.txt`, `prompts/curtains.txt`, `prompts/curtains-refined.txt`, `prompts/curtains-over-frame.txt`, `prompts/curtains-over-frame-shorter.txt`, `prompts/curtains-over-frame-long.txt`, `prompts/curtain-half-retina.txt`, and `prompts/paper.txt`. `goal-net.webp` remains a historical asset and is not used by the current page.

The Lab project card uses `programme-cover.webp`, a separate 4:3 engraved football-programme cover in ivory, royal blue, and antique gold. It shows “FC TORTALONA,” the exact tagline “Pasión, Pan, y Pelota,” a golden leather ball, and an engraved goal and stadium; it does not use or redraw the supplied crest. Its prompt is `prompts/programme-cover.txt`, with generation metadata in `programme-cover.webp.json`.

## Type and layout

Use Instrument Serif (`TortalonaSerif`) for the masthead, nav, and section headings. The masthead is uppercase; “FC” inherits the same size and face as “Tortalona.” The tagline is exactly “Pasión, Pan, y Pelota.” Use Barlow Condensed Bold (`TortalonaSport`) for uppercase player names and numeric goals, and Manrope (`TortalonaSans`) as the route’s interface face for helper copy and controls.

The sheet is centered and capped at 1600px. Responsive inset and crown spacing reserve room for the title, unchanged crest, and top bar. At widths up to 1100px, narrow the summary and gaps; at 760px and below, stack the season overview after the table; at 520px and below, give the tab navigation a full row and the season selector a full-width row below it. The 700px tiled paper and scalable frame remain behind the content at every breakpoint; the mirrored curtain panels sit above the frame and behind page content.

## Record behavior

Retain the semantic leaderboard table, season selector, Goalscorers / Team history tabs, inline admin editor, and match ledger. Team history is an intentionally blank panel for future club records, with no season selector or scoring sidebar. Goalscorers offers each saved season and All time. All time sums baseline and individual game goals across all saved seasons by stable player ID, uses the most recent name, and shows a club overview with recorded season/game counts instead of nine-game progress. New seasons retain player IDs and start with zero baseline while preserving earlier seasons. Opening Club admin exits All time and edits a specific season.

The connected nine-game strip fills five recorded games from the initial baseline and leaves four open; do not invent separate game totals for the baseline. The initial record has cumulative totals through game 5 and individual entries for games 6–9.

The `/lab/tortalona/preview` page uses the sample leaderboard Alex 8, Marco 6, Sam 5, Leo 3, and Chris 2, with baseline 5 only. Its footer labels sample data and its top bar links to the live record. The live route has the Club admin action. Admin edits remain a draft until saved; errors preserve the draft and unsaved changes prompt before discard.

Operations: public leaderboard reads are available from Supabase. Admin writes require server-side authorization and the service role key. Apply `supabase/migrations/20261020000000_tortalona.sql` before expecting live reads or writes; while unavailable, show the error state and keep it distinct from an empty season. Asset provenance is in `public/lab/tortalona/provenance.md`.
