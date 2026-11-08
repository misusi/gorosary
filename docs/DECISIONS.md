# Decisions

Every decision taken so far, and the reasoning. Newest first.

---

## 2026-11-07 — Project foundation

### Monorepo with npm workspaces

**Decision.** A single repository with `apps/` and `packages/`, using npm
workspaces.

**Why.** The website and the app must show identical prayer text. The cheapest
way to guarantee that is for both to import the same compiled package — not to
keep two copies in sync by hand. npm workspaces were chosen over pnpm because
npm ships with Node and the dependency graph here is small enough that pnpm's
deduplication is not worth an extra tool.

### Content is Markdown + YAML frontmatter, compiled ahead of time

**Decision.** Prayer text lives in `.md` files with YAML frontmatter. A build
step validates everything against a Zod schema and writes a single typed
TypeScript module. The website and the app both import the compiled result.

**Why.** Three constraints in tension:

1. The prayer text has to be *editable by a human* who is not a developer.
2. The website and the app have to render it identically, including the
   italic rubrics and the bold headings.
3. Nothing may fail at runtime for the person praying.

Markdown gives (1). Compiling to a typed module gives (2) and (3), because
there is no parser in the browser and no chance of a runtime error. MDX was
rejected because it would drag React DOM into the React Native bundle.

### A hand-written Markdown subset instead of a Markdown library

**Decision.** `packages/content/src/markdown.ts` is about 120 lines and
supports exactly: paragraphs, `#` headings, `>` rubrics, ordered and unordered
lists, and `**bold**` / `*italic*`.

**Why.** A full Markdown library renders differently in the browser and in
React Native, and the content only needs six constructs. Owning the parser
means the two apps cannot disagree about what a prayer looks like.

### Zod validation at build time, not runtime

**Decision.** Every document is validated when the content is compiled. The
build fails with the file name and the offending path.

**Why.** A typo in a prayer's frontmatter should be caught in CI, not by a
person praying at eleven at night. The cost is a build step; the benefit is
that the shipped content is always valid.

### Navigation in code, and the routes generated from it

**Decision.** `packages/content/src/nav.ts` holds a two-level tree: sections
(level 1) and documents (level 2). The website serves every path from a single
`app/[...path]/page.tsx` that resolves against this tree. The app navigates
the same tree.

**Why.** Adding a prayer should never mean adding a page file. It means
writing one Markdown file and adding one line to the nav. The build also
enforces that the two agree in both directions: no document may be orphaned,
and no nav entry may point at nothing.

### The website is Next.js; the app is Expo

**Decision.** Next.js 16 App Router for the website, Expo SDK 58 (React
Native) for the app.

**Why.** The website needs real URLs, server rendering, and good indexing —
Next.js gives that with the least ceremony. The app needs to be on the App
Store and the Play Store and feel native; Expo gets both iOS and Android from
one codebase and shares the content package directly. A PWA was rejected
because it cannot do reliable local notifications, which a prayer app will
want for a novena reminder.

### Local-first, no accounts

**Decision.** Novena progress is stored in browser storage and AsyncStorage.
No backend, no auth, no analytics.

**Why.** The product has no need for accounts yet, and an account system is
the single largest source of complexity, cost, and privacy risk in a project
this size. The data model is defined so that sync can be added later without a
content rewrite: the only server-side entity would be a progress record keyed
by novena id and day.

### Content authored as traditional public-domain prayers

**Decision.** All prayer text follows traditional Catholic wording. Scripture
references follow the Douay-Rheims.

**Why.** The app must show one fixed published translation, consistently
across every prayer, so that wording never varies. Traditional prayers are
public domain, which removes the licensing question entirely.

**Open.** Which published edition the app will name as its single fixed
translation — settled as the Douay-Rheims, with traditional wording for the
prayers.

### The mystery rule is a hybrid of the season and the week

**Decision.** `PRIMARY_RULE = 'hybrid'`. Feasts override everything. Then the
season of the Church's calendar decides where it has real force — Advent,
Christmas, Lent, Holy Week, Easter. In Ordinary Time the day of the week
decides, by the older assignment (Mon/Sat Joyful, Tue/Fri Sorrowful, Wed/Sun
Glorious, Thu Luminous). Whichever answer is not used is always shown
alongside, with the reason for it.

**Why.** Two traditions are genuinely in use and they disagree often enough
that picking one silently would annoy people.

Pure weekly has a real problem: Ash Wednesday falls on a Wednesday, so
ordinary time would put the Glorious Mysteries on the day Lent begins;
Palm Sunday would be Glorious during the Passion; and a Tuesday in Christmas
week would be Sorrowful. Pius XII endorsed the weekly assignment in *How to
Pray the Rosary* (1950) and it is what most people learned and expect, but
applied without exception it ignores the Church's seasons completely.

