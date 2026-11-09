import { Text, View } from 'react-native';
import { buildNovenaSteps, buildRosarySteps, type Doc } from '@gorosary/content';
import { Blocks, InlineText } from './Blocks';
import { NovenaTracker } from './NovenaTracker';
import { StepRunner } from './StepRunner';
import { useTheme } from './theme';

export function PrayerView({ doc }: { doc: Doc }) {
  const theme = useTheme();

  switch (doc.kind) {
    case 'rosary':
      return (
        <View>
          {doc.sets.map((set) => (
            <View key={set.id}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: theme.ink,
                  marginTop: 12,
                  marginBottom: 4,
                }}
              >
                {set.title}
              </Text>
              {set.theme ? (
                <Text
                  style={{ color: theme.muted, fontSize: 14.5, marginBottom: 18 }}
                >
                  {set.theme}
                </Text>
              ) : null}

              <StepRunner
                steps={buildRosarySteps(set)}
                startLabel={set.title}
              />

              {set.mysteries.map((mystery) => (
                <View
                  key={mystery.n}
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
                      fontSize: 11.5,
                      fontWeight: '700',
                      letterSpacing: 1.2,
                      color: theme.accent,
                      marginBottom: 4,
                    }}
                  >
                    MYSTERY {mystery.n}
                  </Text>
                  <Text
                    style={{
                      fontSize: 21,
                      fontWeight: '600',
                      color: theme.ink,
                      marginBottom: 4,
                    }}
                  >
                    {mystery.title}
                  </Text>
                  <Text
                    style={{ color: theme.muted, fontSize: 13.5, marginBottom: 10 }}
                  >
                    {mystery.scripture}
                  </Text>
                  <Text
                    style={{ fontSize: 16.5, lineHeight: 27, color: theme.ink }}
                  >
                    <InlineText text={mystery.meditation} />
                  </Text>
                  {mystery.intention ? (
                    <Text
                      style={{
                        marginTop: 12,
                        padding: 11,
                        borderRadius: 8,
                        backgroundColor: theme.bgAlt,
                        fontStyle: 'italic',
                        fontSize: 15,
                        color: theme.inkSoft,
                      }}
                    >
                      {mystery.intention}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
          <Blocks blocks={doc.body} />
        </View>
      );

    case 'novena':
      return (
        <View>
          <Blocks blocks={doc.body} />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '600',
              color: theme.ink,
              marginTop: 22,
              marginBottom: 12,
            }}
          >
            Instructions
          </Text>
          <NovenaTracker
            docId={doc.id}
            days={doc.novena.days.map((day) => ({
              ...day,
              steps: buildNovenaSteps(day),
            }))}
          />
        </View>
      );

    case 'chaplet':
      return (
        <View>
          {doc.chapters.map((chapter) => (
            <View
              key={chapter.n}
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
                  fontSize: 17,
                  fontWeight: '600',
                  color: theme.ink,
                  marginBottom: 8,
                }}
              >
                {chapter.title}
              </Text>
              <Text style={{ fontSize: 16.5, lineHeight: 27, color: theme.ink }}>
                <InlineText text={chapter.text} />
              </Text>
              {chapter.optional ? (
                <Text
                  style={{
                    marginTop: 12,
                    padding: 11,
                    borderRadius: 8,
                    backgroundColor: theme.bgAlt,
                    fontStyle: 'italic',
                    fontSize: 15,
                    lineHeight: 25,
                    color: theme.inkSoft,
                  }}
                >
                  <InlineText text={chapter.optional} />
                </Text>
              ) : null}
            </View>
          ))}
          <Blocks blocks={doc.body} />
        </View>
      );

    case 'litany':
      return (
        <View>
          <Blocks blocks={doc.body} />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '600',
              color: theme.ink,
              marginTop: 22,
              marginBottom: 6,
            }}
          >
            The Litany
          </Text>
          {doc.invocations.map((line, index) => {
            const marker = 'pray for us.';
            const position = line.toLowerCase().lastIndexOf(marker);
            const invocation =
              position === -1 ? line : line.slice(0, position).replace(/[,;]\s*$/, '');
            const response = position === -1 ? '' : line.slice(position);
            return (
              <View
                key={`${invocation}-${index}`}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.line,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 16.5,
                    lineHeight: 25,
                    color: theme.ink,
                  }}
                >
                  {invocation}
                </Text>
                {response ? (
                  <Text
                    style={{
                      fontSize: 14.5,
                      fontStyle: 'italic',
                      color: theme.muted,
                      marginLeft: 12,
                    }}
                  >
                    {response}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      );

    case 'stations':
      return (
        <View>
          <Blocks blocks={doc.body} />
          <Text
            style={{
              fontSize: 22,
              fontWeight: '600',
              color: theme.ink,
              marginTop: 22,
              marginBottom: 12,
            }}
          >
            The Fourteen Stations
          </Text>
          {doc.stations.map((station) => (
            <View
              key={station.n}
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
                  fontSize: 11.5,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  color: theme.accent,
                  marginBottom: 4,
                }}
              >
                STATION {station.n}
              </Text>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: theme.ink,
                  marginBottom: 8,
                }}
              >
                {station.title}
              </Text>
              <Text style={{ fontSize: 16.5, lineHeight: 27, color: theme.ink }}>
                <InlineText text={station.meditation} />
              </Text>
              {station.prayer ? (
                <Text
                  style={{
                    marginTop: 12,
                    padding: 11,
                    borderRadius: 8,
                    backgroundColor: theme.bgAlt,
                    fontStyle: 'italic',
                    fontSize: 15,
                    lineHeight: 25,
                    color: theme.inkSoft,
                  }}
                >
                  <InlineText text={station.prayer} />
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      );

    case 'calendar': {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const byMonth = new Map<number, typeof doc.entries>();
      for (const entry of doc.entries) {
        const list = byMonth.get(entry.month) ?? [];
        list.push(entry);
        byMonth.set(entry.month, list);
      }

      return (
        <View>
          <Blocks blocks={doc.body} />
          {[...byMonth.keys()].sort((a, b) => a - b).map((month) => (
            <View key={month} style={{ marginTop: 22 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  color: theme.ink,
                  marginBottom: 8,
                }}
              >
                {monthNames[month - 1]}
              </Text>
              {byMonth.get(month)?.map((entry) => (
                <View
                  key={`${entry.month}-${entry.day}-${entry.name}`}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.line,
                  }}
                >
                  <Text style={{ fontSize: 16.5, color: theme.ink }}>
                    <Text style={{ color: theme.accent, fontWeight: '700' }}>
                      {`${entry.day}`.padStart(2, '0')}{' '}
                    </Text>
                    {entry.name}
                  </Text>
                  {entry.note ? (
                    <Text
                      style={{ fontSize: 13.5, color: theme.muted, marginTop: 2 }}
                    >
                      {entry.note}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ))}
        </View>
      );
    }

    case 'prayer':
    default:
      return <Blocks blocks={doc.body} />;
  }
}
