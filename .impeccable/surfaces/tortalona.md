# FC Tortalona: Club Record

Mode: Editorial sports record

Approved direction: warm cream, confident club blue, deep ink, and a restrained gold leader highlight. The provided FC Tortalona crest is used unchanged. Barlow Condensed Bold is reused from the existing Meat Mountain display font; Geist Mono labels the navigation and compact statistics.

First viewport: a minimal club-record top bar, then a masthead with crest, FC Tortalona title, “The goalscorers.” subhead, and season selector/progress. The scoring table leads the page. A narrow season summary contains the team total, nine-game strip, club motto, and match ledger. On mobile the table and summary stack in that order.

Signature interaction: switch between the ranked leaderboard and cumulative game history. The admin editor opens inline and requires the site admin password. It edits player names and baseline or game goals as a draft, then publishes on save; starting a new nine-game season retains prior seasons. Game 5 is the initial cumulative baseline and games 6–9 are recorded individually. A new season starts from zero and records its games individually.

Preview: `/lab/tortalona/preview` is a separate non-indexed design preview with sample data. Clearly label the sample and link to `/lab/tortalona`; never present preview values as live club data.

Operations: public leaderboard reads are available from Supabase. Admin writes require server-side authorization and the service role key. Apply `supabase/migrations/20261020000000_tortalona.sql` before expecting live reads or writes; while unavailable, show the error state and keep it distinct from an empty season.
