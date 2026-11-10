import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CYCLE_GOSPELS,
  CYCLE_TITLES,
  availableReadingYears,
  getReadings,
  yearEntries,
  readingText,
} from '@gorosary/content';
import { TimezoneSync } from '@/components/TimezoneSync';
import { visitorTimeZone } from '@/lib/timezone';

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

const COLOUR_TEXT: Record<string, string> = {
  white: 'The colour of joy — Christ, the saints, and the Blessed Virgin.',
  violet: 'The colour of preparation and penance.',
  red: 'The colour of the Spirit, of the Passion, and of martyrs.',
  green: 'The colour of Ordinary Time — growth, hope, and the kingdom.',
  black: 'The colour of mourning, for the dead.',
  rose: 'The colour of the third Sunday of Lent, halfway through the fast.',
};

export default async function ReadingsPage() {
  const timeZone = await visitorTimeZone();
  const readings = getReadings(new Date(), timeZone);
  const { position, entry } = readings;
  const years = availableReadingYears();

  const dateLabel = position.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const year = yearEntries(readings.year);

  return (
    <>
      <TimezoneSync serverDate={position.date.toISOString().slice(0, 10)} />

      <div className="page-head">
        <div className="wrap">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Readings</span>
          </nav>

          <p className="eyebrow">The Roman Lectionary</p>
          <h1 className="page-title">Today&rsquo;s Readings</h1>
          {entry?.celebration ? (
            <p className="page-subtitle">{entry.celebration}</p>
          ) : (
            <p className="page-subtitle">{position.label}</p>
          )}
          <p className="page-summary">
            {dateLabel} · {CYCLE_TITLES[position.cycle]},{' '}
            {CYCLE_GOSPELS[position.cycle]}
          </p>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop: 32 }}>
        {entry?.colour ? (
          <p className="reading-colour">
            <span
              className={`swatch swatch--${entry.colour}`}
              aria-hidden="true"
            />
            <span>
              <strong>{entry.colour}</strong> — {COLOUR_TEXT[entry.colour]}
            </span>
          </p>
        ) : null}

        {!readings.hasReadings ? (
          <p className="notice">
            The readings for {readings.year} are not in the app yet. The
            calendars are published a few years ahead, so this page fills in as
            each year is added.
          </p>
        ) : null}

        {entry ? (
          <div className="readings">
            {READING_ORDER.map(({ key, label }) => {
              const reading = entry[key];
              if (!reading) return null;
              const text = readingText(reading.reference);
              return (
                <article className="reading" key={key}>
                  <p className="reading__kind">{label}</p>
                  <p className="reading__ref">{reading.reference}</p>
                  {text ? (
                    <div className="reading__text">
                      {text.map((verse) => (
                        <p className="verse" key={verse.verse}>
                          <span className="verse__number">{verse.verse}</span>
                          {verse.text}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}

        {year.length > 0 ? (
          <section style={{ marginTop: 48 }}>
            <h2 className="section-title">Every day of {readings.year}</h2>
            <p className="section-lede">
              The whole calendar, as the dioceses of the United States keep it.
            </p>
            <ul className="year-list">
              {year.map((item) => (
                <li
                  className={`year-list__row${
                    item.date === entry?.date ? ' year-list__row--today' : ''
                  }`}
                  key={item.date}
                >
                  <span className="year-list__label">
                    {item.date.slice(5).replace('-', ' ')} ·{' '}
                    {item.celebration ?? ''}
                  </span>
                  <span className="year-list__gospel">
                    {item.gospel?.reference ?? ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="small muted" style={{ marginTop: 32 }}>
          The readings are those of the Lectionary for Mass for the dioceses of
          the United States of America. GoRosary has them for {years[0]} to{' '}
          {years[years.length - 1]}.
        </p>
      </div>
    </>
  );
}

