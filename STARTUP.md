# STARTUP.md

**The index of GoRosary.** If you are new to this repository, read this file
first. It points at every other file that matters and explains what each one is
for.

> **Picking up an existing session?** Read **[HANDOFF.md](HANDOFF.md)** first —
> it says where the project stands, what is known to be unfinished, and the
> exact next steps. It also has a copy-pasteable startup prompt.

GoRosary is a Catholic prayer app: a website at **gorosary.app** and a separate
iOS/Android app, both showing the same content. The Rosary, the novenas, and
the prayers of the day — one stop, no introductions.

---

## 1. Read in this order

| # | File | What it is for |
|---|------|----------------|
| 0 | [`HANDOFF.md`](HANDOFF.md) | Where the project stands right now, and the next steps. |
| 1 | `STARTUP.md` | This file. The map of the project. |
| 2 | [`docs/DECISIONS.md`](docs/DECISIONS.md) | Every decision made so far and the reasoning behind it. Read before changing architecture. |
| 3 | [`docs/CONTENT.md`](docs/CONTENT.md) | **How to write and edit prayer content.** Read this before touching `packages/content/content/`. |
| 4 | [`docs/ROADMAP.md`](docs/ROADMAP.md) | What is built, what is next, what is deliberately deferred. |
| 5 | [`docs/DEPLOY.md`](docs/DEPLOY.md) | How the site goes live: GitHub → Railway → Porkbun → gorosary.app. |
| 6 | [`packages/content/src/schema.ts`](packages/content/src/schema.ts) | The contract every content file must satisfy. |
| 7 | [`packages/content/src/nav.ts`](packages/content/src/nav.ts) | The navigation tree. The website's routes are generated from it. |

For AI assistants working in this repo, also read
[`CLAUDE.md`](CLAUDE.md).

---

## 2. Repository map

```
gorosary/
├─ STARTUP.md               ← you are here
├─ README.md                ← short orientation for anyone who opens the repo
├─ CLAUDE.md                ← working rules for AI assistants in this repo
├─ package.json             ← npm workspaces root; all scripts live here
├─ tsconfig.base.json       ← TypeScript settings every package inherits
│
├─ apps/
│  ├─ web/                  ← gorosary.app. Next.js 16, App Router, SSR + SSG.
│  │  ├─ app/
│  │  │  ├─ page.tsx        ← THE LANDING PAGE: today's rosary
│  │  │  ├─ [...path]/      ← every other route, resolved from the nav
│  │  │  ├─ search/         ← full-text search over all content
│  │  │  ├─ layout.tsx      ← shell, metadata, theme bootstrap
│  │  │  └─ globals.css     ← the entire design system
│  │  ├─ components/        ← SiteHeader, Blocks, StepRunner, NovenaTracker…
│  │  └─ lib/               ← route resolution + the fixed Rosary prayers
│  │
│  └─ mobile/               ← the app. Expo (React Native), Expo Router.
│     ├─ app/
│     │  ├─ index.tsx       ← today's rosary
│     │  ├─ section/[id]/   ← one section and its prayers
│     │  ├─ prayer/[id]/    ← one prayer, novena, litany, or set of mysteries
│     │  └─ search.tsx      ← search
│     └─ components/        ← native equivalents of the web components
│
├─ packages/
│  ├─ content/              ← THE SINGLE SOURCE OF TRUTH FOR ALL PRAYER TEXT
│  │  ├─ content/           ← the actual prayers, as Markdown + YAML
│  │  │  ├─ rosary/         ← overview, the four mystery sets, how to pray
│  │  │  ├─ novenas/        ← twelve novenas and how to make one
│  │  │  ├─ daily/          ← morning, evening, Angelus, Our Father, Hail Mary…
│  │  │  ├─ mercy/          ← Chaplet of Divine Mercy, the Prayer of the Day
│  │  │  ├─ litanies/       ← Litany of Loreto, Litany of the Saints, Stations
│  │  │  └─ calendar/       ← feasts and fasts, the saints of the year
│  │  │  └─ readings/       ← the Roman Lectionary, one document per cycle year
│  │  ├─ src/
│  │  │  ├─ schema.ts       ← Zod schema: the content contract
│  │  │  ├─ markdown.ts     ← tiny Markdown parser → shared AST
│  │  │  ├─ nav.ts          ← navigation tree (level 1 and 2)
│  │  │  ├─ today.ts        ← assembles "today" from content + calendar
│  │  │  ├─ readings.ts     ← the readings of the day
│  │  │  ├─ index.ts        ← the public API both apps import
│  │  │  └─ calendar/
│  │  │     ├─ dates.ts     ← UTC date helpers + localToday()
│  │  │     ├─ liturgical.ts← Easter computus, seasons, the liturgical year
│  │  │     ├─ lectionary.ts← the cycle year and the slot for any date
│  │  │     ├─ rules.ts     ← WHICH MYSTERIES ARE PRAYED TODAY
│  │  │     ├─ day.ts       ← the season, week, colour and fasts of a day
│  │  │     └─ feasts.ts    ← moveable feasts
│  │  ├─ scripts/
│  │  │  ├─ build-content.ts ← validates content, writes the compiled module
│  │  │  └─ plan-lectionary.ts ← prints the reading slots that need writing
│  │  └─ dist/              ← compiled output (generated, gitignored)
│  │
│  ├─ ui/                   ← design tokens + shared formatting, used by both apps
│  └─ tsconfig/             ← shared TypeScript presets (nextjs, expo, library)
│
├─ docs/                    ← decisions, content guide, roadmap, deployment
├─ scripts/                 ← startup scripts for PowerShell and shell
├─ railway.json             ← how Railway builds and starts the website
└─ .github/                 ← CI
```

