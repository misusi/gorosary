import { ScrollView, Text, View } from 'react-native';
import {
  CYCLE_GOSPELS,
  CYCLE_TITLES,
  getReadings,
} from '@gorosary/content';
import { useTheme } from '../components/theme';

const READING_ORDER = [
  { key: 'firstReading', label: 'FIRST READING' },
  { key: 'psalm', label: 'RESPONSORIAL PSALM' },
  { key: 'secondReading', label: 'SECOND READING' },
  { key: 'gospel', label: 'GOSPEL' },
] as const;

export default function ReadingsScreen() {
  const theme = useTheme();
  const readings = getReadings(new Date());
  const { position, entry } = readings;

  const dateLabel = position.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 1.6,
          color: theme.accent,
          marginBottom: 10,
        }}
      >
        THE ROMAN LECTIONARY
      </Text>
      <Text
        style={{
          fontSize: 28,
          fontWeight: '600',
          color: theme.ink,
          marginBottom: 6,
        }}
      >
        Today&rsquo;s Readings
      </Text>
      {entry?.celebration ? (
        <Text
          style={{
            fontSize: 16,
            fontStyle: 'italic',
            color: theme.inkSoft,
            marginBottom: 6,
          }}
        >
          {entry.celebration}
        </Text>
      ) : null}
      <Text style={{ fontSize: 13.5, color: theme.muted, marginBottom: 20 }}>
        {dateLabel} · {CYCLE_TITLES[position.cycle]},{' '}
        {CYCLE_GOSPELS[position.cycle]}
      </Text>

      {!readings.hasReadings ? (
        <View
          style={{
            borderLeftWidth: 3,
            borderLeftColor: theme.gold,
            backgroundColor: theme.goldSoft,
            padding: 14,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 14.5, lineHeight: 22, color: theme.inkSoft }}>
            The readings for {readings.year} are not in the app yet.
          </Text>
        </View>
      ) : null}

      {entry
        ? READING_ORDER.map(({ key, label }) => {
            const reading = entry[key];
            if (!reading) return null;
            return (
              <View
                key={key}
                style={{
                  borderWidth: 1,
                  borderColor: theme.line,
                  borderRadius: 12,
                  backgroundColor: theme.surface,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 1.3,
                    color: theme.accent,
                    marginBottom: 8,
                  }}
                >
                  {label}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '600',
                    color: theme.ink,
                    lineHeight: 27,
                  }}
                >
                  {reading.reference}
                </Text>
              </View>
            );
          })
        : null}
    </ScrollView>
  );
}
