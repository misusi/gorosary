import type { Doc } from '@gorosary/content';
import { Blocks, InlineText } from './Blocks';
import { ImageCredit } from './ImageCredit';
import { MysteryArt } from './MysteryArt';
import { StepRunner } from './StepRunner';
import { NovenaTracker } from './NovenaTracker';
import { buildChapletSteps, buildNovenaSteps, buildRosarySteps } from '@/lib/rosary-steps';

/** Splits "Holy Mary, Mother of God, pray for us." into invocation + response. */
function splitInvocation(line: string): { invocation: string; response: string } {
  const marker = 'pray for us.';
  const index = line.toLowerCase().lastIndexOf(marker);
  if (index === -1) return { invocation: line, response: '' };
  const invocation = line.slice(0, index).replace(/[,;]\s*$/, '');
  const response = line.slice(index);
  return { invocation, response };
}

export function DocumentView({ doc }: { doc: Doc }) {
  switch (doc.kind) {
    case 'rosary':
      return (
        <>
          {doc.sets.map((set) => (
            <section key={set.id}>
              <h2 className="section-title">{set.title}</h2>
              {set.theme ? <p className="section-lede">{set.theme}</p> : null}

              <div style={{ margin: '26px 0' }}>
                <StepRunner steps={buildRosarySteps(set)} startLabel={set.title} />
              </div>

              <div className="stack">
                {set.mysteries.map((mystery) => (
                  <article className="mystery" key={mystery.n}>
                    <div className="mystery__art">
                      <MysteryArt
                        set={set.id}
                        n={mystery.n}
                        title={mystery.title}
                      />
                    </div>
                    <div className="mystery__head">
                      <span className="mystery__num">
                        Mystery {mystery.n}
                      </span>
                      <h3 className="mystery__title">{mystery.title}</h3>
                    </div>
                    <p className="mystery__scripture">{mystery.scripture}</p>
                    <p className="mystery__text">
                      <InlineText text={mystery.meditation} />
                    </p>
                    {mystery.intention ? (
                      <p className="mystery__intention">{mystery.intention}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
          <ImageCredit href="https://www.theholyrosary.org/rosary_gallery/">
            The Holy Rosary
          </ImageCredit>
          <div style={{ marginTop: 40 }}>
            <Blocks blocks={doc.body} />
          </div>
        </>
      );

    case 'novena':
      return (
        <>
          <Blocks blocks={doc.body} />
          <h2 className="section-title">Instructions</h2>
          <div style={{ marginTop: 18 }}>
            <NovenaTracker
              docId={doc.id}
              days={doc.novena.days.map((day) => ({
                ...day,
                steps: buildNovenaSteps(day),
              }))}
            />
          </div>
        </>
      );

    case 'chaplet':
      return (
        <>
          <div style={{ margin: '26px 0' }}>
            <StepRunner
              steps={buildChapletSteps(doc.chapters)}
              startLabel={doc.title}
            />
          </div>

          <div className="stack">
            {doc.chapters.map((chapter) => (
              <article className="mystery" key={chapter.n}>
                <div className="mystery__head">
                  <span className="mystery__num">{chapter.title}</span>
                </div>
                <p className="mystery__text">
                  <InlineText text={chapter.text} />
                </p>
                {chapter.optional ? (
                  <p className="mystery__intention">
                    <InlineText text={chapter.optional} />
                  </p>
                ) : null}
              </article>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <Blocks blocks={doc.body} />
          </div>
        </>
      );

    case 'litany':
      return (
        <>
          <Blocks blocks={doc.body} />

          <h2 className="section-title">The Litany</h2>
          <div style={{ marginTop: 14 }}>
            {doc.invocations.map((line, index) => {
              const { invocation, response } = splitInvocation(line);
              return (
                <div className="litany__item" key={`${invocation}-${index}`}>
                  <span>
                    <InlineText text={invocation} />
                  </span>
                  {response ? (
                    <span className="litany__response">{response}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      );

    case 'stations':
      return (
        <>
          <Blocks blocks={doc.body} />

          <h2 className="section-title">The Fourteen Stations</h2>
          <div className="stack" style={{ marginTop: 18 }}>
            {doc.stations.map((station) => (
              <article className="mystery" key={station.n}>
                <div className="mystery__art">
                  <img
                    className="mystery-art"
                    src={`/images/stations/station-${station.n}.jpg`}
                    alt={`Station ${station.n}: ${station.title}`}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="mystery__head">
                  <span className="mystery__num">Station {station.n}</span>
                  <h3 className="mystery__title">{station.title}</h3>
                </div>
                <p className="mystery__text">
                  <InlineText text={station.meditation} />
                </p>
                {station.prayer ? (
                  <p className="mystery__intention">
                    <InlineText text={station.prayer} />
                  </p>
                ) : null}
              </article>
            ))}
          </div>
          <ImageCredit href="http://www.catholictradition.org/Children/stations-cross.htm">
            Catholic Tradition
          </ImageCredit>
        </>
      );

    case 'calendar': {
      const byMonth = new Map<number, typeof doc.entries>();
      for (const entry of doc.entries) {
        const list = byMonth.get(entry.month) ?? [];
        list.push(entry);
        byMonth.set(entry.month, list);
      }
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];

      return (
        <>
          <Blocks blocks={doc.body} />

          <h2 className="section-title">Fixed-Date Commemorations</h2>
          {[...byMonth.keys()].sort((a, b) => a - b).map((month) => (
            <div key={month} style={{ marginTop: 26 }}>
              <h3 className="section-title" style={{ fontSize: 21, marginTop: 0 }}>
                {monthNames[month - 1]}
              </h3>
              <div>
                {byMonth.get(month)?.map((entry) => (
                  <div
                    className="litany__item"
                    key={`${entry.month}-${entry.day}-${entry.name}`}
                  >
                    <span className="mystery__num" style={{ minWidth: 46 }}>
                      {`${entry.day}`.padStart(2, '0')}
                    </span>
                    <span style={{ flex: 1 }}>
                      <strong>{entry.name}</strong>
                      {entry.kind ? (
                        <span className="small muted"> · {entry.kind}</span>
                      ) : null}
                      {entry.note ? (
                        <div className="small muted">{entry.note}</div>
                      ) : null}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      );
    }

    case 'prayer':
    default:
      return <Blocks blocks={doc.body} />;
  }
}
