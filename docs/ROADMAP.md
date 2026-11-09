# Roadmap

Where the project stands and what comes next, roughly in the order it should
be done.

---

## Phase 0 — Foundation ✅

- Monorepo, npm workspaces, TypeScript strict everywhere
- Content pipeline: Markdown → Zod validation → compiled TypeScript module
- Liturgical calendar engine: Easter computus, seasons, moveable feasts,
  fixed feasts, the mystery rules
- Navigation as data; website routes generated from it
- Website: landing page showing today's rosary, section pages, document pages
  for every kind, search, light/dark, responsive
- App: Expo Router, today's rosary, section and prayer screens, novena tracker
  with local persistence
- Design tokens shared between web and app

## Phase 1 — Content ✅ (in progress)

- The Rosary: overview, four mystery sets, how to pray, reflections
- Twelve novenas and how to make one
- Thirteen daily prayers
- The Chaplet of Divine Mercy and the Prayer of the Day
- Two litanies and the Stations of the Cross
- The calendar: feasts and fasts, the saints of the year
- **The Roman Lectionary**: the engine that computes the cycle year and the
  slot for any date, and the readings themselves — every Sunday of all three
  cycle years, and the solemnities that keep the same readings every year

**Remaining:** the readings of the years outside 2022–2028, which the
USCCB publishes the same way and would be extracted the same way; the full
Douay-Rheims text of each reading, which is the next content phase and the
thing that turns a list of citations into something you can read; a complete
365-day saint of the day (141 fixed-date commemorations are in place); the
Eastern Catholic mysteries if wanted; and a second language.

## Phase 2 — Making it a habit

This is the phase that decides whether people keep the app.

1. **Pray-along mode** — the website has a step runner; the app needs the same,
   with the mystery text on screen and a tap-to-advance. This is the single
   most important feature still missing.
2. **Notifications** — a daily rosary reminder at a user-chosen time, and a
   nudge on day 1 and day 9 of a novena. This is why the app is native and
   not a PWA.
3. **Novena progress across the app** — start the novena, get told which day
   to pray today, and see the streak.
4. **Offline** — the content is already bundled, so this is mostly about
   caching and making the app launch without a network.
5. **Bookmarks and favourites** — "my prayers", so a person can keep their own
   three or four.

## Phase 3 — Deeper

6. **Liturgical calendar as a real page** — a month view with the feasts, the
   fasts, and today's commemorations.
7. **Audio** — recorded or spoken prayer, and at minimum a text size and
   reading-speed control for the elderly, who are a large part of this
   audience.
8. **Intention journal** — private, local, exportable. What a person is
   praying for.
9. **Sync** — anonymous, key-based, no accounts. Only worth doing if people
   actually use more than one device.
10. **Languages** — Spanish first. Needs a `locale` field on every document
    and a second navigation tree.
11. **Images throughout the site** — the twenty pictures of the mysteries and
    the fourteen of the Stations are in, from [The Holy Rosary](https://www.theholyrosary.org/rosary_gallery/)
    and [Catholic Tradition](http://www.catholictradition.org/Children/stations-cross.htm),
    credited on the pages that use them. What is still missing is a picture
    for each of the seasons and for the feasts, so that a page can be
    recognised at a glance. Neither site states a licence for reuse — see
    `apps/web/public/images/ATTRIBUTION.md`.

## Phase 4 — Reach

12. **SEO** — the website's job is to be found by people searching for a
    prayer. Sitemap, structured data, per-prayer landing pages.
13. **App Store and Play Store** — icons, screenshots, privacy disclosures,
    store listings.
14. **Analytics** — only if the owner wants them, and only with consent.

---

## Known issues and open work

| Issue | Where | Notes |
|---|---|---|
| The website resolves "today" in the server's timezone | `apps/web/app/page.tsx` | The app is correct by construction. Fix by resolving the day from a client-supplied timezone, or edge-rendering per region. |
| The liturgical colour disagrees with the readings page on about a third of the days | `packages/content/src/calendar/day.ts` | The engine gives the colour of the weekday; USCCB gives the colour of the celebration kept. The counts are in `HANDOFF.md` §8. It is a decision about canon as much as code. |
| `railway.json` is deprecated | repo root | Railway wants `.railway/railway.ts` instead. The file keeps working until 1 December 2026; see `docs/DEPLOY.md` §7. |
| No prayer runner in the app | `apps/mobile` | The web has `StepRunner`; the native equivalent is Phase 2 item 1. |
| The saint of the day covers 141 fixed-date commemorations | `content/calendar/saints-of-the-year.md` | Enough to be useful, not a full calendar. The remaining days of the year still need entries. |
| `packages/ui` holds only tokens | `packages/ui/src/index.ts` | Shared React components would need a DOM and a native variant. Not worth it until there is real duplication. |

---

## Things deliberately not built

- **A backend or user accounts.** See `docs/DECISIONS.md`. The data model does
  not prevent adding them later.
- **A CSS framework.** The design system is about 700 lines of CSS with custom
  properties. It is smaller than the framework would have been.
- **A state management library.** React state and AsyncStorage cover
  everything currently planned.
- **Content management system.** Content-as-code means the prayer text is
  versioned, reviewable, and diffable — which is what a small project needs
  most, and a CMS would take away.
