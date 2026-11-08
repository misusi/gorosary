# Writing and editing content

Everything a person praying will read lives in
`packages/content/content/**/*.md`. This guide explains how to write those
files correctly.

---

## The 60-second version

1. Copy an existing file from the same folder.
2. Keep the frontmatter keys the same, except the kind-specific one.
3. The `id` must equal the filename.
4. Add one line to `packages/content/src/nav.ts`.
5. Run `npm run build:content`.

If the build passes, the prayer is live on the website and in the app.

---

## Where files live

| Folder | Section id | Holds |
|---|---|---|
| `content/rosary/` | `rosary` | The overview, the four mystery sets, how to pray, reflections |
| `content/novenas/` | `novenas` | The twelve novenas and how to make one |
| `content/daily/` | `daily` | Morning, evening, Angelus, Regina Coeli, the basic prayers |
| `content/mercy/` | `mercy` | The Chaplet of Divine Mercy, the Prayer of the Day |
| `content/litanies/` | `litanies` | The Litany of Loreto, the Litany of the Saints, the Stations |
| `content/calendar/` | `calendar` | Feasts and fasts, the saints of the year, how the mysteries change |

---

## Frontmatter

Every file starts with YAML frontmatter. These keys are always allowed:

```yaml
id: our-lady-of-the-rosary-novena   # required — kebab-case — MUST match the filename
kind: novena                          # required — see the table below
section: novenas                      # required — must match the folder
title: Novena to Our Lady of the Rosary   # required
subtitle: For grace, family, and the triumph of the Rosary   # optional
summary: Nine days of prayer to the Blessed Virgin Mary.     # optional — used on cards and in search
order: 9                              # optional — position within the section
tags: [novena, mary]                  # optional
edition: Traditional                  # optional — the published edition the text follows
attribution: Traditional novena prayers.   # optional — a short credit line
```

Then exactly **one** kind-specific key:

| `kind` | extra key | shape |
|---|---|---|
| `prayer` | *(none)* | prose only |
| `rosary` | `sets` | list of mystery sets, each with 5 mysteries |
| `novena` | `novena` | `patron`, `occasion`, `duration`, `days` |
| `chaplet` | `chapters` | numbered chapters, each with `title` and `text` |
| `litany` | `invocations` | list of invocation lines |
| `stations` | `stations` | exactly 14, each with `title`, `meditation`, `prayer` |
| `calendar` | `entries` | fixed-date commemorations |
| `readings` | `entries` | the readings of a day, keyed by `slot` |

The full shape is defined in
[`packages/content/src/schema.ts`](../packages/content/src/schema.ts). That file
is the contract — if you are not sure, read it.

### Readings

The readings of the Roman Lectionary are content too, in
`content/readings/`. Each document has a `cycle` — `a`, `b`, `c`, or `common`
— and a list of entries, each keyed by a `slot`:

```yaml
entries:
  - slot: ordinary:12:0
    label: the Twelfth Sunday in Ordinary Time
    firstReading:
      reference: Genesis 3:9-15
      title: The fall of Adam and Eve
      summary: >
        One or two sentences on what the reading is about.
    psalm:
      reference: Psalm 24:1-2, 3, 5-6
    secondReading:
      reference: Romans 5:12-19
    gospel:
      reference: Matthew 4:1-11
```

The slot is the key the engine computes. There are two kinds:

- `season:week:weekday` — a numbered week of a season. `ordinary:12:0` is the
  Twelfth Sunday in Ordinary Time, `ordinary:12:3` is the Wednesday of that
  week, `lent:3:0` is the Third Sunday of Lent.
- `named:feast` — a solemnity that keeps readings of its own, such as
  `named:easter` or `named:palm-sunday`.

**To find out which slots need writing:**

```bash
npm run plan --workspace @gorosary/content -- 2026
```

That prints every slot of a cycle year with the date it falls on, split into
the ones whose readings never change and the ones that depend on the cycle.
The build fails if a cycle year is missing any of its Sundays, so a gap in the
readings cannot slip through.

---

## The body

Everything below the frontmatter becomes the `body` of the document. It is
rendered as prose. The supported Markdown is deliberately small:

