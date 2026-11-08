import type { MysterySet } from '@gorosary/content';
import {
  GLORY_BE,
  HAIL_HOLY_QUEEN,
  HAIL_MARY,
  OUR_FATHER,
  SIGN_OF_CROSS,
  THREE_HAIL_MARY_INTENTIONS,
} from './prayers';

export interface RunnerStep {
  label: string;
  text?: string;
  note?: string;
  /** The meditation for the mystery being contemplated. */
  meditation?: string;
  /** The scripture reference, shown alongside the meditation. */
  scripture?: string;
}

/**
 * Builds the full sequence of the Rosary as a list of steps.
 *
 * The Hail Mary count comes out at fifty-four: three before the decades,
 * fifty in the five decades, and one after the Hail, Holy Queen. The tenth
 * Hail Mary of each decade carries the mystery with it, which is why there is
 * no separate "Hail Mary for the mystery" step.
 */
export function buildRosarySteps(set: MysterySet): RunnerStep[] {
  const steps: RunnerStep[] = [
    { label: 'The Sign of the Cross', text: SIGN_OF_CROSS, note: 'Make the sign as you say it.' },
    { label: 'Our Father', text: OUR_FATHER },
    {
      label: 'Hail Mary',
      text: HAIL_MARY,
      note: 'Three times, for the three theological virtues.',
    },
    { label: 'Glory Be', text: GLORY_BE },
  ];

  set.mysteries.forEach((mystery, index) => {
    const decade = index + 1;
    steps.push({
      label: `Decade ${decade} — Our Father`,
      text: OUR_FATHER,
    });

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
  });

  steps.push({ label: 'Hail, Holy Queen', text: HAIL_HOLY_QUEEN });
  steps.push({ label: 'Final Hail Mary', text: HAIL_MARY });
  steps.push({ label: 'Glory Be', text: GLORY_BE });

  return steps;
}

export function buildChapletSteps(
  chapters: { n: number; title: string; text: string; optional?: string }[],
): RunnerStep[] {
  const steps: RunnerStep[] = [];
  for (const chapter of chapters) {
    steps.push({
      label: chapter.title,
      text: chapter.text,
      ...(chapter.optional ? { meditation: chapter.optional, note: 'Optional prayer' } : {}),
    });
  }
  return steps;
}

export const THREE_HAIL_MARY_INTENTS = THREE_HAIL_MARY_INTENTIONS;