Pure seasonal has the opposite problem: six months of Ordinary Time and
Advent and Christmas all resolve to the same five Joyful mysteries, which is
repetitive enough to wear a daily rosary down.

The hybrid keeps what is true in each. The seasons where the Church's
penitential or festive character is strong are given to the calendar, and the
long ordinary stretches get the week's variety. The result is roughly
forty-seven days of Sorrowful at Lent, fifty of Glorious at Easter, forty of
Joyful at Christmas, and the Luminous Mysteries on Thursdays for most of the
year.

**Cost.** It is a compromise, and someone will always prefer one side. But
both answers are always on screen with their reasons, so nobody is misled, and
`PRIMARY_RULE` is a one-line switch to 'weekly' or 'liturgical' if the house
view changes.

### The readings are extracted from the USCCB liturgical calendars

**Decision.** The readings are not written by hand. `scripts/usccb-extract.py`
reads the liturgical calendar PDFs the United States Conference of Catholic
Bishops publishes for each year, and `scripts/generate-readings.ts` writes
them into `content/readings/`. The app therefore shows the same readings the
dioceses of the United States use, for every day including the weekdays.

**Why.** The alternative — writing two thousand dated citations by hand — is
both weeks of work and a standing chance of a wrong reference, which in a
prayer app is a real defect rather than a typo. The USCCB publishes about six
years ahead, which is a reasonable horizon.

**What this changed.** Three things that were wrong before:

- **The cycle year was off by one.** The Advent that opened 2022 is Year A, not
  2021. The USCCB calendars state the cycle outright ("Sunday Cycle YEAR A —
  November 30, 2025 to November 22, 2026"), which is what the engine is now
  checked against. Getting this wrong would have shown the wrong Gospel for
  three years running.
- **The readings are keyed by date, not by week.** The lectionary's own
  numbering of the Sundays of Ordinary Time does not match a simple count, so
  keying by week would have put the wrong readings on the wrong day. Keying by
  date removes the whole problem.
- **The weekday readings are included.** They were originally out of scope,
  on the grounds that they were too large to author safely. Extracting them
  made that moot.

**Known limits.** Two or three days a year in the source calendars are laid
out in a shape the extractor does not yet read, and those days have no
readings in the app. All Souls is one of them, and that one is correct — the
lectionary appoints no readings of its own for it. The build warns with the
exact dates and fails if a year loses more than ten days, which would mean the
extraction had broken.

### Scripture and prayers follow the Douay-Rheims

**Decision.** Scripture references follow the Douay-Rheims, and the prayers
use traditional Catholic wording.

**Why.** One fixed published edition, as the project owner chose. The prayers
themselves are traditional and public domain, so the only licensing question
is Scripture, and the Douay-Rheims has none.

### "Today" is resolved in the user's timezone

**Decision.** The calendar engine computes in whole UTC days for exact
arithmetic, but `localToday()` takes the year/month/day from the device's own
clock and pins them to UTC midnight.

**Why.** A device in New York at 9pm is already on the next day in UTC. Using
UTC there would tell a Catholic praying the Rosary the wrong mystery — the
exact kind of small wrongness that makes people stop trusting an app.

**Known limitation.** The website resolves "today" on the server, so the
server's timezone decides what a visitor sees. The app is correct by
construction. Closing this on the website means either resolving the day from
a client-supplied timezone or edge-rendering per region; both are noted in the
roadmap.

### React and React Native are hoisted to the workspace root

**Decision.** The root `package.json` declares `react`, `react-dom` and
`react-native` as devDependencies, and pins `react-native` through `overrides`.

**Why.** The website and the app must run the same React major — 19.3 — or the
workspace ends up with two copies and a peer-dependency conflict that makes
`npm install` fail outright. React Native is worse: packages such as
`@react-native-async-storage/async-storage` declare it only as a *peer*, so
npm resolves them against whatever is at the root. Hoisting explicitly
guarantees one copy, and the override stops a stale version from surviving in
the root when the Expo SDK is upgraded.

### No bottom tab bar in the app yet

**Decision.** The app currently navigates with a stack: Today → section →
prayer, with a search screen.

**Why.** A tab bar needs icon assets and a tab dependency, and the priority
for this phase is content. The nav structure is already there, so adding
tabs later is a layout change and nothing more.

---

## Open questions for the project owner

1. **Languages** — English only for now. A second language (Spanish, at
   least) would mean a `locale` field on every document and a second nav
   tree; worth deciding before the content doubles.
2. **Notifications** — daily rosary reminders and novena nudges are the
   feature most likely to make the app sticky, and the one thing a PWA cannot
   do reliably.
3. **Whether the hybrid mystery rule should become pure weekly or pure
   seasonal** — one constant in `packages/content/src/calendar/rules.ts`.
