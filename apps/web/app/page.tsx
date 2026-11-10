import Link from 'next/link';
import {
  currentNovenas,
  getReadings,
  getTodayRosary,
  NAV,
} from '@gorosary/content';
import { InlineText } from '@/components/Blocks';
import { ImageCredit } from '@/components/ImageCredit';
import { MysteryArt } from '@/components/MysteryArt';
import { TimezoneSync } from '@/components/TimezoneSync';
import { visitorTimeZone } from '@/lib/timezone';
import { TodayCalendar } from '@/components/TodayCalendar';

export const dynamic = 'force-dynamic';

const SET_HREF: Record<string, string> = {
  joyful: '/rosary/joyful',
  sorrowful: '/rosary/sorrowful',
  glorious: '/rosary/glorious',
  luminous: '/rosary/luminous',
};

/** The prayers that belong to the hours of a day. */
const DAILY_PRAYERS = [
  {
    href: '/daily/morning',
    title: 'Morning Prayer',
    note: 'To begin the day.',
  },
  {
    href: '/daily/angelus',
    title: 'The Angelus',
    note: 'A short prayer with a bell, three times a day: at dawn, at noon, and at dusk.',
  },
  {
    href: '/daily/evening',
    title: 'Evening Prayer',
    note: 'To close the day and review it.',
  },
];

export default async function HomePage() {
  const timeZone = await visitorTimeZone();
  const today = getTodayRosary(new Date(), timeZone);
  const readings = getReadings(new Date(), timeZone);
  const novenas = currentNovenas(today.date);
  const rosaryHref = SET_HREF[today.set] ?? '/rosary';
  const dateLabel = today.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const entry = readings.entry;

  return (
    <>
      <TimezoneSync serverDate={today.iso} />
      <section className="today">
        <div className="wrap today__card">
          <div className="today__head">
            <div className="today__meta">
              <span className="pill pill--season">{today.seasonLabel}</span>
              <span className="pill">{dateLabel}</span>
            </div>

            <h1 className="today__title">{today.setTitle}</h1>
            <p className="today__reason">{today.reason}</p>
          </div>

          {/*
            The painting on the left and the five decades on the right. The
            whole of the left half goes to today's rosary, so a reader can
            see what is being prayed and start it without hunting.
          */}
          <div className="today__hub">
            <Link className="today__hub__art" href={rosaryHref}>
              <MysteryArt
                set={today.set}
                n={1}
                title={today.mysteries[0]?.title}
              />
              <span className="today__hub__cta">
                <span className="today__hub__cta-label">Pray the Rosary</span>
                <span className="today__hub__cta-sub">{today.setTitle}</span>
              </span>
            </Link>

            <div className="today__hub__mysteries">
              {today.mysteries.map((mystery) => (
                <Link
                  className="mystery-line"
                  href={rosaryHref}
                  key={mystery.n}
                >
                  <span className="mystery-line__title">
                    {mystery.n}. {mystery.title}
                  </span>
                  <span className="mystery-line__scripture">
                    {mystery.scripture}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <ImageCredit href="https://www.theholyrosary.org/rosary_gallery/">
            The Holy Rosary
          </ImageCredit>
        </div>
      </section>

      <div className="wrap home">
        <section className="home__section">
          <h2 className="section-title">Today&rsquo;s Readings</h2>
          {entry ? (
            <>
              <p className="section-lede">
                {entry.celebration ?? 'The readings of the day'}
              </p>
              <dl className="day-readings">
                {entry.firstReading ? (
                  <div className="day-readings__row">
                    <dt>First Reading</dt>
                    <dd>{entry.firstReading.reference}</dd>
                  </div>
                ) : null}
                {entry.psalm ? (
                  <div className="day-readings__row">
                    <dt>Responsorial Psalm</dt>
                    <dd>{entry.psalm.reference}</dd>
                  </div>
                ) : null}
                {entry.secondReading ? (
                  <div className="day-readings__row">
                    <dt>Second Reading</dt>
                    <dd>{entry.secondReading.reference}</dd>
                  </div>
                ) : null}
                {entry.gospel ? (
                  <div className="day-readings__row">
                    <dt>Gospel</dt>
                    <dd>{entry.gospel.reference}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="small" style={{ marginTop: 12 }}>
                <Link href="/readings">The readings of the day →</Link>
              </p>
            </>
          ) : (
            <p className="section-lede">
              The lectionary for this day is not yet in the app.
            </p>
          )}
        </section>

        <section className="home__section">
          <h2 className="section-title">Current Novenas</h2>
          {novenas.length > 0 ? (
            <>
              <p className="section-lede">
                A novena is nine days of prayer to a particular saint. These are
                being made now.
              </p>
              <div className="card-grid">
                {novenas.map((novena) => (
                  <Link className="card" href={novena.href} key={novena.id}>
                    <p className="card__title">{novena.title}</p>
                    <p className="card__desc">
                      Day {novena.day} of {novena.duration}
                      {novena.occasion ? ` — ${novena.occasion}` : ''}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="section-lede">
              No novena is being made at this time of the year. Each one is
              begun on its own day — St. Joseph&rsquo;s on the fifteenth of
              March, St. Jude&rsquo;s on the twenty-eighth of October — and
              runs for nine days.
            </p>
          )}
        </section>

        <section className="home__section">
          <h2 className="section-title">Today&rsquo;s Daily Prayers</h2>
          <p className="section-lede">
            The prayers that belong to the hours of a day.
          </p>
          <div className="card-grid">
            {DAILY_PRAYERS.map((prayer) => (
              <Link className="card" href={prayer.href} key={prayer.href}>
                <p className="card__title">{prayer.title}</p>
                <p className="card__desc">{prayer.note}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="home__section">
          <TodayCalendar
            day={today.day}
            commemorations={today.commemorations}
          />
        </section>

        <section className="home__section">
          <h2 className="section-title">Everything else</h2>
          <p className="section-lede">
            The prayer of the traditional Catholic life, in one place.
          </p>
          <div className="card-grid">
            {NAV.filter((section) => section.id !== 'today').map((section) => (
              <Link className="card" href={section.href} key={section.id}>
                <p className="card__title">{section.label}</p>
                <p className="card__desc">
                  <InlineText text={section.description} />
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}


