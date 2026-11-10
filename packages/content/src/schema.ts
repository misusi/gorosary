import { z } from 'zod';

/**
 * The canonical content schema for GoRosary.
 *
 * Every prayer, novena, litany, and devotion in `content/**\/*.md` must validate
 * against `docSchema`. The build script fails loudly if anything does not, so a
 * typo in frontmatter can never reach the web or mobile app.
 */

export const sectionSchema = z.enum([
  'rosary',
  'novenas',
  'daily',
  'mercy',
  'litanies',
  'calendar',
  'devotions',
  'readings',
]);
export type SectionId = z.infer<typeof sectionSchema>;

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('paragraph'), text: z.string() }),
  z.object({ type: z.literal('quote'), text: z.string() }),
  z.object({
    type: z.literal('heading'),
    level: z.number().int().min(1).max(4),
    text: z.string(),
  }),
  z.object({
    type: z.literal('list'),
    ordered: z.boolean(),
    items: z.array(z.string()),
  }),
]);
export type Block = z.infer<typeof blockSchema>;

export const mysterySetIdSchema = z.enum([
  'joyful',
  'sorrowful',
  'glorious',
  'luminous',
]);
export type MysterySetId = z.infer<typeof mysterySetIdSchema>;

export const mysterySchema = z.object({
  n: z.number().int().min(1).max(5),
  title: z.string().min(1),
  scripture: z.string().min(1),
  meditation: z.string().min(1),
  intention: z.string().optional(),
});

export const mysterySetSchema = z.object({
  id: mysterySetIdSchema,
  title: z.string().min(1),
  theme: z.string().optional(),
  color: z.string().optional(),
  days: z.array(z.string()).optional(),
  mysteries: z.array(mysterySchema).length(5),
});

export const novenaSchema = z.object({
  patron: z.string().min(1),
  occasion: z.string().optional(),
  duration: z.number().int().min(1).max(30),
  /**
   * When the novena is traditionally begun: `MM-DD` for a fixed day, or the
   * name of a solemnity that moves with Easter.
   */
  begins: z
    .string()
    .regex(/^(\d{2}-\d{2}|pentecost|sacred-heart)$/)
    .optional(),
  days: z.array(
    z.object({
      day: z.number().int().min(1),
      title: z.string().optional(),
      text: z.string().min(1),
    }),
  ).min(1),
});

export const chapterSchema = z.object({
  n: z.number().int().min(1),
  title: z.string().min(1),
  text: z.string().min(1),
  optional: z.string().optional(),
});

export const stationSchema = z.object({
  n: z.number().int().min(1).max(14),
  title: z.string().min(1),
  meditation: z.string().min(1),
  prayer: z.string().optional(),
});

/** A fixed-date commemoration, e.g. `03-19` — St. Joseph. */
export const calendarEntrySchema = z.object({
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  name: z.string().min(1),
  kind: z
    .enum(['solemnity', 'feast', 'memorial', 'optional-memorial', 'commemoration'])
    .optional(),
  note: z.string().optional(),
});

/* --- readings ------------------------------------------------------------ */

/** One Scripture reading of the day. */
export const readingSchema = z.object({
  /** The citation, e.g. "John 3:16-17". */
  reference: z.string().min(1),
  /** A short heading, e.g. "Nicodemus comes to Jesus at night". */
  title: z.string().optional(),
  /** One or two sentences on what the reading is about. */
  summary: z.string().optional(),
});

export type Reading = z.infer<typeof readingSchema>;

/**
 * One day's readings.
 *
 * Keyed by the date, because that is what the lectionary is: the readings
 * for a given day in a given year. The Sunday cycle is a property of the
 * year, not of the day, so two years with the same cycle repeat the same
 * Sundays but not the same weekdays.
 */
export const lectionaryEntrySchema = z.object({
  /** The day, as `YYYY-MM-DD`. */
  date: z.string().min(1),
  /** What the day is kept for, e.g. "SECOND SUNDAY IN ORDINARY TIME". */
  celebration: z.string().optional(),
  colour: z
    .enum(['white', 'violet', 'red', 'green', 'black', 'rose'])
    .optional(),
  firstReading: readingSchema.optional(),
  psalm: readingSchema.optional(),
  secondReading: readingSchema.optional(),
  gospel: readingSchema.optional(),
});

export type LectionaryEntry = z.infer<typeof lectionaryEntrySchema>;

const docBase = {
  id: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id must be kebab-case'),
  section: sectionSchema,
  title: z.string().min(1),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  order: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  edition: z.string().optional(),
  attribution: z.string().optional(),
  body: z.array(blockSchema),
};

export const docSchema = z.discriminatedUnion('kind', [
  z.object({ ...docBase, kind: z.literal('prayer') }),
  z.object({
    ...docBase,
    kind: z.literal('rosary'),
    sets: z.array(mysterySetSchema).min(1),
  }),
  z.object({
    ...docBase,
    kind: z.literal('novena'),
    novena: novenaSchema,
  }),
  z.object({
    ...docBase,
    kind: z.literal('chaplet'),
    chapters: z.array(chapterSchema).min(1),
  }),
  z.object({
    ...docBase,
    kind: z.literal('litany'),
    invocations: z.array(z.string()).min(1),
  }),
  z.object({
    ...docBase,
    kind: z.literal('stations'),
    stations: z.array(stationSchema).min(1),
  }),
  z.object({
    ...docBase,
    kind: z.literal('calendar'),
    entries: z.array(calendarEntrySchema).min(1),
  }),
  z.object({
    ...docBase,
    kind: z.literal('readings'),
    /** The calendar year this document covers. */
    year: z.number().int(),
    entries: z.array(lectionaryEntrySchema).min(1),
  }),
]);

export type Doc = z.infer<typeof docSchema>;
export type DocKind = Doc['kind'];
export type Mystery = z.infer<typeof mysterySchema>;
export type MysterySet = z.infer<typeof mysterySetSchema>;
export type Novena = z.infer<typeof novenaSchema>;
export type Station = z.infer<typeof stationSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type CalendarEntry = z.infer<typeof calendarEntrySchema>;
