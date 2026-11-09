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

- **Pushes do not redeploy the site.** The repository is attached to the
  Railway service and the Railway GitHub App is installed on it, but no
  webhook has appeared on the repository yet, so a push still changes
  nothing. Until it does, deploy with `railway up --detach --service gorosary`
  after each change.
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

**Look at the liturgical colour.** The colour card on the home page and the
colour on the readings page disagree on roughly a third of the days, because
the engine computes the colour of the *weekday* and USCCB's calendar gives
the colour of the *celebration*. A saint's memorial on an ordinary weekday
takes the day in USCCB's reckoning and is white; the engine leaves the
weekday green. The measurements are in §8.

---

## 8. The liturgical colour, measured

Comparing `describeDay(...).colour` against the `colour` field USCCB
publishes for every day of 2022–2028:

| USCCB → engine | Days | What it is |
|---|---|---|
| white → green | 758 | saints' memorials and feasts on ordinary weekdays |
| red → green | 218 | martyrs' memorials on ordinary weekdays |
| white → violet | 73 | days in the Christmas season |
| red → white | 35 | |
| violet → red | 21 | |
| violet → rose | 7 | Laetare Sunday |
| white → red | 7 | |
| white → black | 7 | All Souls' Day |

The classes that agree — green → green (605), white → white (425), violet →
violet (352), red → red (21) — are the Sundays and the solemnities, where
both agree that the feast takes the day.

The disagreement is not random: it is the difference between two different
questions. USCCB gives the colour of the **celebration that is kept**; the
engine gives the colour of the **weekday**. Whether a saint's memorial takes
the weekday in Ordinary Time is a question of canon, and the engine currently
answers it one way and USCCB another.

The fix is not a one-liner, and it is a content decision as much as a code
one, so it is written down here rather than changed unilaterally.

---

## 9. Loose ends

- A dev server may still be running on **port 3000** from an earlier session,
  and one on **3211** from this one. `npm run dev` picks the next free port
  and says so, but stopping the old ones is tidier:
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

The site is built, deployed and running on Railway. 107 tests pass, 47 content
documents, 2,538 days of lectionary readings for 2022-2028, clean typecheck
and build. The code is on branch main and pushed to github.com/misusi/gorosary.
The site is live at https://gorosary.app with a valid certificate.

Two things are worth doing:

1. The liturgical colour on the home page and the colour on the readings page
   disagree on about a third of the days, because the engine gives the colour
   of the weekday and USCCB gives the colour of the celebration. HANDOFF.md
   §8 has the measurements. It is a content decision as much as a code one.
2. Migrating railway.json to .railway/railway.ts, which Railway has
   deprecated. The file keeps working until 1 December 2026.

Also: a push still does not redeploy the site. The Railway GitHub App is
installed on the repository but no webhook has appeared, so deploy with
`railway up --detach --service gorosary` until that changes.
```
