# Weekly Meat Mountain operations

Page: `/lab/meat-mountain`. Public API: `/api/meat-mountain?week=2`.

Production collection was activated on September 20, 2026 in the existing Personal Site project (`swmgpssveimzzftghvxm`). The migration was applied through the Supabase Management API because the CLI temporary login role failed; do not blindly reapply the migration (its policies already exist). Vercel production has the private write key and collector secret, and Supabase Vault holds the matching collector token. The first real snapshot is September 20 at 22:45:56 UTC; earlier minute-level history is unavailable. The scheduled HTTP collector and public history reads were verified after deployment.

Apply `supabase/migrations/20260920000000_meat_mountain.sql` to the site's existing Supabase project. Add `SUPABASE_SERVICE_ROLE_KEY` and a random `MEAT_MOUNTAIN_CRON_SECRET` to Vercel production (never NEXT_PUBLIC). The existing URL and anon key are reused.

The migration installs a Supabase Cron job. Add the bearer secret to Supabase Vault as `meat_mountain_collector`. It checks every minute and invokes the collector only hourly outside games, or minutely from 15 minutes before a starter's kickoff until six hours after. It calls `https://www.komran.com/api/meat-mountain/collect` with `Authorization: Bearer <secret>`, via pg_net. Keep the credential in Supabase Vault. Only the service-role collector can write; anonymous viewers can only read the race and snapshots. Ordinary viewer requests cannot write or trigger collection.

Snapshots contain team aggregates when values change, or a five-minute heartbeat while unfinished. Completed unchanged weeks add no snapshots. The final payload keeps full player details and season points against at completion. Lead flips, last-place flips, large projection changes and players finishing are recorded as events. No raw upstream responses are stored in Supabase.

Projections and NFL clocks use undocumented public feeds and may change. Missing clocks use Sleeper's status and a disclosed midpoint estimate. Missing variance falls back to position priors; missing starter projections are disclosed. The current/prior regular-season samples are weighted for recency and shrunk toward position variance. Monte Carlo adds a modest common game component; probabilities are estimates, not empirically calibrated guarantees. Final full-precision ties use season PA (fewer wins high, more receives low); complete ties split probability. No historic minute-level replay is invented for weeks before collection began.

Checks: `node scripts/test-meat-model.cjs`, `npx tsc --noEmit`, and `npm run build`. Production cron verification: 200 response from authenticated collector, 401 without it, and increasing timestamps in `meat_mountain_snapshots`. Browser checks should include both 1440px and 390px, sheet swipe and keyboard/tap, week switching, team detail, timeline, replay pause/restart.
