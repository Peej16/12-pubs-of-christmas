# 12 Pubs of Christmas — project brief

A phone-first website for a friend group's annual **12 Pubs of Christmas** crawl in Dublin.

## About the builder
The owner is **learning to code** with this project. So:
- Use plain **HTML, CSS and JavaScript** (no frameworks, no build step, no Node.js; Node isn't installed).
- Build in small steps; explain what each new file/section does and why.
- Prefer readable code with short comments over clever code.
- Preview with the VS Code **Live Server** extension.
- Git isn't installed yet. It's only needed later for hosting (e.g. GitHub Pages).

## The route (2025 list — may change for 2026)
1. Kennedys
2. Lincoln's Inn
3. Tapped
4. Kehoes
5. Nearys
6. Sheehan's
7. The Hairy Lemon
8. Drury Buildings
9. Grogans
10. The Old Stand
11. Bankers
12. Stag's Head

## Rules the group already uses
- **Physical:** can't put your pint down (last person to the pub downs their drink), can't use hands, T-Rex arms, penguin walk, straw pub, tiny man on the pint, reverse pints, chalice pub, toilet pint, swap shoes with partner at the bottom of Grafton St (last there takes a shot)
- **Speech:** no names/nicknames, no swearing, no pointing, accent pub, can't talk to bar staff when ordering, have-to-say-yes pub, no eye contact
- **Partner:** partner buys your pint and feeds it to you, can only drink when your partner drinks (first pair finished gets a free drink off the losing pair at the next pub)
- **Drink type:** wine pub, cocktails only, buy a drink starting with your first initial
- **Other:** pub golf, props, no phones, no rules, selfie with a stranger
- **Penalty:** shot, or buy a pint for the person who caught you

## New rule ideas (from brainstorm)
- **The Grinch:** app secretly picks a saboteur who tries to get others penalised; group votes at the last pub
- **Secret missions:** private dare on each phone (e.g. get someone to say "reindeer"), revealed at the end
- **Banned word pub:** app reveals a forbidden word
- Carol pub, questions-only pub, stranger's-choice drink, €5 Secret Santa pub, rule maker (RPS winner adds a rule), Christmas jumper mandatory
- **Bingo card:** "barman says Happy Christmas", "spot a Santa", "someone loses a shoe"…

## Feature ideas (roughly in build order)
1. Route list of the 12 pubs with progress / "next pub" button
2. Rule reveal at each pub (spin wheel or card flip; random or pre-set)
3. 30-minute timer per pub
4. Snitch button → penalty log → hall-of-shame leaderboard
5. Partner randomiser
6. Pub golf scorecard
7. Grinch / secret missions / bingo
8. Photo wall, end-of-night awards, hall of fame (2025, 2026…)
9. Look-after-each-other: water reminder every 4 pubs, guilt-free "tap out" button

## Shared server (decided: live sync)
- `sync.js` connects to **Firebase Realtime Database** (loaded from gstatic, no install). Settings live in `firebase-config.js`; while `firebaseConfig` is `null` the app runs on one phone only, like before.
- Shared: current pub, rule revealed, timer start, punishment log (`crawls/<ROOM>/progress` and `crawls/<ROOM>/log`). Per phone: active tab, sound, map view.
- `app.js` ↔ `sync.js` talk via `window.sync` (send changes) and `window.app` (apply incoming changes).
- Firebase project `12-pubs` (id `pubs-de756`), database in europe-west1. Rules (no expiry): read/write allowed only under `crawls/$room`, everything else denied.

## Hosting
- Live at **https://peej16.github.io/12-pubs-of-christmas/** (GitHub Pages, public repo `Peej16/12-pubs-of-christmas`, branch `main`, root folder).
- Git isn't installed, so files were uploaded through GitHub's website ("Add file → Upload files"). After editing locally, re-upload the changed files the same way; the site updates in about a minute.
- `CLAUDE.md` and `photos/` are not uploaded. Photos added later go to `photos/` in the repo (public).