---

## 3. The three commands that matter

```bash
npm install          # once, and after any dependency change
npm run dev          # builds the content, then starts the website on :3000
npm run dev:mobile   # starts the Expo app (scan the QR code with Expo Go)
```

The website binds to loopback only, so nothing is exposed to your network. To
test the layout on a real phone, start it on the local network instead:

```bash
WEB_HOSTNAME=0.0.0.0 npm run dev    # macOS / Linux
$env:WEB_HOSTNAME='0.0.0.0'; npm run dev   # PowerShell
```

If port 3000 is already taken — usually by a dev server left running from an
earlier session — the site starts on the next free port and says so, rather
than failing with a bare `EADDRINUSE`.

Everything else:

```bash
npm run build:content   # validate + compile the prayer content
npm run check:content   # validate only, read-only — the CI gate
npm run content:list    # print every document and the section it belongs to
npm run dev:all         # website and app together
npm run build           # production build of the website
npm run typecheck       # typecheck every workspace
npm run clean           # remove all build output
```

`scripts/startup.ps1` (Windows) and `scripts/startup.sh` (macOS/Linux) wrap
these for you:

```powershell
.\scripts\startup.ps1 -Target all
```

---

## 4. How the content pipeline works

This is the heart of the project, and it is deliberately boring: **content in,
validated, compiled, shipped to both apps.**

```
packages/content/content/**/*.md
        │
        │  gray-matter parses the YAML frontmatter
        │  markdown.ts converts the body into a small block AST
        ▼
  build-content.ts
        │
        │  1. every document is validated against schema.ts (Zod)
        │  2. ids must be unique and match their filename
        │  3. every document must be reachable from nav.ts
        │  4. every nav entry must point at a document that exists
        ▼
packages/content/src/generated/content.ts   ← one typed array, no I/O
        │
        ▼
  @gorosary/content  →  imported by apps/web AND apps/mobile
```

Consequences worth knowing:

- **Nothing parses Markdown at runtime.** The browser and the phone get the
  same compiled array.
- **A broken prayer fails the build, not the user.** A typo in frontmatter is
  a build error with the file name and the offending path.
- **Adding a prayer is one file.** Write the Markdown, add one line to
  `nav.ts`, run `npm run build:content`.
- **The navigation is the router.** The website generates its routes from
  `nav.ts`; the app navigates the same tree.

Full instructions, including a worked example of every document kind, are in
[`docs/CONTENT.md`](docs/CONTENT.md).

---

## 5. How "today" is decided

The landing page of both apps shows the mystery set for the current day. It is
computed, never hardcoded.

`packages/content/src/calendar/rules.ts` applies these rules in order:

1. **Fixed feasts** override everything — 15 September is the Sorrowful
   Mysteries (Our Lady of Sorrows), 7 October is the Joyful (Our Lady of the
   Rosary), and so on. The table is `FIXED_DATE_OVERRIDES`.
2. **Moveable feasts** — Corpus Christi, the Sacred Heart, Holy Saturday.
3. **The season** — Advent, Christmas, Lent, Holy Week and Easter are given to
   the Church's calendar, because those are the weeks where the season has real
   force.
4. **The day of the week** decides in Ordinary Time — the six months of
   ordinary weeks, which need the variety. Mon/Sat Joyful, Tue/Fri Sorrowful,
   Wed/Sun Glorious, Thu Luminous.

Whichever answer is *not* used is always shown underneath, with its reason, so
nobody is misled either way.

To change the rule, edit one line at the top of `rules.ts`:

```ts
export const PRIMARY_RULE: PrimaryRule = 'hybrid'; // or 'liturgical' or 'weekly'
```

- `hybrid` — the season decides in Advent, Christmas, Lent, Holy Week and
  Easter; the week decides in Ordinary Time. **The default.**
- `liturgical` — the season decides every day of the year.
- `weekly` — the day of the week decides every day of the year.

---

## 6. Ownership map

| Area | Owns | Files |
|---|---|---|
| Prayer text | content editors | `packages/content/content/**` |
| The rules for today's rosary | dev | `packages/content/src/calendar/rules.ts` |
| Navigation | dev | `packages/content/src/nav.ts` |
| Website | dev | `apps/web/**` |
| App | dev | `apps/mobile/**` |
| Shared look and feel | dev | `packages/ui/src/index.ts`, `apps/web/app/globals.css` |
| Data model | dev | `packages/content/src/schema.ts` |

---

## 7. Status

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the current state, and
[`docs/DECISIONS.md`](docs/DECISIONS.md) for why things are the way they are.

**Two things are still open** — see [`docs/DECISIONS.md`](docs/DECISIONS.md) for
the full list:

1. **A second language.** English only for now. Spanish would mean a `locale`
   field on every document and a second navigation tree; worth deciding before
   the content doubles.
2. **Notifications.** Daily rosary reminders and novena nudges are the feature
   most likely to make the app sticky, and the one thing a PWA cannot do
   reliably.

The published edition (Douay-Rheims) and the mystery rule (hybrid) have both
been settled.
