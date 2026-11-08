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
  const { position } = readings;
  const entry = readings.entry;

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
        {readings.isOwnDay ? "Today's Readings" : "This Week's Readings"}
      </Text>
      <Text
        style={{
          fontSize: 16,
          fontStyle: 'italic',
          color: theme.inkSoft,
          marginBottom: 6,
        }}
      >
        {position.label}
      </Text>
      <Text style={{ fontSize: 13.5, color: theme.muted, marginBottom: 20 }}>
        {dateLabel} · {CYCLE_TITLES[position.cycle]},{' '}
        {CYCLE_GOSPELS[position.cycle]}
      </Text>

      {!readings.isOwnDay && readings.hasReadings ? (
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
            The individual readings for each day of this week are not yet in
            the app. These are the readings of the week, which is what they are
            about.
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
                {reading.title ? (
                  <Text
                    style={{
                      fontSize: 15.5,
                      fontStyle: 'italic',
                      color: theme.inkSoft,
                      marginTop: 6,
                    }}
                  >
                    {reading.title}
                  </Text>
                ) : null}
                {reading.summary ? (
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 26,
                      color: theme.inkSoft,
                      marginTop: 12,
                    }}
                  >
                    {reading.summary}
                  </Text>
                ) : null}
              </View>
            );
          })
        : null}
    </ScrollView>
  );
}
