import { Text, View } from 'react-native';
import type { Commemoration, DayDescription } from '@gorosary/content';
import { useTheme } from './theme';

const COLOUR_NOTES: Record<DayDescription['colour'], string> = {
  white: 'The colour of joy — Christ, the saints, and the Blessed Virgin.',
  violet: 'The colour of preparation and penance.',
  red: 'The colour of the Spirit, of the Passion, and of martyrs.',
  green: 'The colour of Ordinary Time — growth, hope, and the kingdom.',
  black: 'The colour of mourning, for the dead.',
  rose: 'The colour of the third Sunday of Lent, halfway through the fast.',
};

const SWATCH: Record<DayDescription['colour'], string> = {
  white: '#fbfaf7',
  violet: '#7a5c9e',
  red: '#a8322f',
  green: '#4a7c52',
  black: '#2b2723',
  rose: '#c98d9e',
};

export function TodayCalendar({
  day,
  commemorations,
}: {
  day: DayDescription;
  commemorations: Commemoration[];
}) {
  const theme = useTheme();

  const kept = commemorations.length > 0;
  const fastsAndVigils = [
    ...day.vigils,
    ...day.fasts.map((fast) => ({
      name: fast.name,
      kind: 'commemoration' as const,
      note: fast.note,
    })),
  ];

  const box = {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 12,
    backgroundColor: theme.surface,
    padding: 16,
    marginBottom: 10,
  };

  const label = {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 1.3,
    color: theme.muted,
    marginBottom: 6,
  };

  const title = { fontSize: 18, fontWeight: '600' as const, color: theme.ink };

  return (
    <View style={{ marginTop: 26 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: '600',
          color: theme.ink,
          marginBottom: 4,
        }}
      >
        Today in the Church&rsquo;s year
      </Text>
      <Text style={{ color: theme.muted, fontSize: 14, marginBottom: 14 }}>
        Where the calendar of the Church has brought us today.
      </Text>

      <View style={box}>
        <Text style={label}>THE SEASON</Text>
        <Text style={title}>{day.seasonLabel}</Text>
        <Text style={{ color: theme.muted, fontSize: 14, marginTop: 3 }}>
          {day.weekLabel}
        </Text>
      </View>

      <View style={box}>
        <Text style={label}>LITURGICAL COLOUR</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              backgroundColor: SWATCH[day.colour],
              marginRight: 8,
              borderWidth: 1,
              borderColor: theme.line,
            }}
          />
          <Text style={title}>{day.colourLabel}</Text>
        </View>
        <Text style={{ color: theme.muted, fontSize: 14, marginTop: 3 }}>
          {COLOUR_NOTES[day.colour]}
        </Text>
      </View>

      <View style={box}>
        <Text style={label}>KEPT TODAY</Text>
        {kept ? (
          commemorations.map((entry) => (
            <View key={entry.name} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}>
                {entry.name}
              </Text>
              {entry.note ? (
                <Text style={{ color: theme.muted, fontSize: 13.5, marginTop: 3 }}>
                  {entry.note}
                </Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>
            No feast or solemnity falls today. The Church keeps the ordinary
            Sunday and its Gospel.
          </Text>
        )}
      </View>

      <View style={box}>
        <Text style={label}>FAST AND VIGIL</Text>
        {fastsAndVigils.length > 0 ? (
          fastsAndVigils.map((entry) => (
            <View key={entry.name} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.ink }}>
                {entry.name}
              </Text>
              {entry.note ? (
                <Text style={{ color: theme.muted, fontSize: 13.5, marginTop: 3 }}>
                  {entry.note}
                </Text>
              ) : null}
            </View>
          ))
        ) : (
          <Text style={{ color: theme.muted, fontSize: 14, lineHeight: 21 }}>
            Nothing special is kept today. No fast, and no vigil.
          </Text>
        )}
      </View>
    </View>
  );
}
