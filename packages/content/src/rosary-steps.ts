import type { MysterySet } from './schema.js';

/**
 * The Rosary, step by step.
 *
 * The prayers of the Rosary are the same every time it is said, so they live
 * here rather than in the content files: there is nothing to vary, and no
 * reason for a content edit to touch them. The order they are said in is the
 * order the Church has set, and this module is the single place that order is
 * written down — the website and the app both read it, so a novena can
 * include the whole Rosary without either of them keeping its own copy.
 */

/**
 * One screen of the read-along: a label, and the prayer to say at it.
 */
export interface RunnerStep {
  label: string;
  text?: string;
  note?: string;
  /** The meditation for the mystery being contemplated. */
  meditation?: string;
  /** The scripture reference, shown alongside the meditation. */
  scripture?: string;
}

export const SIGN_OF_CROSS =
  'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.';

export const APOSTLES_CREED =
  'I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible. I believe in one Lord, Jesus Christ, the only Son of God, who was conceived by the Holy Spirit and was born of the Virgin Mary, who suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell. On the third day He rose again from the dead. He ascended into heaven and is seated at the right hand of God the Father almighty. He will come again in glory to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and the life everlasting. Amen.';

export const OUR_FATHER =
  'Our Father, who art in heaven, hallowed be thy name. Thy kingdom come. Thy will be done on earth, as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive them that trespass against us. And lead us not into temptation, but deliver us from evil. Amen.';

export const HAIL_MARY =
  'Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.';

export const GLORY_BE =
  'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and will be forever. Amen.';

export const OH_MY_JESUS =
  'O Jesus, my Lord, my God, my all, I love Thee with all my heart, with all my soul, with all my mind. I offer Thee all that I am, all that I have, all that I hope to be. And I give Thee all the love of my soul. If I should love Thee less, Jesus, please help me to love Thee more. Amen.';

export const HAIL_HOLY_QUEEN =
  'Hail, Queen of Heaven, all the angels of the Lord, a star has risen out of Jacob. The light of the world, our hope, has dawned. Rejoice, O Virgin Mary, for the Lord has deigned to dwell within you. He who has made you so great and so holy has done great things for you. O merciful, O loving, O gracious Virgin Mary, pray for us, O Queen of the World, now and at the hour of our death. Amen.';

export const FINAL_PRAYER =
  'O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal life, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ Our Lord. Amen.';

/** The three Hail Marys said before the decades, and what they are for. */
export const THREE_HAIL_MARY_INTENTIONS = [
  'for the grace of a pure soul and an open heart',
  'for the grace of a faithful heart that is devoted to Mary',
  'for the grace of a heart that is ready to be used by God',
];

/** The prayers said before the five decades. */
function openingSteps(): RunnerStep[] {
  return [
    { label: 'The Sign of the Cross', text: SIGN_OF_CROSS, note: 'Make the sign as you say it.' },
    { label: "The Apostles' Creed", text: APOSTLES_CREED },
    { label: 'Our Father', text: OUR_FATHER },
  ];
}

/** The three Hail Marys and the Glory Be that follow them. */
function threeHailMarys(): RunnerStep[] {
  return [
    ...THREE_HAIL_MARY_INTENTIONS.map((intention, index) => ({
      label: `Hail Mary ${index + 1} of 3`,
      text: HAIL_MARY,
      note: intention,
    })),
    { label: 'Glory Be', text: GLORY_BE },
  ];
}

/**
 * One decade: the announcement of the mystery, the Our Father, the ten Hail
 * Marys, the Glory Be, and the Oh My Jesus.
 */
function decadeSteps(
  set: MysterySet,
  index: number,
): RunnerStep[] {
  const mystery = set.mysteries[index]!;
  const decade = index + 1;
  const steps: RunnerStep[] = [];

  // The mystery is announced before the decade is said, so that it is
  // meditated on rather than recited.
  steps.push({
    label: `The ${ordinal(decade)} Mystery — ${mystery.title}`,
    note: mystery.intention,
    scripture: mystery.scripture,
  });

  steps.push({ label: `Decade ${decade} — Our Father`, text: OUR_FATHER });

  for (let bead = 1; bead <= 10; bead += 1) {
    const isLast = bead === 10;
    steps.push({
      label: isLast
        ? `Decade ${decade} — Hail Mary 10 of 10, for the mystery`
        : `Decade ${decade} — Hail Mary ${bead} of 10`,
      text: HAIL_MARY,
      ...(isLast
        ? {
            meditation: mystery.meditation,
            scripture: mystery.scripture,
            note: mystery.intention,
          }
        : {}),
    });
  }

  steps.push({ label: `Decade ${decade} — Glory Be`, text: GLORY_BE });
  steps.push({ label: `Decade ${decade} — Oh My Jesus`, text: OH_MY_JESUS });

  return steps;
}

