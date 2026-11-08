import { ScrollView, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { NAV } from '@gorosary/content';
import { useTheme } from '../../components/theme';

export default function SectionScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const section = NAV.find((entry) => entry.id === id);

  if (!section) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: theme.bg }}>
        <Text style={{ color: theme.ink }}>That section does not exist.</Text>
      </View>
    );
  }

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
        SECTION
      </Text>
      <Text
        style={{
          fontSize: 30,
          fontWeight: '600',
          color: theme.ink,
          marginBottom: 8,
        }}
      >
        {section.label}
      </Text>
      <Text
        style={{
          fontSize: 15.5,
          lineHeight: 25,
          color: theme.muted,
          marginBottom: 22,
        }}
      >
        {section.description}
      </Text>

      {section.docs
        .filter((doc) => doc.docId)
        .map((doc) => (
          <Link
            key={doc.href}
            href={{ pathname: '/prayer/[id]', params: { id: doc.docId ?? '' } }}
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
            <Text style={{ fontSize: 17, fontWeight: '600', color: theme.ink }}>
              {doc.label}
            </Text>
            {doc.description ? (
              <Text style={{ fontSize: 13.5, color: theme.muted, marginTop: 3 }}>
                {doc.description}
              </Text>
            ) : null}
          </Link>
        ))}
    </ScrollView>
  );
}
