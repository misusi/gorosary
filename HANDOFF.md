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
| Domain | `gorosary.app`, attached and `ACTIVE`, waiting on its TXT record |

The service is **Online** and serving the current build. The domain resolves
nowhere yet — the DNS has not been changed at Porkbun. That is the only thing
left before the site is on its own name.

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
  Railway service, but the Railway GitHub App is not installed on the repo, so
  there are no webhooks and a push changes nothing. Until that is fixed,
  deploy with `railway up --detach --service gorosary` after each change. See
  §8.
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

## 7. Next task: point the domain at Railway

**Everything else is done.** The site is built, deployed and running; the
custom domain is attached to the service. It needs the two DNS records at
Porkbun.

**In Porkbun** (Domain Management → Details → Edit → DNS Records):

1. **Delete the parking records first.** There is an `A` record for the root
   (currently `207.207.210.215`, and `207.207.210.43`) and a `CNAME` wildcard
   for `*` → `ss1-sixie.porkbun.com`. That wildcard is currently answering for
   `www` and `_railway-verify` as well, and an `ALIAS` record cannot coexist
   with any of them.
2. **Add the `ALIAS - CNAME flattening` record for the root**: host blank
   (blank means the root domain), answer `tfms4fav.up.railway.app`, TTL 600.
3. **Add the `TXT` record**: host `_railway-verify`, TTL 600, and the answer
   Railway gives. Read it off, rather than copying it from anywhere:

```bash
railway domain status 7f4d235b-2383-48d6-8472-a63660999ed3
```

> **The answer is the whole string `railway-verify=<hash>` — not the domain
> ID.** The ID in that command identifies the domain to Railway; pasting it
> as the TXT value leaves the domain unverified, and Railway then serves a
> placeholder certificate, so the browser warns and `curl` fails with
> `SEC_E_WRONG_PRINCIPAL`.

Both records are required. With only the CNAME the domain resolves but returns
**404**, because Railway checks the TXT to confirm the domain is yours.

Then:

```bash
curl -I https://gorosary.app
```

Railway issues the Let's Encrypt certificate once the TXT is seen; the domain
turns green in **Service → Settings → Networking → Custom Domains**.

> **One custom domain only.** The Trial plan counts `gorosary.app` and
> `www.gorosary.app` as two, and the first is spent. If `www` is wanted, use
> Porkbun's **URL Forwarding** for `www.gorosary.app` → `https://gorosary.app`
> — and delete the `*` wildcard CNAME first, because it collides with the
> forward.

---

## 8. Two things worth doing next

**Install the Railway GitHub App on the repository**, so that pushing to
`main` redeploys the site. Open
`github.com/misusi/gorosary` → Settings → Integrations and services → GitHub
Apps → install **Railway** on this repository only. Until that is done,
`railway service source connect --repo misusi/gorosary --service gorosary`
fails with "You do not have access to this resource", and every change needs
`railway up --detach --service gorosary` by hand.

**Migrate `railway.json` to `.railway/railway.ts`** before 1 December 2026 —
see [docs/DEPLOY.md](docs/DEPLOY.md) §7.

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

Two things are left:

1. The DNS at Porkbun, so gorosary.app points at Railway: delete the parking
   A record and the * wildcard CNAME, then add an ALIAS - CNAME flattening
   record for the root pointing at tfms4fav.up.railway.app, plus a TXT record
   for _railway-verify with the value Railway gave. Without the TXT the
   domain resolves but returns 404.
2. Installing the Railway GitHub App on the repository, so a push redeploys
   the site. Until then, deploy with `railway up --detach --service gorosary`.

Also worth doing before 1 December 2026: migrate railway.json to
.railway/railway.ts, which Railway has deprecated.
```
