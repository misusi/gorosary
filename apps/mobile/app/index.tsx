import { ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import {
  NAV,
  findMysterySet,
  getTodayRosary,
} from '@gorosary/content';
import { useTheme } from '../components/theme';

export default function TodayScreen() {
  const theme = useTheme();
  const today = getTodayRosary(new Date());
  const setDoc = findMysterySet(today.set);

  const dateLabel = today.date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
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
        {today.seasonLabel.toUpperCase()}
      </Text>
      <Text
        style={{
          fontSize: 13.5,
          color: theme.muted,
          marginBottom: 16,
        }}
      >
        {today.weekday} · {dateLabel}
      </Text>

      <Text
        style={{
          fontSize: 34,
          lineHeight: 40,
          fontWeight: '600',
          color: theme.ink,
          marginBottom: 10,
        }}
      >
        {today.setTitle}
      </Text>
      <Text
        style={{
          fontSize: 16,
          lineHeight: 26,
          fontStyle: 'italic',
          color: theme.inkSoft,
          marginBottom: 8,
        }}
      >
        Today the Church prays the {today.setTitle.toLowerCase()} — {today.reason}.
      </Text>
      <Text style={{ fontSize: 13.5, color: theme.muted, marginBottom: 20 }}>
        By the older weekly cycle, {today.alternative.reason.toLowerCase()}.
      </Text>

      {setDoc ? (
        <Link
          href={{ pathname: '/prayer/[id]', params: { id: setDoc.docId } }}
          style={{
            backgroundColor: theme.accent,
            color: theme.accentInk,
            textAlign: 'center',
            paddingVertical: 14,
            borderRadius: 10,
            fontWeight: '600',
            fontSize: 16,
            overflow: 'hidden',
            marginBottom: 28,
          }}
        >
          Pray the Rosary
        </Link>
      ) : null}

      {today.mysteries.length > 0 ? (
        <>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: theme.ink,
              marginBottom: 12,
            }}
          >
            The five decades
          </Text>
          {today.mysteries.map((mystery) => (
            <View
              key={mystery.n}
              style={{
                borderWidth: 1,
                borderColor: theme.line,
                borderRadius: 12,
                backgroundColor: theme.surface,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 17, fontWeight: '600', color: theme.ink }}>
                {mystery.n}. {mystery.title}
              </Text>
              <Text style={{ fontSize: 13.5, color: theme.muted, marginTop: 3 }}>
                {mystery.scripture}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      {today.commemorations.length > 0 ? (
        <>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: theme.ink,
              marginTop: 24,
              marginBottom: 12,
            }}
          >
            Today in the calendar
          </Text>
          {today.commemorations.map((commemoration) => (
            <View
              key={commemoration.name}
              style={{
                borderWidth: 1,
                borderColor: theme.line,
                borderRadius: 12,
                backgroundColor: theme.surface,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 16.5, fontWeight: '600', color: theme.ink }}>
                {commemoration.name}
              </Text>
              <Text style={{ fontSize: 13.5, color: theme.muted, marginTop: 3 }}>
                {commemoration.kind.replace(/-/g, ' ')}
                {commemoration.note ? ` — ${commemoration.note}` : ''}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      <Text
        style={{
          fontSize: 20,
          fontWeight: '600',
          color: theme.ink,
          marginTop: 28,
          marginBottom: 12,
        }}
      >
        Everything else
      </Text>
      {NAV.filter((section) => section.id !== 'today').map((section) => (
        <Link
          key={section.id}
          href={{ pathname: '/section/[id]', params: { id: section.id } }}
          style={{
            flexDirection: 'column',
            borderWidth: 1,
            borderColor: theme.line,
            borderRadius: 12,
            backgroundColor: theme.surface,
            padding: 16,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: '600',
              color: theme.ink,
            }}
          >
            {section.label}
          </Text>
          <Text style={{ fontSize: 13.5, color: theme.muted, marginTop: 3 }}>
            {section.description}
          </Text>
        </Link>
      ))}

      <Link
        href="/search"
        style={{
          marginTop: 14,
          alignItems: 'center',
          paddingVertical: 12,
        }}
      >
        <Text style={{ color: theme.accent, fontSize: 15, fontWeight: '600' }}>
          Search all prayers
        </Text>
      </Link>
    </ScrollView>
  );
}
