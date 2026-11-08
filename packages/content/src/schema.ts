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
]);

export type Doc = z.infer<typeof docSchema>;
export type DocKind = Doc['kind'];
export type Mystery = z.infer<typeof mysterySchema>;
export type MysterySet = z.infer<typeof mysterySetSchema>;
export type Novena = z.infer<typeof novenaSchema>;
export type Station = z.infer<typeof stationSchema>;
export type Chapter = z.infer<typeof chapterSchema>;
export type CalendarEntry = z.infer<typeof calendarEntrySchema>;
