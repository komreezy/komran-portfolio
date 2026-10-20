# Tortalona leaderboard setup

The public leaderboard reads the single `tortalona_document` row through the Supabase anon key. Apply `supabase/migrations/20261020000000_tortalona.sql` to create the row with the game 5 baseline and games 6–9 season range.

Configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `ADMIN_PASSWORD` in the server environment. The service role key and admin password must remain server-side; never prefix them with `NEXT_PUBLIC_`.

`GET /api/tortalona` returns the public `{ revision, seasons }` document. `GET /api/tortalona?admin=1` returns the same document only when sent a valid `x-admin-token`. `PUT /api/tortalona` requires that header and accepts the full document, including the revision loaded by the editor. A successful save increments and returns the revision; a stale revision receives HTTP 409 and should reload before retrying.

The endpoint checks names and IDs for uniqueness, bounds game and goal values, and rejects goal records for unknown players or weeks outside games 6–9. Public reads are backed by a SELECT-only RLS policy. All writes run on the server with the service role key and compare the requested revision atomically.

Run `node scripts/test-tortalona.cjs` to check the document validator.
