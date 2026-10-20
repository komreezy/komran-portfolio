# Product
<!-- impeccable:product-schema 1 -->
## Platform
web
## Users
Komran's portfolio visitors; Weekly Meat Mountain serves the 12 members of United Degen League of America during NFL games on laptops and phones.
## Product Purpose
An immersive Lab experience following the week's highest and lowest fantasy scores. Highest scorer chooses the lowest scorer's punishment.
## Capabilities and Constraints
Sleeper league 1341855945424117760. Free data and hosting tiers. Live actual points, tempered final projections, simulated highest/lowest probabilities, minute refresh, Supabase aggregate history, 30-second replay without scrubbing. Mountain and timeline modes; mobile draggable standings sheet. Full-precision score tie-break, then fewer season points against wins highest and more season points against receives lowest. Use this and previous season for variance. Historical movement exists only from collection start; never invent prior observations.
## Brand Commitments
Weekly Meat Mountain. Approved light ivory engraved expedition mountain. Arby's signage only inside the illustration. Sleeper avatars, 180-point summit cap, no ghost hikers. Immersive page with Back to Lab.
## Product Principles
Make live standings understandable. Label estimates honestly. Preserve true score geometry. Keep the mountain central on every screen.

## FC Tortalona: Club Record
FC Tortalona is a separate Lab experience at `/lab/tortalona` for the club’s player goal totals across a nine-game season. Visitors can read the leaderboard and game-by-game history; editing player names, baseline goals, and recorded game goals is restricted to the site admin. The initial record carries cumulative totals through game 5, with individual game entries for games 6–9. A new season starts with a zero-goal baseline and retains earlier seasons for comparison.

The implemented vintage certificate uses light ivory paper (`#f7f0df`), deep royal-blue ink (`#15375b`), blue accent (`#315d91`), antique gold (`#ae833e`), and muted blue-gray (`#566374`). Its paper texture repeats at 700px; an engraved blue-and-gold floral frame uses a nine-slice border that follows document height, while transparent blue-and-ivory curtains remain a proportionally scaled 3:2 illustration and become slim on mobile. The supplied crest is unchanged. Instrument Serif sets the masthead, navigation, and section headings; the masthead is uppercase and “FC” matches “Tortalona” in size. Barlow Condensed Bold sets uppercase player names and goal totals. The Tortalona font aliases are `TortalonaSport`, `TortalonaSerif`, and `TortalonaSans`; Manrope supplies interface and helper text. The exact tagline is “Pasión, Pan, y Pelota.” The route has its own top bar and returns to Lab without changing the portfolio shell. `/lab/tortalona/preview` is a separate non-indexed design preview, with a footer disclosure and a top-bar link to the live club record. The preview sample is Alex 8, Marco 6, Sam 5, Leo 3, and Chris 2; it shows the game-5 baseline only and must not imply invented weekly entries. The live page exposes Club admin.

Leaderboard data is shared publicly; editor access requires the admin password and saved changes become public. The Supabase migration must be applied before the live record can load or save. Storage failures should remain visible as errors rather than appearing as an empty club record.
