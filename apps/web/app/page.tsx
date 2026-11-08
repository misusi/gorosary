import Link from 'next/link';
import { getTodayRosary, NAV } from '@gorosary/content';
import { InlineText } from '@/components/Blocks';
import { TodayCalendar } from '@/components/TodayCalendar';

export const dynamic = 'force-dynamic';

const SET_HREF: Record<string, string> = {
  joyful: '/rosary/joyful',
  sorrowful: '/rosary/sorrowful',
  glorious: '/rosary/glorious',
  luminous: '/rosary/luminous',
};

export default function HomePage() {
  const today = getTodayRosary(new Date());
  const dateLabel = today.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <>
      <section className="today">
        <div className="wrap today__card">
          <div className="today__meta">
            <span className="pill pill--season">{today.seasonLabel}</span>
            <span className="pill">{today.weekday}</span>
            <span className="pill">{dateLabel}</span>
          </div>

          <h1 className="today__title">{today.setTitle}</h1>
          <p className="today__reason">{today.reason}</p>
          <p className="today__alt">
            Also today — {today.alternative.tradition}:{' '}
            {today.alternative.reason}
          </p>

          <div className="today__actions">
            <Link className="button button--primary" href={SET_HREF[today.set] ?? '/rosary'}>
              Pray the Rosary
            </Link>
            <Link className="button button--ghost" href="/readings">
              Readings
            </Link>
            <Link className="button button--ghost" href="/novenas">
              Novenas
            </Link>
            <Link className="button button--ghost" href="/daily/morning">
              Daily prayers
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap">
        {today.mysteries.length > 0 ? (
          <>
            <h2 className="section-title">The five decades</h2>
            <p className="section-lede">
              One Hail Mary for each mystery, and a decade of prayer on each.
            </p>
            <div className="card-grid">
              {today.mysteries.map((mystery) => (
                <Link
                  className="card"
                  key={mystery.n}
                  href={SET_HREF[today.set] ?? '/rosary'}
                >
                  <p className="card__title">
                    {mystery.n}. {mystery.title}
                  </p>
                  <p className="card__desc">{mystery.scripture}</p>
                </Link>
              ))}
            </div>
          </>
        ) : null}

        <TodayCalendar day={today.day} commemorations={today.commemorations} />

        <h2 className="section-title">Everything else</h2>
        <p className="section-lede">
          Every prayer of the traditional Catholic life, in one place.
        </p>
        <div className="card-grid">
          {NAV.filter((section) => section.id !== 'today').map((section) => (
            <Link className="card" key={section.id} href={section.href}>
              <p className="card__title">{section.label}</p>
              <p className="card__desc">
                <InlineText text={section.description} />
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