const ORDINALS = [
  'First', 'Second', 'Third', 'Fourth', 'Fifth',
];

function ordinal(n: number): string {
  return ORDINALS[n - 1] ?? `${n}th`;
}

/**
 * The whole Rosary, as a sequence of screens.
 *
 * It begins with the Sign of the Cross, the Apostles' Creed, the Our Father,
 * the three Hail Marys and the Glory Be; goes through the five decades, each
 * with its mystery announced before it; and ends with the Hail, Holy Queen,
 * the final Hail Mary and Glory Be, the closing prayer, and the Sign of the
 * Cross.
 */
export function buildRosarySteps(set: MysterySet): RunnerStep[] {
  const steps: RunnerStep[] = [
    ...openingSteps(),
    ...threeHailMarys(),
  ];

  set.mysteries.forEach((_, index) => {
    steps.push(...decadeSteps(set, index));
  });

  steps.push({ label: 'Hail, Holy Queen', text: HAIL_HOLY_QUEEN });
  steps.push({ label: 'Final Hail Mary', text: HAIL_MARY });
  steps.push({ label: 'Glory Be', text: GLORY_BE });
  steps.push({
    label: 'A Prayer to Close',
    text: FINAL_PRAYER,
  });
  steps.push({
    label: 'The Sign of the Cross',
    text: SIGN_OF_CROSS,
    note: 'Make the sign as you say it.',
  });

  return steps;
}

/**
 * One day of a novena: the prayer of the day, and then the whole Rosary.
 *
 * A novena is not said without the Rosary, so the Rosary is here in full —
 * the Creed, the three Hail Marys, every decade with its mystery announced,
 * the Hail, Holy Queen, the closing prayer and the final Sign of the Cross.
 * The prayer of the day comes where the old books put it: after the first
 * Sign of the Cross, and before the Rosary proper.
 */
export function buildNovenaSteps(day: {
  day: number;
  title?: string;
  text: string;
}): RunnerStep[] {
  const prayer = day.title
    ? `Day ${day.day} — ${day.title}`
    : `Day ${day.day} — The prayer of the day`;

  return [
    {
      label: 'The Sign of the Cross',
      text: SIGN_OF_CROSS,
      note: 'Make the sign as you say it.',
    },
    { label: prayer, text: day.text },
    { label: "The Apostles' Creed", text: APOSTLES_CREED },
    { label: 'Our Father', text: OUR_FATHER },
    ...threeHailMarys(),
    ...buildRosaryDecades(),
    { label: 'Hail, Holy Queen', text: HAIL_HOLY_QUEEN },
    { label: 'Final Hail Mary', text: HAIL_MARY },
    { label: 'Glory Be', text: GLORY_BE },
    { label: 'A Prayer to Close', text: FINAL_PRAYER },
    {
      label: 'The Sign of the Cross',
      text: SIGN_OF_CROSS,
      note: 'Make the sign as you say it.',
    },
  ];
}

/**
 * The five decades, without a set of mysteries attached.
 *
 * A novena may be made on any mystery, so its decades carry no announcement
 * and no meditation; the prayers are the same whatever is being meditated on.
 */
function buildRosaryDecades(): RunnerStep[] {
  const steps: RunnerStep[] = [];

  for (let decade = 1; decade <= 5; decade += 1) {
    steps.push({ label: `Decade ${decade} — Our Father`, text: OUR_FATHER });
    for (let bead = 1; bead <= 10; bead += 1) {
      steps.push({
        label: `Decade ${decade} — Hail Mary ${bead} of 10`,
        text: HAIL_MARY,
      });
    }
    steps.push({ label: `Decade ${decade} — Glory Be`, text: GLORY_BE });
    steps.push({ label: `Decade ${decade} — Oh My Jesus`, text: OH_MY_JESUS });
  }

  return steps;
}

/** The Chaplet of Divine Mercy, one screen for each of its five chapters. */
export function buildChapletSteps(
  chapters: { n: number; title: string; text: string; optional?: string }[],
): RunnerStep[] {
  return chapters.map((chapter) => ({
    label: chapter.title,
    text: chapter.text,
    ...(chapter.optional
      ? { meditation: chapter.optional, note: 'Optional prayer' }
      : {}),
  }));
}