```markdown
A normal paragraph. **Bold**, *italic*, and __bold__ and _italic_ all work.

## A heading

> A rubric — a spoken cue, set apart from the prayer itself.

- A bullet
- Another bullet

1. A numbered item
2. Another one
```

That is all. No links, no images, no tables, no HTML.

For multi-line values inside the frontmatter (a meditation, a novena day, a
chapter), use a YAML folded block scalar and keep the indentation consistent:

```yaml
        meditation: >
          The angel Gabriel is sent by God to announce to Mary
          that she will conceive and bear the Son of God.

          The angel greets her with the words "Hail, full of grace."
```

The `>-` folds the newlines into spaces. Use `|-` if you want the line breaks
kept. **Every continuation line must be indented at least two spaces more than
the key it belongs to**, and never use tabs.

---

## Worked example — a novena

```yaml
---
id: st-jude-novena
kind: novena
section: novenas
title: Novena to St. Jude the Apostle
subtitle: For desperate and difficult cases
summary: Nine days of prayer to St. Jude, patron of hopeless causes.
order: 1
edition: Traditional
attribution: Traditional novena prayers.
tags: [novena, st-jude, desperate-cases]
novena:
  patron: St. Jude the Apostle
  occasion: Desperate and difficult cases
  duration: 9
  days:
    - day: 1
      title: St. Jude, apostle of our Lord
      text: >
        O holy Apostle Jude, patron of desperate causes...
    - day: 2
      title: Saint Jude, apostle
      text: >
        ...
---

## The Saint

Jude was one of the twelve Apostles...

## How to Pray It

Say one Hail Mary for each of the nine days...
```

The body is optional. A document may be *only* frontmatter.

---

## Worked example — a set of mysteries

```yaml
---
id: joyful-mysteries
kind: rosary
section: rosary
title: The Joyful Mysteries
subtitle: The mysteries of the Incarnation and early life of Christ
summary: The Annunciation, the Visitation, the Nativity...
order: 2
edition: Douay-Rheims
attribution: Scripture references per the Douay-Rheims; the meditations are traditional.
tags: [rosary, joyful, mysteries]
sets:
  - id: joyful
    title: The Joyful Mysteries
    theme: The Incarnation of the Son of God
    color: "#E3B23C"
    days: [Monday, Saturday]
    mysteries:
      - n: 1
        title: The Annunciation
        scripture: Luke 1:26-38
        intention: For the grace of a humble heart ready to be used by God.
        meditation: >
          The angel Gabriel is sent by God...
      - n: 2
        ...
---
```

`set.id` must be one of `joyful`, `sorrowful`, `glorious`, `luminous` — these
are the keys the calendar engine uses to decide what to pray today. A mistake
here means the day's rosary is wrong, so check it.

---

## Adding it to the navigation

Open `packages/content/src/nav.ts` and add an entry to the right section:

```ts
{
  label: 'Novena to St. Jude',
  href: '/novenas/st-jude',
  docId: 'st-jude-novena',
  description: 'For desperate and difficult cases.',
},
```

`docId` must match the `id` in the file. `href` is the address on the website
and must be unique. The build checks both.

---

## Running the check

```bash
npm run build:content     # validate and compile
npm run check:content     # validate only
npm run build:content -- --list   # print every document and its section
```

The build reports:

- **errors** — a document that fails the schema, a duplicate id, an id that
  does not match its filename, an unknown frontmatter key, a nav entry
  pointing at nothing, a document not reachable from the nav, a duplicate
  href. **The build stops.** Fix the file it names.
- **warnings** — a document that exists but is not linked from the nav. It
  still builds, but the prayer is invisible. Fix it anyway.

---

## Voice

The prayers in this app are the prayers people know. Match them.

- Traditional Catholic wording. If a reader could tell you when they last
  prayed it, it is right.
- Plain and concrete. Short sentences. No jargon.
- Never invent a quotation or attribute words to a saint they did not say.
- Never present a modern paraphrase of Scripture as if it were Scripture. If
  you are paraphrasing, say so, or just don't.
- No emoji. No exclamation marks in the prayers themselves.

---

## Licensing

The prayer texts are traditional Catholic prayers in the public domain.
Scripture references follow the Douay-Rheims. If you add text from a
copyrighted edition, record the edition in the `edition` field and the
copyright holder in `attribution` — and check the licence before publishing.
