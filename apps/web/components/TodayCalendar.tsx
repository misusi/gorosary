import Link from 'next/link';
import type { Commemoration, DayDescription } from '@gorosary/content';

const COLOUR_NOTES: Record<DayDescription['colour'], string> = {
  white: 'The colour of joy — Christ, the saints, and the Blessed Virgin.',
  violet: 'The colour of preparation and penance.',
  red: 'The colour of the Spirit, of the Passion, and of martyrs.',
  green: 'The colour of Ordinary Time — growth, hope, and the kingdom.',
  black: 'The colour of mourning, for the dead.',
  rose: 'The colour of the third Sunday of Lent, halfway through the fast.',
};

function kindLabel(kind: string): string {
  return kind.replace(/-/g, ' ');
}

export function TodayCalendar({
  day,
  commemorations,
}: {
  day: DayDescription;
  commemorations: Commemoration[];
}) {
  const kept = commemorations.length > 0;
  const fastsAndVigils = [...day.vigils, ...day.fasts.map((fast) => ({
    name: fast.name,
    kind: 'commemoration' as const,
    note: fast.note,
  }))];

  return (
    <section>
      <h2 className="section-title">Today in the Church&rsquo;s year</h2>
      <p className="section-lede">
        Where the calendar of the Church has brought us today.
      </p>

      <div className="card-grid">
        <div className="card">
          <p className="card__label">The season</p>
          <p className="card__title">{day.seasonLabel}</p>
          <p className="card__desc">{day.weekLabel}</p>
        </div>

        <div className="card">
          <p className="card__label">Liturgical colour</p>
          <p className="card__title">
            <span
              className={`swatch swatch--${day.colour}`}
              aria-hidden="true"
            />
            {day.colourLabel}
          </p>
          <p className="card__desc">{COLOUR_NOTES[day.colour]}</p>
        </div>

        <div className="card">
          <p className="card__label">Kept today</p>
          {kept ? (
            <ul className="card__list">
              {commemorations.map((entry) => (
                <li key={entry.name}>
                  <strong>{entry.name}</strong>
                  {entry.note ? <span>{entry.note}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="card__desc">
              No feast or solemnity falls today. The Church keeps the ordinary
              Sunday and its Gospel.
            </p>
          )}
        </div>

        <div className="card">
          <p className="card__label">Fast and vigil</p>
          {fastsAndVigils.length > 0 ? (
            <ul className="card__list">
              {fastsAndVigils.map((entry) => (
                <li key={entry.name}>
                  <strong>{entry.name}</strong>
                  {entry.note ? <span>{entry.note}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="card__desc">
              Nothing special is kept today. No fast, and no vigil.
            </p>
          )}
        </div>
      </div>

      <p className="small" style={{ marginTop: 14 }}>
        <Link href="/calendar">The whole calendar of the Church&rsquo;s year →</Link>
      </p>
    </section>
  );
}
