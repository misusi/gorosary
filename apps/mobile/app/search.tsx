import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Link } from 'expo-router';
import { searchDocs } from '@gorosary/content';
import { useTheme } from '../components/theme';

export default function SearchScreen() {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => (query.trim() ? searchDocs(query, 40) : []),
    [query],
  );

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
    >
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="St. Jude, sorrowful, Angelus, litany…"
        placeholderTextColor={theme.muted}
        autoCorrect={false}
        style={{
          borderWidth: 1,
          borderColor: theme.line,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: theme.ink,
          backgroundColor: theme.surface,
          marginBottom: 18,
        }}
      />

      {query.trim() ? (
        <Text style={{ color: theme.muted, fontSize: 13.5, marginBottom: 12 }}>
          {results.length === 0
            ? `Nothing found for “${query.trim()}”.`
            : `${results.length} result${results.length === 1 ? '' : 's'}`}
        </Text>
      ) : null}

      {results.map((doc) => (
        <Link
          key={doc.id}
          href={{ pathname: '/prayer/[id]', params: { id: doc.id } }}
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
            {doc.title}
          </Text>
          {doc.summary ? (
            <Text style={{ fontSize: 13.5, color: theme.muted, marginTop: 3 }}>
              {doc.summary}
            </Text>
          ) : null}
        </Link>
      ))}
    </ScrollView>
  );
}
