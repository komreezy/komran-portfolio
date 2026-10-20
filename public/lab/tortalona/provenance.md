# Tortalona asset provenance

- `crest.png`: supplied by the user and copied into this directory unchanged. Display it as provided; do not redraw, recolor, crop destructively, or generate a replacement.
- `certificate-frame.webp`: generated with OpenAI ImageGen as a transparent engraved blue-and-antique-gold floral certificate border. The generation prompt is `prompts/frame.txt`. CSS uses it as a nine-slice border with slice value `125` and repeat mode `round`, allowing the frame to grow with document height.
- `curtains-v2.webp`: generated and refined with OpenAI ImageGen as a transparent, symmetric blue-and-ivory draped curtain illustration with antique-gold details. The initial and refinement prompts are `prompts/curtains.txt` and `prompts/curtains-refined.txt`. CSS displays the full asset with a 3:2 aspect ratio and `contain`, keeping the fabric proportional as viewport width changes.
- `ivory-paper.webp`: generated with OpenAI ImageGen as a seamless pale ivory paper texture. The prompt is `prompts/paper.txt`; CSS tiles it at a 700px background size.
- `goal-net.webp`: historical generated concept asset from the earlier direction. It is retained in the asset folder but is not used by the current Tortalona page.
- `fonts/InstrumentSerif-Regular.ttf` and `fonts/InstrumentSerif-Italic.ttf`: Instrument Serif files used for the masthead, navigation, headings, and italic tagline through the `TortalonaSerif` family alias.
- `fonts/Manrope-Variable.ttf`: Manrope variable font used through `TortalonaSans` for the route’s interface, helper copy, and controls.
- `/lab/meat-mountain/display.ttf`: Barlow Condensed Bold, loaded through the `TortalonaSport` alias for uppercase player names and numeric goal totals.

The supplied crest is unchanged. Preview values are sample data only: Alex 8, Marco 6, Sam 5, Leo 3, and Chris 2, with game 5 as the baseline and no invented weekly breakdown. The preview footer labels the data and its top bar links to the live club record.

The live record is stored in Supabase. Migration `supabase/migrations/20261020000000_tortalona.sql` must be applied to the target database before live reads and writes work.
