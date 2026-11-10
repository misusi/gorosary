# Site review guide

A walk through **gorosary.app**, one part at a time, so that nothing gets
skipped and every note has somewhere to go.

Work through it in order and write your notes as you go — either straight into
this file, or on paper and then back into it. When you are done, send it back
and I will work through the list.

**The site is live now**, so everything below can be looked at as it will be
for a reader. Nothing here is a plan; it is what is there today.

---

## How to use this

**Two widths.** Most of what can go wrong on a site goes wrong when it is
narrow. Keep the window wide (about 1200px) and then narrow it (about 380px,
or half a laptop screen, or a phone). Look at both. Where a page has a
read-along or a picture, narrow it first — that is where the trouble is.

**Two themes.** The sun/moon button in the header switches between light and
dark. Look at each page in both.

**Mark it as you go.** In the log at the end, mark every page you have looked
at, so we both know what has been covered.

**Say what you mean by "wrong".** Three kinds of note are useful, and they
need different fixing:

- **The words are wrong** — a prayer is misquoted, a title is wrong, the
  English is off, the theology is off. This matters most, and I will treat it
  as the priority.
- **It does not work** — something is broken, a button does nothing, the page
  will not scroll, the layout falls apart.
- **It does not feel right** — it is correct but cold, or too plain, or the
  wrong thing is emphasised. These are the ones only you can judge.

---

## 1. The parts that are the same on every page

Check these once; then they need not be checked again.

- [ ] **The header.** The logo goes home. The seven links work. The search
      button works. The sun/moon button switches the theme and *keeps* it
      switched when you go to another page.
- [ ] **The header on a narrow screen.** Below about 1000px the links are
      replaced by the menu button. Does the menu open, does it list everything,
      does it close when you pick something?
- [ ] **The footer.** The columns of links work. The note at the bottom is
      readable — in particular the line crediting the two sites the paintings
      came from.
- [ ] **The breadcrumbs.** On any page below the home page, the trail at the
      top shows where you are and the links work.
- [ ] **The right-hand column on a wide screen.** The list of the other pages
      in the same section. The current page is marked. Does it help or
      clutter?
- [ ] **Reading on a phone.** Take any paragraph of prayer text. Is the line
      length comfortable, or is it too long or too short?
- [ ] **Text size.** Does the prayer text feel the right size next to the
      surrounding text?
- [ ] **Large text.** There is not yet a way to make the text bigger for
      older readers. That is on the roadmap; this is the place to say how it
      should work.

**Notes:**

---

## 2. Today — `gorosary.app/`

The landing page. This is what a visitor sees first and it decides whether
they stay.

- [ ] **The mystery set.** Today it is the Joyful Mysteries, with the reason
      underneath. Does the reason make sense?
- [ ] **"Also today — the Church's calendar."** The alternative reading, shown
      underneath the main one. Is it clear what it is? Should it be there at
      all?
- [ ] **The painting.** It is the first mystery of today's rosary. Is it the
      right one to lead with? Is it too big, too small, too dark?
- [ ] **The credit under the painting.** It links to the site the painting came
      from. Does it need to be more prominent, or less?
- [ ] **The five decades.** Each with its Scripture reference.
- [ ] **The calendar panel.** The season, the week, the liturgical colour,
      what is kept, fast and vigil.
- [ ] **The colour box.** When the colour of the celebration and the colour of
      the weekday differ, both are shown, the celebration's first. Is that
      clear? Does the order read right — should the day's own colour be on
      top, or the season's?
- [ ] **"Kept today"** and **"Fast and vigil"** — is the wording right?
- [ ] **The buttons.** Pray the Rosary, Readings, Novenas, Daily prayers.

