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

## 2026-11-08 — Going live

### The weeks of Ordinary Time are numbered as the Roman Missal numbers them

**Decision.** The weeks of Ordinary Time run from Sunday to Saturday and are
numbered 1 to 34. The first run opens with the week of the Baptism of the
Lord; the second opens with the week of Pentecost and is numbered back from
the end, so that the week of Christ the King is the thirty-fourth. Lent and
Easter are not Ordinary Time weeks, so the numbers skip over them.

**Why.** The readings and the week named beside them have to agree. The
readings come from the USCCB liturgical calendars, which name the week for
every Sunday — "Thirty-second Sunday In Ordinary Time" — and the calendar
engine works the week out from the computus instead. When the two disagreed,
the home page called 8 November 2026 the twenty-ninth week while the readings
page, quoting the USCCB, called it the thirty-second. The site was
contradicting itself on the same day.

**How it is kept honest.** The rule lived in two copies, in `day.ts` and in
`lectionary.ts`, and two copies of a calendar rule eventually disagree. There
is now one, in `liturgical.ts`, and
`packages/content/test/ordinary-time.test.ts` checks every week the USCCB
names in 2022–2028 against it.

### The website's start command lives in the root `package.json`

**Decision.** The root `package.json` carries a `start` script, the same
command `railway.json` carries in `deploy.startCommand`.

**Why.** Railway's current builder does not read `deploy.startCommand` out of
`railway.json` — it looks for a `start` script in the root `package.json`,
and a monorepo root has none by default. The first deploy failed with "No
start command detected". Keeping both means the site starts whether Railway
reads the file or the script.

---

## 2026-11-09 — What the day looks like

### The colour card shows both colours

**Decision.** The liturgical colour of a day can be two colours, and when it
is, both are shown: the colour of the celebration kept today first, and the
colour of the weekday of the season beneath it. The words that go with each
colour live in the content package, so the website and the phone cannot
drift apart on them.

**Why.** The engine works out the colour of the *weekday* — green in Ordinary
Time, violet in Lent, white at Christmas. USCCB's calendar gives the colour
of the *celebration kept*. On a saint's feast in Ordinary Time the two
answers are white and green, and the site was contradicting itself: the
readings page quoted the USCCB and the home page said otherwise. Showing
both is true of the day, and it stops the site arguing with its own lectionary.

**What still disagrees.** The readings content carries a `colour` field taken
from the USCCB calendars, and on about six hundred days it is the colour of
an *optional* memorial rather than of the day — `"Weekday green/ [Saint
Hilary…]"` is filed as white. That is a bug in the extractor, not in the
engine, and it can only be fixed by re-running it over the PDFs.

### The mystery sets are drawn, not photographed

**Decision.** Each set of mysteries has an emblem, drawn in the stylesheet's
own colour so that it is legible in light and dark, and it is the emblem
rather than a photograph that stands for the set.

**Why.** The site has no pictures yet, and the alternative was to have none
at all on the page that most people will look at first. Drawing them keeps
them small, sharp at any size, and honest about what they are. When there
are real pictures, one component changes and the pages do not.

### The full navigation needs a thousand pixels

**Decision.** The seven section links are only shown when the window is wider
than 1000 pixels; below that they are reached from the menu.

**Why.** The links are `nowrap` and the header is one row, so between about
nine hundred and a thousand pixels they pushed the search and theme buttons
off the right edge of the screen. A split-screen window on a laptop is
exactly that width.

---

## 2026-11-09 — Praying it properly

### The prayers of the Rosary live with the prayers

**Decision.** The fixed prayers of the Rosary — the Sign of the Cross, the
Apostles' Creed, the Our Father, the Hail Mary, the Glory Be, the Oh My
Jesus, the Hail, Holy Queen and the closing prayer — and the order they are
said in, now live in `@gorosary/content` as `rosary-steps.ts`.

**Why.** They used to live in the website, in `apps/web/lib/prayers.ts`, and
the website and the app could not both use them without one of them keeping a
copy. A novena has to include the whole Rosary, and the Rosary has to be the
same Rosary wherever it is read. One place, in the content package, is the
only way to be sure of that.

### The Rosary is read along, in the whole

**Decision.** The read-along now begins with the Sign of the Cross, the
Apostles' Creed, the Our Father, three Hail Marys and the Glory Be. Each
decade is announced — "The First Mystery — The Annunciation", with the
scripture and the intention — before the Our Father, the ten Hail Marys, the
Glory Be and the Oh My Jesus. The Rosary ends with the Hail, Holy Queen, the
closing prayer, and the Sign of the Cross.

