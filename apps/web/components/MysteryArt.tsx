import type { MysterySetId } from '@gorosary/content';

/**
 * The picture of a mystery.
 *
 * The paintings come from The Holy Rosary gallery and are credited on the
 * pages that use them; the file names follow the content, so a set id and a
 * mystery number are all that is needed to find one. See
 * `public/images/ATTRIBUTION.md`.
 */

const SET_LABEL: Record<MysterySetId, string> = {
  joyful: 'the Joyful Mysteries',
  sorrowful: 'the Sorrowful Mysteries',
  glorious: 'the Glorious Mysteries',
  luminous: 'the Luminous Mysteries',
};

export function MysteryArt({
  set,
  n,
  title,
}: {
  set: MysterySetId;
  n: number;
  title?: string;
}) {
  return (
    <img
      className="mystery-art"
      src={`/images/mysteries/${set}-${n}.jpg`}
      alt={title ? `${title}, from ${SET_LABEL[set]}` : `A mystery from ${SET_LABEL[set]}`}
      loading="lazy"
      decoding="async"
    />
  );
}