**Also:** `/readings` (the day's readings), `/calendar/saint-of-the-day`,
`/calendar/how-the-mysteries-change`.

**Notes:**

---

## 3. The Rosary

### The read-along — `/rosary/joyful` and the other three

The same runner appears on all four mystery pages.

- [ ] **The order.** Sign of the Cross → Apostles' Creed → Our Father → three
      Hail Marys → Glory Be → then each decade (the mystery announced, Our
      Father, ten Hail Marys, Glory Be, Oh My Jesus) → Hail, Holy Queen →
      the closing prayer → Sign of the Cross. Is that the order you pray?
- [ ] **The Apostles' Creed** — the wording now follows the text you gave.
      Read it aloud and check it against your own copy.
- [ ] **The ten Hail Marys.** Each is a separate click. Is that the right
      granularity, or should the decade be one click?
- [ ] **The mystery announcement.** It shows the mystery's name, its Scripture
      and its intention. Is that enough to say it out loud from?
- [ ] **The meditation** on the tenth Hail Mary — is it a good length for
      praying?
- [ ] **The closing prayer** — the "O God, whose only begotten Son…" text.
- [ ] **The buttons.** Back, Next, Skip to end. Does Skip to end do what you
      expect? Do the arrow keys work?
- [ ] **On a narrow screen**, can you still press Next without scrolling?

### The mystery pages

- [ ] **The painting** at the head of each mystery. Does it match the mystery?
- [ ] **The meditation and the intention** under each.
- [ ] **The theme line** under the title ("The Incarnation of the Son of God").

### The written pages

- [ ] `/rosary` — the overview. It now says the Rosary is **fifty-three**
      Hail Marys, since the final Hail Mary and Glory Be after the Hail, Holy
      Queen were taken out. Is that the count you want the site to teach?
- [ ] `/rosary/how-to-pray` — does the written description match the read-along
      exactly, step for step? Any place where the page and the runner disagree
      is a fault.
- [ ] `/rosary/with-reflections`.

**Notes:**

---

## 4. Novenas

Thirteen of them. Look at two or three in full and then spot-check the rest —
they are built the same way.

- [ ] **The Instructions section.** Each of the nine days has its own
      read-along: the Sign of the Cross, the prayer of the day, and then the
      whole Rosary, nothing left out. Is that what you want a day to be?
- [ ] **The nine prayers.** Read a couple closely. Are they in the right voice,
      the same voice as the rest of the site?
- [ ] **The checkbox.** Tick a day; does the progress line update and does it
      stay ticked when you come back?
- [ ] **The headings.** The page has the history of the novena, then "The
      Nine Days", then "How to Pray It", then "Instructions". Four headings for
      one prayer — is that too many? Would the Instructions sit better at the
      top, above the history?
- [ ] **The new one** — `/novenas/our-lady-undoer-of-knots`. This is the only
      novena written from scratch, so it is the one most worth reading
      closely. Does it sound like the others?
- [ ] `/novenas/how-to-make-a-novena`.

**Notes:**

---

## 5. Daily prayers

Thirteen short pages, each a prayer with some notes on it.

- [ ] **The Apostles' Creed** (`/daily/apostles-creed`) — it now carries the
      text you gave, and the second section still has the Creed of the
      Councils. Is the first heading right now that it is not called "as
      recited in the Mass"?
- [ ] **Our Father, Hail Mary, Glory Be, the Sign of the Cross** — the texts
      and the commentary under them.
- [ ] **Morning and Evening Prayer**, **the Angelus**, **the Regina Coeli**,
      the two Acts, **the Prayer for the Grace of the Holy Spirit**.
- [ ] Is there a daily prayer you use that is not here?

**Notes:**

---

## 6. Divine Mercy, Litanies and Stations

- [ ] `/mercy/chaplet` — the five chapters, with the optional prayer after
      each.
- [ ] `/mercy/prayer-of-the-day`.
- [ ] `/litanies/loreto` and `/litanies/saints` — the invocations and
      responses. Are the responses bold enough to find with your thumb?
- [ ] `/litanies/stations` — the fourteen stations, each with its painting.
      Do the paintings match the stations?

**Notes:**

---

## 7. The Calendar

- [ ] `/calendar/feasts-and-fasts`.
- [ ] `/calendar/saints` — the 141 fixed-date commemorations. It is not a
      complete year yet. Should it be?

**Notes:**

---

## 8. Search

- [ ] `/search` — search for "rosary", "Joseph", "creed", "patience".
- [ ] Do the results take you where you expect?

**Notes:**

---

## 9. The questions I would like your view on

These are not bugs; they are decisions that are yours to make.

1. **The Rosary ends after the Hail, Holy Queen.** It used to end with a final
   Hail Mary and Glory Be. You asked for those to go. It means the site now
   teaches fifty-three Hail Marys rather than the traditional fifty-four.
   Keep it?
2. **Two colours in the liturgical colour box.** It shows the colour of the
   celebration and the colour of the weekday, when they differ. The alternative
   is to show one and choose. Which?
3. **The art.** The paintings are borrowed and credited. Should the site have
   more of them — the seasons, the feasts — or is what is there enough?
4. **The prayers are in code, not in the content files.** The fixed prayers of
   the Rosary live in `packages/content/src/rosary-steps.ts`, because they never
   change. Some would expect them beside the other prayer texts. Does it
   matter?
5. **The mystery set for today** is decided by a rule in the code (feasts
   override, then the season, then the day of the week). Is that the rule you
   want, or should it follow your own custom?
6. **Anything the site does not have** that a prayer site should have.

---

## 10. The log

Mark every page as you look at it, so we both know what has been covered.

| Section | Page | Looked at | Notes |
|---|---|---|---|
| Today | `/` | | |
| Today | `/readings` | | |
| Today | `/calendar/saint-of-the-day` | | |
| Today | `/calendar/how-the-mysteries-change` | | |
| Rosary | `/rosary` | | |
| Rosary | `/rosary/joyful` | | |
| Rosary | `/rosary/sorrowful` | | |
| Rosary | `/rosary/glorious` | | |
| Rosary | `/rosary/luminous` | | |
| Rosary | `/rosary/how-to-pray` | | |
| Rosary | `/rosary/with-reflections` | | |
| Novenas | `/novenas/st-jude` | | |
| Novenas | `/novenas/st-joseph` | | |
| Novenas | `/novenas/st-patrick` | | |
| Novenas | `/novenas/st-francis` | | |
| Novenas | `/novenas/st-anthony` | | |
| Novenas | `/novenas/st-michael` | | |
| Novenas | `/novenas/sacred-heart` | | |
| Novenas | `/novenas/holy-spirit` | | |
| Novenas | `/novenas/our-lady-of-the-rosary` | | |
| Novenas | `/novenas/our-lady-of-snows` | | |
| Novenas | `/novenas/our-lady-of-perpetual-help` | | |
| Novenas | `/novenas/our-lady-undoer-of-knots` | | |
| Novenas | `/novenas/how-to-make-a-novena` | | |
| Daily | `/daily/morning` | | |
| Daily | `/daily/evening` | | |
| Daily | `/daily/angelus` | | |
| Daily | `/daily/regina-coeli` | | |
| Daily | `/daily/act-of-contrition` | | |
| Daily | `/daily/act-of-faith` | | |
| Daily | `/daily/prayer-for-the-holy-spirit` | | |
| Daily | `/daily/sign-of-the-cross` | | |
| Daily | `/daily/apostles-creed` | | |
| Daily | `/daily/our-father` | | |
| Daily | `/daily/hail-mary` | | |
| Daily | `/daily/glory-be` | | |
| Mercy | `/mercy/chaplet` | | |
| Mercy | `/mercy/prayer-of-the-day` | | |
| Litanies | `/litanies/loreto` | | |
| Litanies | `/litanies/saints` | | |
| Litanies | `/litanies/stations` | | |
| Calendar | `/calendar/feasts-and-fasts` | | |
| Calendar | `/calendar/saints` | | |
| Anywhere | `/search` | | |
| Anywhere | The section pages: `/rosary` `/novenas` `/daily` `/mercy` `/litanies` `/calendar` | | |

---

## 11. Sending it back

Fill this file in, or send back your notes however is easiest — a message, a
photo of the pages, a voice note. Either way, tell me:

- **which pages** each note is about (the URL or the page title);
- **which kind of note** it is (words wrong / broken / feels wrong);
- and, for anything about the words, **what it should say** — you know the
  prayers, and I do not.

I will go through it in the order you wrote it.
