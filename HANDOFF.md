# HANDOFF.md

**Where GoRosary stands, and what happens next.** Read this first, then
[STARTUP.md](STARTUP.md) for the map of the project.

Everything below was true at the end of the session on **8 November 2026**.

---

## 1. What this is

GoRosary is a Catholic prayer website (gorosary.app) and a separate iOS and
Android app, both showing the same content from one shared package. The
product goal is deliberately narrow: one stop, no introductions, just the
prayers.

## 2. State of play — built and verified

| | |
|---|---|
| Branch | `main`, working tree clean |
| Commits | 17, latest `7a79d7b` |
| Tracked files | 137 |
| Content documents | 47 |
| Readings | 2,538 days, every day of 2022–2028 |
| Tests | 107 passing |
| Typecheck | clean |
| Production build | succeeds, 48 pages |

**The website** (`apps/web`) — Next.js 16, App Router. The landing page shows
today's rosary, the five decades with their mysteries, and a "Today in the
Church's year" panel with the season, the week, the liturgical colour, what is
kept, and any fast or vigil. A sticky bar at the top of the prayer runner holds
the Back / Next / Skip controls so they never move. `/readings` shows the
readings of the day. Search, light and dark, responsive.

**The app** (`apps/mobile`) — Expo SDK 58, React Native 0.88, Expo Router.
The same content, with a novena tracker that saves to the device.

**The content pipeline** — prayer text is Markdown with YAML frontmatter,
validated against a Zod schema at build time, and compiled to one typed
module both apps import. A malformed prayer fails the build rather than
reaching someone praying.

**The calendar engine** — computes Easter from the computus, the seasons, the
liturgical year, and the three-year lectionary cycle. Today's mystery set
follows a hybrid rule: feasts override everything, then the Church's calendar
decides in Advent, Christmas, Lent, Holy Week and Easter, and the day of the
week decides in Ordinary Time. The answer that was *not* used is always shown
alongside with its reason.

**The readings** are extracted from the liturgical calendar PDFs the United
States Conference of Catholic Bishops publishes, not written by hand. See
[docs/CONTENT.md](docs/CONTENT.md) for how to refresh them.

## 3. Published — where it lives

| | |
|---|---|
| GitHub | `github.com/misusi/gorosary`, public, `main` |
| Railway | project `gorosary` on the workspace *misusi's Projects*, hobby plan, region `sfo` |
| Service | `gorosary`, environment `production` |
| Project ID | `bb837eaa-5cd6-484b-b860-d88c32a238e0` |
| Service ID | `a466e007-b557-4ca1-afb9-17bba336026c` |
| Domain | `gorosary.app`, attached, **verified**, with a valid Let's Encrypt certificate |

The service is **Online**, the domain is **verified**, and the site answers on
https://gorosary.app with a valid certificate. The launch is done.

## 4. Decided, with the reasoning in [docs/DECISIONS.md](docs/DECISIONS.md)

- Scripture and prayers follow the **Douay-Rheims**.
- The mystery rule is the **hybrid** described above.
- **Local-first**: no accounts, no backend, no analytics. Novena progress is
  on the device.
- The navigation is the source of truth for routes; adding a prayer means one
  Markdown file and one line in `nav.ts`, never a new page file.
- The weeks of Ordinary Time are numbered the way the **Roman Missal** numbers
  them, so the week on the page and the week the USCCB calendar names are the
  same week.

## 5. What is NOT done

- The **full Douay-Rheims text** of each reading. The app shows the citation,
  the celebration and the colour; adding the text is the next content phase.
- The app's **pray-along mode** and **notifications** — the two things most
  likely to make people keep the app. See [docs/ROADMAP.md](docs/ROADMAP.md).

## 6. Known limits, so they are not rediscovered

- **A push redeploys the site.** Verified: a push to `main` built commit
  `34c28cc` and deployed it. The one thing that was needed was installing
  the Railway GitHub App on the repository and *then* re-running
  `railway service source connect --repo misusi/gorosary --branch main
  --service gorosary` — the App alone does not wire up the trigger.
- **`railway.json` is deprecated.** Railway wants Infrastructure as Code
  (`.railway/railway.ts`) instead. The file keeps working until
  **1 December 2026**, and the CLI prints a warning on every command. The
  migration is written down in [docs/DEPLOY.md](docs/DEPLOY.md) §7.
