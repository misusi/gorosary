import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InlineText } from './Blocks';
import { useTheme } from './theme';

const storageKey = (docId: string) => `gorosary:novena:${docId}`;

export function NovenaTracker({
  docId,
  days,
}: {
  docId: string;
  days: { day: number; title?: string; text: string }[];
}) {
  const theme = useTheme();
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey(docId));
        if (cancelled) return;
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (Array.isArray(parsed)) {
          setDone(parsed.filter((n): n is number => typeof n === 'number'));
        }
      } catch {
        setDone([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [docId]);

  const toggle = useCallback(
    (day: number) => {
      setDone((current) => {
        const next = current.includes(day)
          ? current.filter((value) => value !== day)
          : [...current, day].sort((a, b) => a - b);
        void AsyncStorage.setItem(storageKey(docId), JSON.stringify(next));
        return next;
      });
    },
    [docId],
  );

  return (
    <View>
      <Text style={{ color: theme.muted, fontSize: 13.5, marginBottom: 14 }}>
        {done.length} of {days.length} days prayed. Saved on this device only.
      </Text>

      {days.map((day) => {
        const isDone = done.includes(day.day);
        return (
          <View
            key={day.day}
            style={{
              flexDirection: 'row',
              gap: 14,
              padding: 18,
              marginBottom: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.line,
              backgroundColor: isDone ? theme.bgAlt : theme.surface,
              opacity: isDone ? 0.62 : 1,
            }}
          >
            <Pressable
              onPress={() => toggle(day.day)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isDone }}
              accessibilityLabel={`Mark day ${day.day} as prayed`}
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                borderWidth: 1.5,
                borderColor: isDone ? theme.accent : theme.lineStrong,
                backgroundColor: isDone ? theme.accent : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 3,
              }}
            >
              <Text
                style={{
                  color: theme.accentInk,
                  fontSize: 14,
                  lineHeight: 16,
                  opacity: isDone ? 1 : 0,
                }}
              >
                ✓
              </Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '700',
                  letterSpacing: 1.2,
                  color: theme.accent,
                  marginBottom: 4,
                }}
              >
                DAY {day.day}
              </Text>
              {day.title ? (
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: theme.ink,
                    marginBottom: 6,
                  }}
                >
                  {day.title}
                </Text>
              ) : null}
              <Text style={{ fontSize: 16.5, lineHeight: 27, color: theme.ink }}>
                <InlineText text={day.text} />
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
