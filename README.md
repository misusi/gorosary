# GoRosary

**gorosary.app** — the Rosary, the novenas, and the prayers of the day, in one
place. A website for desktop and mobile, and a separate app for iOS and
Android, showing the same content.

> Start here: **[STARTUP.md](./STARTUP.md)** — the map of the project.

---

## What it is

A prayer app with no home screen clutter. You open it and it tells you what
the Church is praying today, and then it gets out of the way.

- **Today's rosary** on the landing page — the correct mystery set, computed
  from the Roman liturgical calendar, not hardcoded.
- **The Rosary** — the four sets of mysteries, a step-by-step prayer runner,
  and reflections for each of the twenty mysteries.
- **Novenas** — twelve, with a tracker that remembers which days you have
  prayed. Stored on your device; no account required.
- **Daily prayers** — morning and evening, the Angelus, the Regina Coeli, the
  Acts of Contrition and Faith, the Creed, the Our Father, the Hail Mary.
- **Divine Mercy** — the Chaplet and its nine-day Prayer of the Day.
- **Litanies and Stations** — the Litany of Loreto, the Litany of the Saints,
  and the fourteen Stations of the Cross.
- **The calendar** — the saints of the year, the feasts and fasts, and an
  explanation of how the mysteries change.

---

## Stack

| | |
|---|---|
| Monorepo | npm workspaces |
| Website | Next.js 16 (App Router), React 19.3, TypeScript |
| App | Expo SDK 58, React Native 0.88, Expo Router |
| Content | Markdown + YAML frontmatter, validated with Zod, compiled to TypeScript |
| Calendar | Own implementation of the Gregorian computus and the Roman liturgical year |
| Storage | Local only for now (browser storage / AsyncStorage). No account, no backend, no tracking. |

The website and the app import the **same compiled content package**, so a
prayer can never differ between them.

---

## Getting started

```bash
npm install
npm run dev          # website on http://localhost:3000
npm run dev:mobile   # the app — scan the QR code with Expo Go
```

Requires Node 20.11 or newer.

Full command list and the repository map: **[STARTUP.md](./STARTUP.md)**.

---

## Adding a prayer

1. Create `packages/content/content/<section>/<name>.md`.
2. Copy the structure from an existing file — the frontmatter keys and the
   document kind are validated by `packages/content/src/schema.ts`.
3. Add one line to `packages/content/src/nav.ts`.
4. Run `npm run build:content`.

The build fails if the file is malformed, if the id does not match the
filename, or if the prayer is not linked from the navigation. Nothing reaches
the website or the app unvalidated.

Full guide: **[docs/CONTENT.md](./docs/CONTENT.md)**.

---

## Licence and attribution

The prayer texts are traditional Catholic prayers in the public domain.
Scripture references follow the Douay-Rheims. GoRosary is not affiliated with
any religious order, diocese, or the Roman Catholic Church.

See [docs/DECISIONS.md](./docs/DECISIONS.md) for the decisions taken so far.
