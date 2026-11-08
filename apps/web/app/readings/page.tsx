import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CYCLE_GOSPELS,
  CYCLE_TITLES,
  getReadings,
  sundayEntriesForCycle,
  type LectionaryEntry,
} from '@gorosary/content';

export const metadata: Metadata = {
  title: "Today's Readings",
  description:
    "The readings of the day from the Roman Lectionary: the First Reading, the Psalm, the Second Reading, and the Gospel.",
};

export const dynamic = 'force-dynamic';

const READING_ORDER = [
  { key: 'firstReading', label: 'First Reading' },
  { key: 'psalm', label: 'Responsorial Psalm' },
  { key: 'secondReading', label: 'Second Reading' },
  { key: 'gospel', label: 'Gospel' },
] as const;

export default function ReadingsPage() {
  const readings = getReadings(new Date());
  const { position } = readings;
  const entry = readings.entry;

  const dateLabel = position.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const year = sundayEntriesForCycle(position.cycle);

  return (
    <>
      <div className="page-head">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Readings</span>
          </nav>

          <p className="eyebrow">The Roman Lectionary</p>
          <h1 className="page-title">
            {readings.isOwnDay ? 'Today’s Readings' : 'This Week’s Readings'}
          </h1>
          <p className="page-subtitle">{position.label}</p>
          <p className="page-summary">
            {dateLabel} · {CYCLE_TITLES[position.cycle]}, {CYCLE_GOSPELS[position.cycle]}
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 32 }}>
        {!readings.isOwnDay && readings.hasReadings ? (
          <p className="notice">
            The individual readings for each day of this week are not yet in the
            app. These are the readings of the week, which is what they are
            about.
          </p>
        ) : null}

        {!readings.hasReadings ? (
          <p className="notice">
            The readings for this day are not yet in the app.
          </p>
        ) : null}

        {entry ? (
          <div className="readings">
            {READING_ORDER.map(({ key, label }) => {
              const reading = entry[key];
              if (!reading) return null;
              return (
                <article className="reading" key={key}>
                  <p className="reading__kind">{label}</p>
                  <p className="reading__ref">{reading.reference}</p>
                  {reading.title ? (
                    <p className="reading__title">{reading.title}</p>
                  ) : null}
                  {reading.summary ? (
                    <p className="reading__summary">{reading.summary}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}

        <section style={{ marginTop: 44 }}>
          <h2 className="section-title">
            The whole of {CYCLE_TITLES[position.cycle]}
          </h2>
          <p className="section-lede">
            Every Sunday of the three-year cycle, from Advent to Christ the
            King.
          </p>
          <ul className="year-list">
            {year.map((item) => (
              <YearRow key={item.slot} entry={item} today={item.slot === position.slot} />
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function YearRow({
  entry,
  today,
}: {
  entry: LectionaryEntry;
  today: boolean;
}) {
  const label = entry.label ?? entry.slot;
  const gospel = entry.gospel?.reference;
  return (
    <li className={`year-list__row${today ? ' year-list__row--today' : ''}`}>
      <span className="year-list__label">{label}</span>
      {gospel ? <span className="year-list__gospel">{gospel}</span> : null}
    </li>
  );
}
