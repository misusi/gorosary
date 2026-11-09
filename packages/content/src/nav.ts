/**
 * The site's navigation tree.
 *
 * Level 1 = sections, Level 2 = documents, Level 3 = in-document anchors
 * (rendered from `body` headings by the app, not listed here).
 *
 * Every `docId` here must resolve to a document in `content/`, and every
 * document in `content/` must appear here exactly once. The build script
 * enforces both directions, so content can never silently fall off the menu.
 */

export interface NavDoc {
  label: string;
  href: string;
  /** Absent for generated pages such as the landing "Today's Rosary". */
  docId?: string;
  description?: string;
}

export interface NavSection {
  id: string;
  label: string;
  href: string;
  /** Short line shown on the section landing page. */
  description: string;
  docs: NavDoc[];
}

export const NAV: NavSection[] = [
  {
    id: 'today',
    label: 'Today',
    href: '/',
    description: "Today's rosary, the saint of the day, and the current liturgical season.",
    docs: [
      {
        label: "Today's Rosary",
        href: '/',
        description: 'The mystery set prayed today, with all five decades.',
      },
      {
        label: "Today's Readings",
        href: '/readings',
        description:
          'The readings of the day from the Roman Lectionary: the First Reading, the Psalm, the Second Reading, and the Gospel.',
      },
      {
        label: 'Saint of the Day',
        href: '/calendar/saint-of-the-day',
        docId: 'saint-of-the-day',
        description: 'The saints commemorated in the liturgical calendar.',
      },
      {
        label: 'How the Mysteries Change',
        href: '/calendar/how-the-mysteries-change',
        docId: 'how-the-mysteries-change',
        description: 'The rules behind today\'s mystery, season by season.',
      },
    ],
  },
  {
    id: 'rosary',
    label: 'The Rosary',
    href: '/rosary',
    description: 'The five decades, the four mystery sets, and how to pray them.',
    docs: [
      {
        label: 'Overview',
        href: '/rosary',
        docId: 'rosary',
        description: 'What the Rosary is and how it is prayed.',
      },
      {
        label: 'Joyful Mysteries',
        href: '/rosary/joyful',
        docId: 'joyful-mysteries',
        description: 'Mondays and Saturdays, Advent and Ordinary Time.',
      },
      {
        label: 'Sorrowful Mysteries',
        href: '/rosary/sorrowful',
        docId: 'sorrowful-mysteries',
        description: 'Tuesdays and Fridays, and all of Lent.',
      },
      {
        label: 'Glorious Mysteries',
        href: '/rosary/glorious',
        docId: 'glorious-mysteries',
        description: 'Wednesdays and Sundays, and the Easter season.',
      },
      {
        label: 'Luminous Mysteries',
        href: '/rosary/luminous',
        docId: 'luminous-mysteries',
        description: 'Thursdays, and the Angelus at dawn, noon and dusk.',
      },
      {
        label: 'How to Pray the Rosary',
        href: '/rosary/how-to-pray',
        docId: 'how-to-pray-the-rosary',
        description: 'Step by step, from the Sign of the Cross to the final prayer.',
      },
      {
        label: 'Rosary with Reflections',
        href: '/rosary/with-reflections',
        docId: 'rosary-with-reflections',
        description: 'A short reflection for each of the twenty mysteries.',
      },
    ],
  },
  {
    id: 'novenas',
    label: 'Novenas',
    href: '/novenas',
    description: 'Nine days of prayer to a particular saint or mystery.',
    docs: [
      {
        label: 'Novena to St. Jude',
        href: '/novenas/st-jude',
        docId: 'st-jude-novena',
        description: 'For desperate and difficult cases.',
      },
      {
        label: 'Novena to St. Joseph',
        href: '/novenas/st-joseph',
        docId: 'st-joseph-novena',
        description: 'For workers, families, and those who provide.',
      },
      {
        label: 'Novena to St. Patrick',
        href: '/novenas/st-patrick',
        docId: 'st-patrick-novena',
        description: 'For the conversion of Ireland and the removal of scourge.',
      },
      {
        label: 'Novena to St. Francis of Assisi',
        href: '/novenas/st-francis',
        docId: 'st-francis-novena',
        description: 'For peace and the healing of divisions.',
      },
      {
        label: 'Novena to St. Anthony of Padua',
        href: '/novenas/st-anthony',
        docId: 'st-anthony-novena',
        description: 'For the return of what is lost.',
      },
      {
        label: 'Novena to St. Michael',
        href: '/novenas/st-michael',
        docId: 'st-michael-novena',
        description: 'For protection and for victory over evil.',
      },
      {
        label: 'Novena to the Sacred Heart of Jesus',
        href: '/novenas/sacred-heart',
        docId: 'sacred-heart-novena',
        description: 'For the love of God and the family of the Heart of Jesus.',
      },
      {
        label: 'Novena to the Holy Spirit',
        href: '/novenas/holy-spirit',
        docId: 'holy-spirit-novena',
        description: 'For the gifts and fruits of the Holy Spirit.',
      },
      {
        label: 'Novena to Our Lady of the Rosary',
        href: '/novenas/our-lady-of-the-rosary',
        docId: 'our-lady-of-the-rosary-novena',
        description: 'For grace, family, and the triumph of the Rosary.',
      },
      {
        label: 'Novena to Our Lady of the Snows',
        href: '/novenas/our-lady-of-snows',
        docId: 'our-lady-of-snows-novena',
        description: 'For protection in times of trouble.',
      },
      {
        label: 'Novena to Our Lady of Perpetual Help',
        href: '/novenas/our-lady-of-perpetual-help',
        docId: 'our-lady-of-perpetual-help-novena',
        description: 'For mothers and for those in need of help.',
      },
      {
        label: 'Novena to Our Lady, Undoer of Knots',
        href: '/novenas/our-lady-undoer-of-knots',
        docId: 'our-lady-undoer-of-knots-novena',
        description: 'For the loosening of knots, and the grace of her intercession.',
      },
      {
        label: 'How to Make a Novena',
        href: '/novenas/how-to-make-a-novena',
        docId: 'how-to-make-a-novena',
        description: 'The rules of a nine-day novena, and a blank form.',
      },
    ],
  },
  {
    id: 'daily',
    label: 'Daily Prayers',
    href: '/daily',
    description: 'The prayers of the day, from morning to night.',
    docs: [
      {
        label: 'Morning Prayer',
        href: '/daily/morning',
        docId: 'morning-prayer',
        description: 'To begin the day.',
      },
      {
        label: 'Evening Prayer',
        href: '/daily/evening',
        docId: 'evening-prayer',
        description: 'To close the day and review it.',
      },
      {
        label: 'The Angelus',
        href: '/daily/angelus',
        docId: 'angelus',
        description: 'A short prayer with a bell, three times a day.',
      },
      {
        label: 'The Regina Coeli',
        href: '/daily/regina-coeli',
        docId: 'regina-coeli',
        description: 'The Easter Marian prayer, said in place of the Angelus.',
      },
      {
        label: 'Act of Contrition',
        href: '/daily/act-of-contrition',
        docId: 'act-of-contrition',
        description: 'For sorrow for sin.',
      },
      {
        label: 'Act of Faith',
        href: '/daily/act-of-faith',
        docId: 'act-of-faith',
        description: 'For the gift of faith.',
      },
      {
        label: 'Prayer for the Grace of the Holy Spirit',
        href: '/daily/prayer-for-the-holy-spirit',
        docId: 'prayer-for-the-grace-of-the-holy-spirit',
        description: 'To be recited before every task.',
      },
      {
        label: 'The Sign of the Cross',
        href: '/daily/sign-of-the-cross',
        docId: 'sign-of-the-cross',
        description: 'How and when to make it.',
      },
      {
        label: "The Apostles' Creed",
        href: '/daily/apostles-creed',
        docId: 'apostles-creed',
        description: 'The profession of faith of the Church.',
      },
      {
        label: 'Our Father',
        href: '/daily/our-father',
        docId: 'our-father',
        description: 'The Lord\'s Prayer, with its Liturgical Commentary.',
      },
      {
        label: 'Hail Mary',
        href: '/daily/hail-mary',
        docId: 'hail-mary',
        description: 'The Ave Maria, with its Liturgical Commentary.',
      },
      {
        label: 'Glory Be',
        href: '/daily/glory-be',
        docId: 'glory-be',
        description: 'The Doxology that closes every decade.',
      },
    ],
  },
  {
    id: 'mercy',
    label: 'Divine Mercy',
    href: '/mercy',
    description: 'The Chaplet of Divine Mercy and its nine-day prayer.',
    docs: [
      {
        label: 'The Chaplet of Divine Mercy',
        href: '/mercy/chaplet',
        docId: 'chaplet-of-divine-mercy',
        description: 'The mercy rosary, and how it is prayed.',
      },
      {
        label: 'The Prayer of the Day',
        href: '/mercy/prayer-of-the-day',
        docId: 'prayer-of-the-day',
        description: 'Nine days of the Prayer to the Merciful Christ.',
      },
    ],
  },
  {
    id: 'litanies',
    label: 'Litanies & Stations',
    href: '/litanies',
    description: 'Litanies to pray and the Way of the Cross.',
    docs: [
      {
        label: 'Litany of Loreto',
        href: '/litanies/loreto',
        docId: 'litany-of-loreto',
        description: 'The litany of the Blessed Virgin Mary.',
      },
      {
        label: 'Litany of the Saints',
        href: '/litanies/saints',
        docId: 'litany-of-the-saints',
        description: 'The General Litany of the Saints.',
      },
      {
        label: 'Stations of the Cross',
        href: '/litanies/stations',
        docId: 'stations-of-the-cross',
        description: 'Fourteen stations, with meditations and prayers.',
      },
    ],
  },
  {
    id: 'calendar',
    label: 'Calendar',
    href: '/calendar',
    description: 'The liturgical year, the saints, and the feasts.',
    docs: [
      {
        label: 'Feasts and Fasts',
        href: '/calendar/feasts-and-fasts',
        docId: 'feasts-and-fasts',
        description: 'The solemnities, feasts, and fasts of the Church\'s year.',
      },
      {
        label: 'Saints of the Year',
        href: '/calendar/saints',
        docId: 'saints-of-the-year',
        description: 'The fixed-date commemorations of the Church calendar.',
      },
    ],
  },
];

export function findNavDoc(docId: string): NavDoc | undefined {
  for (const section of NAV) {
    for (const doc of section.docs) {
      if (doc.docId === docId) return doc;
    }
  }
  return undefined;
}

export function navForSection(sectionId: string): NavSection | undefined {
  return NAV.find((section) => section.id === sectionId);
}
