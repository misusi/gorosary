/**
 * The read-along steps.
 *
 * The steps themselves, and the prayers they say, live in
 * `@gorosary/content` — the Rosary and a novena are the same wherever they
 * are read, and the order of the prayers belongs with the prayers. This file
 * is kept only so that the imports elsewhere in the app do not have to change.
 */
export {
  buildChapletSteps,
  buildNovenaSteps,
  buildRosarySteps,
} from '@gorosary/content';
export type { RunnerStep } from '@gorosary/content';
