/**
 * The core prayers of the Rosary.
 *
 * These now live in `@gorosary/content`, with the order they are said in, so
 * that the website and the app read the same list and a novena can include
 * the whole Rosary without either of them keeping its own copy. This file is
 * kept only so that the imports elsewhere in the app do not have to change.
 */
export {
  APOSTLES_CREED,
  FINAL_PRAYER,
  GLORY_BE,
  HAIL_HOLY_QUEEN,
  HAIL_MARY,
  OH_MY_JESUS,
  OUR_FATHER,
  SIGN_OF_CROSS,
  THREE_HAIL_MARY_INTENTIONS,
} from '@gorosary/content';
