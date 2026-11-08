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
| Commits | 13, latest `a9f7be2` |
| Tracked files | 134 |
| Content documents | 47 |
| Readings | 2,538 days, every day of 2022–2028 |
| Tests | 89 passing |
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

## 3. Decided, with the reasoning in [docs/DECISIONS.md](docs/DECISIONS.md)

- Scripture and prayers follow the **Douay-Rheims**.
- The mystery rule is the **hybrid** described above.
- **Local-first**: no accounts, no backend, no analytics. Novena progress is
  on the device.
- The navigation is the source of truth for routes; adding a prayer means one
  Markdown file and one line in `nav.ts`, never a new page file.

## 4. What is NOT done

- **Nothing is published.** No GitHub repository, no Railway project, no DNS.
  This is the next task, and it is the only task.
- The full Douay-Rheims **text** of each reading. The app shows the citation,
  the celebration and the colour; adding the text is the next content phase.
- The app's **pray-along mode** and **notifications** — the two things most
  likely to make people keep the app. See [docs/ROADMAP.md](docs/ROADMAP.md).

## 5. Known limits, so they are not rediscovered

- The website resolves "today" in the **server's** timezone, so a visitor
  ahead of the server can see the previous day's rosary overnight. The app is
  correct by construction. Left on the roadmap by decision.
- Two or three days a year have **no readings** in the app, because the
  USCCB lays them out in a shape the extractor does not yet read. All Souls is
  one of them, and that is correct — the lectionary appoints none for it. The
  build warns with the exact dates and fails if a year loses more than ten.

---

## 6. Next task: get it live

**Do this before any further additions or changes to the site.** The order
matters: the DNS records cannot be written until Railway gives you a target,
and you do not want to point a live domain at a service that has not been
built yet.

The full runbook is in **[docs/DEPLOY.md](docs/DEPLOY.md)**. The short version:

### Step 1 — GitHub

```bash
cd /c/dev2/gorosary
gh repo create misusi/gorosary --public --source=. --remote=origin --push \
  --description "GoRosary — the Rosary, novenas, and the prayers of the day."
```

> **Gotcha:** the sandbox blocks this unless the approval names the public
> destination. If it is refused, ask for that approval explicitly rather than
> working around it.

### Step 2 — Railway

```bash
railway login      # opens a browser — the user has to do this
railway init --name gorosary
railway up --detach
```

Or in the dashboard: **New Project → Deploy from GitHub Repo → `misusi/gorosary`**.
The build and start commands are already in `railway.json` at the repo root, so
the monorepo needs no dashboard configuration:

| | |
|---|---|
| Build | `npm run build:packages && npm run build --workspace @gorosary/web` |
| Start | `npm run start --workspace @gorosary/web -- --hostname 0.0.0.0` |
| Health check | `/` |

Then **Settings → Networking → Public Networking → Generate Domain** and open
the `*.up.railway.app` address. If it loads today's rosary, the build is good
and only DNS is left.

### Step 3 — The custom domain

**Settings → Networking → Custom Domains → Add Domain → `gorosary.app`.**
Railway then gives you **two** records, and both are required:

| Type | Name | Value |
|---|---|---|
| `CNAME` | `@` | the target Railway gives you, e.g. `g05ns7.up.railway.app` |
| `TXT` | `_railway` | the verification string Railway shows |

**In Porkbun** (Domain Management → Details → Edit → DNS Records):

1. **Delete the parking records first.** Porkbun adds default `A`/`AAAA`/`CNAME`
   records for the root and a `*` wildcard. An `ALIAS` record cannot coexist
   with them.
2. Add the **`ALIAS - CNAME flattening`** record: Host blank (blank means the
   root), Answer the Railway target, TTL 600. Porkbun supports CNAME
   flattening, which is what an apex domain needs — no move to Cloudflare.
3. Add the **`TXT`** record with the name and value Railway gave you.
4. Add `www` as a `CNAME` to the same target. If the Railway plan allows only
   one custom domain, use Porkbun's **URL Forwarding** for `www` instead —
   and delete the `*` wildcard CNAME, which collides with it.

> **Gotcha:** with only the `CNAME` and no `TXT`, the domain resolves but
> **returns 404**. The TXT record is how Railway confirms ownership.

### Step 4 — Confirm

Railway issues a Let's Encrypt certificate automatically, usually within an
hour of the DNS going live.

```bash
curl -I https://gorosary.app
```

Then open it and check the homepage shows today's rosary and today's readings.

---

## 7. Loose ends

- A dev server may still be running on **port 3000** from the last session.
  `npm run dev` now picks the next free port and says so, but stopping the
  old one is tidier: `taskkill /PID <pid> /F`.
- The `.claude/settings.json` allowlist written this session covers the npm
  read-only scripts. Interpreter and package-runner wildcards (`python *`,
  `npx tsx *`, `curl -s*`) were refused by the sandbox and are **not** in the
  file; add them by hand if the prompts are annoying.

---

## 8. Startup prompt

Paste this into a fresh session:

```
Working on GoRosary, at C:\dev2\gorosary — a Catholic prayer website
(gorosary.app) and an iOS/Android app that share one content package.

Read HANDOFF.md first, then STARTUP.md.

The site and app are built and verified: 89 tests pass, 47 content documents,
2,538 days of lectionary readings for 2022-2028, clean typecheck and build.
The code is committed on branch `main` with a clean working tree. Nothing is
published yet.

The only task right now is getting it live, in this order:

1. Create the public GitHub repository github.com/misusi/gorosary and push
   main to it. I need approval that explicitly names that public destination,
   because the sandbox refuses to create a public repo without it.
2. Railway: the user runs `railway login` (it opens a browser), then I create
   the project from the GitHub repo and deploy it. railway.json already has
   the build and start commands.
3. Add gorosary.app as a custom domain in Railway, then point Porkbun's DNS at
   it — the CNAME and the TXT record Railway gives you, with the parking
   records deleted first so the ALIAS record can go in.

Then verify https://gorosary.app shows today's rosary and readings.

No new features and no changes to the site until the deployment is done.
```
