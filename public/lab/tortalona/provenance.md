# Tortalona asset provenance

- `crest.png`: supplied by the user and copied into this directory unchanged. Display it as provided; do not redraw, recolor, crop destructively, or generate a replacement.
- `goal-net.webp`: generated with OpenAI ImageGen as a transparent gray goal-net texture for the full-screen background. Converted from the generated source to WebP with `cwebp` at quality 84 and 1536×1024 pixels, retaining alpha transparency. It is centered across the viewport so the page ground shows through its transparent areas.
- `fonts/InstrumentSerif-Regular.ttf` and `fonts/InstrumentSerif-Italic.ttf`: Instrument Serif assets used for the masthead and italic tagline.
- `fonts/Manrope-Variable.ttf`: Manrope variable font used for interface text.
- Masthead type: Instrument Serif sets “FC Tortalona,” with “FC” and “Tortalona” at the same size. Barlow Condensed Bold from `/lab/meat-mountain/display.ttf` is used for uppercase player names, goal numbers, and the season total.
- `/lab/tortalona/preview` uses hard-coded sample players and goals only to show the layout. Those values are not club records and must remain visibly labeled as preview data.
- The live record is stored in Supabase. Migration `supabase/migrations/20261020000000_tortalona.sql` is pending application to the target database.