- The website resolves "today" in the **server's** timezone, so a visitor
  ahead of the server can see the previous day's rosary overnight. The app is
  correct by construction. Left on the roadmap by decision.
- Two or three days a year have **no readings** in the app, because the
  USCCB lays them out in a shape the extractor does not yet read. All Souls is
  one of them, and that is correct — the lectionary appoints none for it. The
  build warns with the exact dates and fails if a year loses more than ten.

---

## 7. What is left

**Nothing that blocks the launch.** The site is on its own name and serving.

Two things are worth doing:

**Migrate `railway.json` to `.railway/railway.ts`** before 1 December 2026 —
see [docs/DEPLOY.md](docs/DEPLOY.md) §7.

**Fix the extractor's colour field.** The colour in the readings content is
the colour of an *optional* memorial on about six hundred days, rather than
the colour of the day — `"Weekday green/ [Saint Hilary…]"` is filed as white.
The engine is right about those days and the content is wrong. Fixing it
means re-running `packages/content/scripts/usccb-extract.py` over the USCCB
PDFs; see [docs/CONTENT.md](docs/CONTENT.md). See §8.

---

## 8. The liturgical colour, measured

The colour card on the home page now shows **both** colours when they differ:
the colour of the celebration kept today, and the colour of the weekday of the
season beneath it. The engine works out the weekday's colour; the celebration
brings its own.

Comparing the engine's primary colour against the `colour` field USCCB
publishes for every day of 2022–2028, the agreement went from **55% to 69%**.
The remaining disagreement is nearly all one thing, and it is in the content
rather than the engine:

| USCCB → engine | Days | What it is |
|---|---|---|
| white → green | 492 | the extractor took an optional memorial's colour |
| red → green | 105 | the same, for martyrs |
| white → violet | 55 | the same, in Advent and Christmas |
| red → white | 55 | the extractor took a saint's colour on a feast |
| green → white | 15 | an obligatory memorial the engine reads as optional |
| violet → red | 20 | Holy Week, where the extractor took the season's colour |
| white → red | 11 | |
| violet → white | 11 | |

The classes that agree — green → green (579), white → white (529), violet →
violet (343), red → red (66) — are the Sundays, the solemnities and the
ordinary weekdays.

The largest class is the extractor's: it reads the first colour word it finds
on the line, and on a day with an optional memorial that is the memorial's
colour, not the day's. `"Weekday green/ [Saint Hilary, Bishop and Doctor of
the Church]"` is filed as white; the day is green, and the engine says green.

---

## 9. Loose ends

- A dev server may still be running on **port 3000** from an earlier session,
  and several on **3213–3216** from this one. `npm run dev` picks the next free
  port and says so, but stopping the old ones is tidier:
  `taskkill /PID <pid> /F`.
- The `.claude/settings.json` allowlist written earlier covers the npm
  read-only scripts. Interpreter and package-runner wildcards (`python *`,
  `npx tsx *`, `curl -s*`) were refused by the sandbox and are **not** in the
  file; add them by hand if the prompts are annoying.

---

## 10. Startup prompt

Paste this into a fresh session:

```
Working on GoRosary, at C:\dev2\gorosary — a Catholic prayer website
(gorosary.app) and an iOS/Android app that share one content package.

Read HANDOFF.md first, then STARTUP.md.

The site is built, deployed and running on Railway. 114 tests pass, 47 content
documents, 2,538 days of lectionary readings for 2022-2028, clean typecheck
and build. The code is on branch main and pushed to github.com/misusi/gorosary.
The site is live at https://gorosary.app with a valid certificate.

Two things are worth doing:

1. Fixing the extractor's colour field in the readings content. On about six
   hundred days it holds the colour of an optional memorial rather than the
   colour of the day, so the readings page disagrees with the calendar panel.
   The engine is right; the content is wrong. HANDOFF.md §8 has the numbers.
2. Migrating railway.json to .railway/railway.ts, which Railway has
   deprecated. The file keeps working until 1 December 2026.

Also: a push redeploys the site. It needed the Railway GitHub App installed
on the repository and then `railway service source connect --repo
misusi/gorosary --branch main --service gorosary` re-run — the App alone does
not wire up the trigger.
```
