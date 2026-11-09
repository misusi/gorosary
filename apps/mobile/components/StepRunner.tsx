import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { RunnerStep } from '@gorosary/content';
import { InlineText } from './Blocks';
import { useTheme } from './theme';

/**
 * The read-along, one prayer at a time.
 *
 * The website has the same thing, but the two apps draw with different
 * primitives and cannot share a component. The steps themselves come from
 * `@gorosary/content`, so the prayers and their order are the same on both.
 */
export function StepRunner({
  steps,
  startLabel,
}: {
  steps: RunnerStep[];
  startLabel: string;
}) {
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const step = steps[index];

  if (!step) return null;

  const percent = Math.round(((index + 1) / steps.length) * 100);
  const atStart = index === 0;
  const atEnd = index === steps.length - 1;

  const button = (label: string, onPress: () => void, disabled: boolean) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{
        paddingVertical: 9,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.line,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Text style={{ color: theme.inkSoft, fontSize: 14, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View
      style={{
        marginTop: 16,
        borderWidth: 1,
        borderColor: theme.line,
        borderRadius: 12,
        backgroundColor: theme.surface,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
          backgroundColor: theme.bgAlt,
        }}
      >
        {button('Back', () => setIndex((v) => Math.max(v - 1, 0)), atStart)}
        {button('Next', () => setIndex((v) => Math.min(v + 1, steps.length - 1)), atEnd)}
        {button('Skip to end', () => setIndex(steps.length - 1), false)}

        <Text
          style={{
            marginLeft: 'auto',
            color: theme.muted,
            fontSize: 12.5,
            fontVariant: ['tabular-nums'],
          }}
        >
          {index + 1} / {steps.length}
        </Text>
      </View>

      <View
        style={{
          height: 3,
          backgroundColor: theme.line,
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: 3,
            backgroundColor: theme.accent,
          }}
        />
      </View>

      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1.2,
            color: theme.muted,
            marginBottom: 6,
          }}
        >
          {startLabel.toUpperCase()}
        </Text>
        <Text
          style={{
            fontFamily: undefined,
            fontSize: 20,
            fontWeight: '600',
            color: theme.ink,
            marginBottom: 8,
          }}
        >
          {step.label}
        </Text>

        {step.text ? (
          <Text style={{ fontSize: 16.5, lineHeight: 27, color: theme.ink }}>
            <InlineText text={step.text} />
          </Text>
        ) : null}

        {step.meditation ? (
          <Text
            style={{
              fontSize: 15.5,
              lineHeight: 26,
              fontStyle: 'italic',
              color: theme.inkSoft,
              marginTop: 10,
            }}
          >
            <InlineText text={step.meditation} />
          </Text>
        ) : null}

        {step.scripture ? (
          <Text style={{ fontSize: 13, color: theme.muted, marginTop: 10 }}>
            {step.scripture}
          </Text>
        ) : null}

        {step.note ? (
          <Text
            style={{
              fontSize: 13.5,
              lineHeight: 21,
              color: theme.muted,
              marginTop: 10,
            }}
          >
            <InlineText text={step.note} />
          </Text>
        ) : null}
      </View>
    </View>
  );
}
