import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { findNavDoc, getDoc } from '@gorosary/content';
import { PrayerView } from '../../components/PrayerView';
import { useTheme } from '../../components/theme';

export default function PrayerScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const doc = id ? getDoc(id) : undefined;

  if (!doc) {
    return (
      <View style={{ flex: 1, padding: 20, backgroundColor: theme.bg }}>
        <Text style={{ color: theme.ink }}>That prayer is not here.</Text>
      </View>
    );
  }

  const nav = findNavDoc(doc.id);

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 56 }}
    >
      {nav ? (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1.6,
            color: theme.accent,
            marginBottom: 10,
          }}
        >
          {nav.label.toUpperCase()}
        </Text>
      ) : null}

      <Text
        style={{
          fontSize: 28,
          lineHeight: 34,
          fontWeight: '600',
          color: theme.ink,
          marginBottom: 6,
        }}
      >
        {doc.title}
      </Text>
      {doc.subtitle ? (
        <Text
          style={{
            fontSize: 16,
            lineHeight: 24,
            fontStyle: 'italic',
            color: theme.inkSoft,
            marginBottom: 20,
          }}
        >
          {doc.subtitle}
        </Text>
      ) : null}

      <PrayerView doc={doc} />
    </ScrollView>
  );
}
