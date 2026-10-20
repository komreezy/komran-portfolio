-- Seed the game 1–5 baseline only when the initial migration's empty row is
-- still untouched. A saved edit changes the revision or the season document
-- and therefore prevents this migration from replacing it.
update public.tortalona_document
set revision = 1,
    seasons = '[{"id":"current","name":"Current season","baselineGame":5,"totalGames":9,"players":[{"id":"ben","name":"Ben","baselineGoals":7},{"id":"saba","name":"Saba","baselineGoals":4},{"id":"komran","name":"Komran","baselineGoals":2},{"id":"manny","name":"Manny","baselineGoals":2},{"id":"roger","name":"Roger","baselineGoals":1},{"id":"zach","name":"Zach","baselineGoals":1},{"id":"ozzy","name":"Ozzy","baselineGoals":1},{"id":"lucas","name":"Lucas","baselineGoals":1}],"games":[]}]'::jsonb,
    updated_at = now()
where id = 1
  and revision = 0
  and seasons = '[{"id":"current","name":"Current season","baselineGame":5,"totalGames":9,"players":[],"games":[]}]'::jsonb;
