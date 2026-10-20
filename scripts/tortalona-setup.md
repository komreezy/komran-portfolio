# Tortalona leaderboard setup

The public leaderboard reads the single `tortalona_document` row through the Supabase anon key. Apply `supabase/migrations/20261020000000_tortalona.sql` to create the row with the game 5 baseline and games 6–9 season range.

The table and public-read policy were applied to the existing Personal Site Supabase project on October 20, 2026 through the Management API. The follow-up migration `20261020000001_tortalona_initial_totals.sql` imported the supplied totals through game 5: Ben 7, Saba 4, Komran 2, Manny 2, Roger 1, Zach 1, Ozzy 1, Lucas 1 (19 team goals). The season is named “Current season” until an explicit season name is supplied. No individual records were fabricated for games 1–5. The seed only updates the untouched empty initial document; it cannot replace later edits. Do not blindly reapply the table migration because its policy already exists.

Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_PASSWORD` in the server environment. The service role key and admin password must remain server-side; never prefix them with `NEXT_PUBLIC_`.

The local private write key is configured in gitignored `.env.local`. Public reads, authenticated admin reads and saves, unauthenticated save rejection, and persisted readback were verified through the local API after import. The actual database-backed page is `/lab/tortalona`; `/lab/tortalona/preview` remains a sample-data design preview. Production must use the same Supabase project and server-side settings.

`GET /api/tortalona` returns the public `{ revision, seasons }` document. `GET /api/tortalona?admin=1` returns the same document only when sent a valid `x-admin-token`. `PUT /api/tortalona` requires that header and accepts the full document, including the revision loaded by the editor. A successful save increments and returns the revision; a stale revision receives HTTP 409 and should reload before retrying.

The endpoint checks names and IDs for uniqueness, bounds game and goal values, and rejects goal records for unknown players or weeks outside games 6–9. Public reads are backed by a SELECT-only RLS policy. All writes run on the server with the service role key and compare the requested revision atomically.

Run `node scripts/test-tortalona.cjs` to check the document validator.

The public Goalscorers selector includes All time, which sums each player's goals across saved seasons using their stable ID. Keep those IDs when importing older records for existing players; identical names alone do not merge players. The next-season editor already retains IDs. Team history is an empty tab reserved for future club records; weekly goal entries remain stored and feed the scoring totals and season match ledger. Run `node scripts/test-tortalona-standings.cjs` to check season and all-time aggregation.