**Why.** The Apostles' Creed was missing, and so was the Oh My Jesus and the
mystery announced before each decade. A reader was expected to know what to
say and in what order, which is the one thing the read-along is for.

**A note on the count.** This leaves fifty-three Hail Marys in the Rosary —
fifty in the decades and three at the beginning — rather than the traditional
fifty-four, whose last is said after the Hail, Holy Queen. The pages that
describe the Rosary say so plainly rather than quietly keeping the old
number.

### A novena is prayed with the Rosary, and both are shown

**Decision.** The novena page's second section is now called **Instructions**,
and each of the nine days carries its own read-along: the Sign of the Cross,
the prayer of the day, and then the whole Rosary, with nothing left out.

**Why.** The old section gave only the prayer of the day and left the reader
to supply the rest from memory. The page had two headings called "The Nine
Days" — one for the history of the prayers and one for the tracker — which
was confusing, and the second is now the Instructions.

### The pictures are borrowed, and credited

**Decision.** The twenty paintings of the mysteries come from The Holy Rosary
gallery and the fourteen of the Stations from Catholic Tradition. Each page
that shows one carries a credit, and the footer carries them too.

**Why.** The emblems that stood in for them were placeholders, and the site
is a devotional site: a painting of the Annunciation is worth more than a
shape. Neither site states a licence for reuse, so the credit is not a
formality — if the site is ever published commercially, the pictures should
be relicensed or replaced. The file names follow the content, so replacing
them is a matter of dropping new files in with the same names.

---

## 2026-11-09 — The home page

### The home page is a set of sections, and the rosary is the first of them

**Decision.** The landing page is divided into sections: today's rosary, the
readings of the day, the novenas being made now, the prayers of the day, the
calendar, and the rest of the site. The rosary section carries the painting
of the first mystery on the left and the five mysteries on the right, and the
whole of the painting is a link to today's rosary. The four buttons that used
to sit under the title are gone; each of those sections is on the page now.

**Why.** The buttons took the reader nowhere that the page did not already
go, and they pushed the painting up out of the first screen. On a phone the
painting and the five mysteries are side by side, so the reader can see what
is being prayed without scrolling.

### The mobile and the wide layouts are drawn separately

**Decision.** The home page has a narrow layout and a wide layout, not one
that merely reflows: the painting fills its column on a phone and sits on
the left of the page on a wide screen.

**Why.** A phone and a desktop are different objects. The narrow layout is
thumb-first, and the wide layout has room for the painting to be large.

### The weekday is no longer shown twice, and the alternative reading is gone

**Decision.** The date on the home page no longer carries a separate pill
for the weekday, and the "Also today — the Church's calendar" line is
removed.

**Why.** The date already says the weekday. The alternative reading confused
people: it looked like a second answer to the same question rather than the
other tradition.

### Corpus Christi and the Sacred Heart are where the USCCB says they are

**Decision.** Corpus Christi is the Sunday after Trinity Sunday, and the
Sacred Heart is the Friday after that.

**Why.** The engine had them as the Thursday after Trinity and six days
later, which is what the Roman Missal says before the transfer. But the
USCCB liturgical calendars — the ones the readings come from — have them on
the Sunday and the Friday, in every year the site covers. Since the readings
and the calendar panel are read side by side, they have to agree.

---

## 2026-11-09 — The text of the readings, and the shape of the home page

### The readings are read, not only cited

**Decision.** The complete Douay-Rheims is in the content package, and the
readings page shows the text of every reading alongside its citation.

**Why.** A citation is a direction, not a reading. The Bible is in the public
domain, and the lectionary's citations are regular enough to be read: a book
and a chapter, a list of verses, a second chapter after a semicolon, and the
letters that say a verse runs on. The psalms needed one translation, because
the lectionary counts them as the Hebrew does and the Douay-Rheims counts
them as the Vulgate does.

### The mobile and the wide layouts are drawn separately

**Decision.** The home page has a narrow layout and a wide layout, not one
that merely reflows. On a phone the painting of the first mystery takes the
whole width and the five mysteries sit beneath it; on a wide screen the
painting stands beside the title and the mysteries, so the two columns come
to about the same height.

**Why.** A phone is a thumb-first thing and a desktop is not. The two
columns on a phone made the painting small and the page busy; the painting
wants to be the first thing you see.

### The picture and the words beneath it are the way in

**Decision.** The painting, and the "Pray the Rosary" beneath it, are one
link to today's rosary, with the words said on the picture itself on a
pointer.

**Why.** The four buttons that used to sit under the title took the reader
nowhere that the page did not already go, and they pushed the painting out of
the first screen.

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
