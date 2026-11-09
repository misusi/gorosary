import type { MysterySetId } from '@gorosary/content';

/**
 * The emblem of each set of mysteries.
 *
 * These are drawn rather than painted, so that they take the colour of the
 * set from the stylesheet and stay legible in light and dark. When there are
 * real pictures for the sets, this component is the one thing that changes:
 * the alt text and the place on the page stay the same.
 *
 * The mobile app draws its own; the two renderers cannot share a picture.
 */

const ALT: Record<MysterySetId, string> = {
  joyful: 'A radiant eight-pointed star, for the Joyful Mysteries.',
  sorrowful: 'A cross with a sword through it, for the Sorrowful Mysteries.',
  glorious: 'A crown, for the Glorious Mysteries.',
  luminous: 'A chalice with rays, for the Luminous Mysteries.',
};

/** The frame every emblem sits in. */
function Medallion({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="60" cy="60" r="56" strokeWidth="1" opacity="0.26" />
      <circle cx="60" cy="60" r="51" strokeWidth="0.75" opacity="0.14" />
      {children}
    </svg>
  );
}

/** The star of Bethlehem, for the Joyful Mysteries. */
function Joyful() {
  return (
    <Medallion>
      <g strokeWidth="2.6" strokeLinejoin="round">
        <rect x="37" y="37" width="46" height="46" />
        <rect
          x="37"
          y="37"
          width="46"
          height="46"
          transform="rotate(45 60 60)"
        />
      </g>
      <circle cx="60" cy="60" r="3.4" fill="currentColor" stroke="none" />
    </Medallion>
  );
}

/** The cross and the sword of sorrow, for the Sorrowful Mysteries. */
function Sorrowful() {
  return (
    <Medallion>
      <g strokeWidth="2.8" strokeLinecap="round">
        <path d="M60 24V88" />
        <path d="M40 46H80" />
      </g>
      <g strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M33 87L79 41" />
        <path d="M69 33L83 47" />
      </g>
      <circle cx="31" cy="89" r="3" fill="currentColor" stroke="none" />
    </Medallion>
  );
}

/** The crown of the Lord and of his mother, for the Glorious Mysteries. */
function Glorious() {
  return (
    <Medallion>
      <g strokeWidth="2.6" strokeLinejoin="round">
        <path d="M34 76V50L45 63L60 38L75 63L86 50V76Z" />
        <path d="M34 76H86" />
      </g>
      <g fill="currentColor" stroke="none">
        <circle cx="34" cy="46" r="2.6" />
        <circle cx="60" cy="33" r="2.6" />
        <circle cx="86" cy="46" r="2.6" />
        <circle cx="45" cy="82" r="2" />
        <circle cx="60" cy="82" r="2" />
        <circle cx="75" cy="82" r="2" />
      </g>
    </Medallion>
  );
}

/** The chalice of the Eucharist, for the Luminous Mysteries. */
function Luminous() {
  return (
    <Medallion>
      <g strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
        <path d="M40 44H80L74 63Q60 73 46 63Z" />
        <path d="M60 71V85" />
        <path d="M44 88H76" />
      </g>
      <g strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
        <path d="M60 30V16" />
        <path d="M44 32L37 21" />
        <path d="M76 32L83 21" />
      </g>
      <circle cx="60" cy="30" r="8.5" strokeWidth="2.2" />
      <path d="M60 25V35M55.5 30H64.5" strokeWidth="1.8" strokeLinecap="round" />
    </Medallion>
  );
}

export function MysteryArt({ set }: { set: MysterySetId }) {
  return (
    <span className="mystery-art" role="img" aria-label={ALT[set]}>
      {set === 'joyful' ? (
        <Joyful />
      ) : set === 'sorrowful' ? (
        <Sorrowful />
      ) : set === 'glorious' ? (
        <Glorious />
      ) : (
        <Luminous />
      )}
    </span>
  );
}
