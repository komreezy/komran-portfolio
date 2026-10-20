# FC Tortalona: Club Record

Mode: Editorial sports record

Approved direction: warm cream (`#f8f5ed`), confident club blue (`#2855a0`), deep ink (`#1e2524`), muted olive-gray (`#56604f`), warm dividers (`#d0d2c8`), and a restrained gold leader highlight (`#f2df9e`). The provided FC Tortalona crest is used unchanged. The condensed display face at `/lab/meat-mountain/display.ttf` gives the title, section headings, player names, ranks, and goals a bold uppercase matchday-programme feel; Geist Mono labels navigation and compact statistics. The tagline is exactly “Pasión, Pan, y Pelota.”

First viewport: a minimal 63px club-record top bar, then a masthead with crest, FC Tortalona title, “The goalscorers.” subhead, the tagline “Pasión, Pan, y Pelota,” and season selector with recorded-game count. The scoring table leads the page. Its blue display-type header and bold condensed uppercase player names recall an original matchday programme; the leading row has a pale gold wash, without a “Leading the way” label or contribution bars. A 250px season summary contains the team total, connected nine-game progress strip, and match ledger. Filled dots and connecting lines show game progress without visible game numbers. The tagline stays in the masthead and footer, keeping the sidebar focused on the season record. On mobile the table and summary stack in that order.

Signature interaction: switch between the ranked leaderboard and cumulative game history. The admin editor opens inline and requires the site admin password. It edits player names and baseline or game goals as a draft, then publishes on save; starting a new nine-game season retains prior seasons. Game 5 is the initial cumulative baseline and games 6–9 are recorded individually. A new season starts from zero and records its games individually. The progress strip fills recorded games and outlines the current recorded game; remaining games stay unfilled, with screen-reader text preserving each game's identity.

Preview: `/lab/tortalona/preview` is a separate non-indexed design preview with sample data. Clearly label the sample and link to `/lab/tortalona`; never present preview values as live club data.

Operations: public leaderboard reads are available from Supabase. Admin writes require server-side authorization and the service role key. Apply `supabase/migrations/20261020000000_tortalona.sql` before expecting live reads or writes; while unavailable, show the error state and keep it distinct from an empty season.
