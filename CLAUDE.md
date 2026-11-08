# CLAUDE.md

Working rules for AI assistants in this repository. The full project map is in
**[STARTUP.md](./STARTUP.md)** — read it before changing anything.

## What this project is

GoRosary: a Catholic prayer website (gorosary.app) and a separate iOS/Android
app, sharing one content package. The product goal is deliberately narrow —
one stop, no introductions, just the prayers.

## The rules that matter

**1. Content is data, not code.**
All prayer text lives in `packages/content/content/**/*.md`. If you are adding
or editing a prayer, you are editing Markdown with YAML frontmatter, never
TypeScript. Never hardcode a prayer into a component.

**2. Never let the website and the app diverge.**
Both import `@gorosary/content`. If a change needs to happen in both, it
belongs in `packages/content` or `packages/ui`, not in two places.

**3. The navigation is the source of truth for routes.**
`packages/content/src/nav.ts` defines level 1 (sections) and level 2
(documents). The website's `[...path]` route resolves against it; the app
navigates the same tree. Adding a route means adding a nav entry, not adding a
page file.

**4. Content changes must validate.**
After touching anything under `packages/content/content/`, run:

```bash
npm run build:content
```

It validates every document against the Zod schema, checks id/filename
agreement, and checks that navigation and content agree in both directions. Do
not bypass a failure — fix the content.

**5. Dates are handled in whole days.**
The liturgical engine works in UTC days for exact arithmetic, but "today" is
resolved through `localToday()`, which takes the *device's* year/month/day. A
prayer app that disagrees with the phone about the date is broken. Use
`localToday()` for anything user-facing.

**6. Typecheck before you claim something works.**

```bash
npm run typecheck
```

## Conventions

- TypeScript everywhere, `strict` on, `noUncheckedIndexedAccess` on.
- ES modules with explicit `.js` extensions on relative imports in packages
  (NodeNext resolution).
- Server components by default in Next.js; add `'use client'` only when a
  component genuinely needs state or browser APIs.
- Comment the *why*, not the *what*. The interesting decisions are already
  commented at the point they are made.
- Prefer editing the existing file over creating a new abstraction. There are
  two renderers (DOM and React Native) and the reason they are separate is
  documented in `packages/ui/src/index.ts`.

## Content voice

Traditional Catholic prayer text. Plain, warm, concrete, devotional. No
marketing language, no emoji, no invented quotations, no modern paraphrase of
Scripture presented as a quotation. When in doubt, use the traditional
wording.

## What not to do

- Do not add a backend, an auth system, or an analytics script. The project is
  local-first by decision (see `docs/DECISIONS.md`).
- Do not add a state management library. React state and `AsyncStorage` are
  enough for everything on the roadmap.
- Do not introduce a Markdown library. `packages/content/src/markdown.ts` is a
  deliberate 120-line subset so that the website and the app render text
  identically.
- Do not hardcode dates, feasts, or mystery sets. The calendar engine exists
  so that Easter is correct in every year without anyone updating a file.
