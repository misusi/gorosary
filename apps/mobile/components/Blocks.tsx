import { Text, View, type TextStyle } from 'react-native';
import { parseInline, type Block } from '@gorosary/content';
import { useTheme } from './theme';

/** Renders inline emphasis as nested <Text>, the React Native way. */
export function InlineText({
  text,
  style,
}: {
  text: string;
  style?: TextStyle;
}) {
  return (
    <Text style={style}>
      {parseInline(text).map((token, index) => {
        if (token.kind === 'bold') {
          return (
            <Text key={index} style={{ fontWeight: '700' }}>
              {token.text}
            </Text>
          );
        }
        if (token.kind === 'italic') {
          return (
            <Text key={index} style={{ fontStyle: 'italic' }}>
              {token.text}
            </Text>
          );
        }
        return <Text key={index}>{token.text}</Text>;
      })}
    </Text>
  );
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  const theme = useTheme();

  return (
    <View>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <Text
                key={index}
                style={{
                  fontSize: 17.5,
                  lineHeight: 29,
                  color: theme.ink,
                  marginBottom: 18,
                }}
              >
                <InlineText text={block.text} />
              </Text>
            );
          case 'quote':
            return (
              <View
                key={index}
                style={{
                  borderLeftWidth: 3,
                  borderLeftColor: theme.gold,
                  backgroundColor: theme.goldSoft,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 18,
                }}
              >
                <Text
                  style={{
                    fontSize: 16.5,
                    lineHeight: 27,
                    fontStyle: 'italic',
                    color: theme.inkSoft,
                  }}
                >
                  <InlineText text={block.text} />
                </Text>
              </View>
            );
          case 'heading':
            return (
              <Text
                key={index}
                style={{
                  fontSize: block.level <= 2 ? 22 : 19,
                  fontWeight: '600',
                  color: theme.ink,
                  marginTop: 26,
                  marginBottom: 8,
                }}
              >
                <InlineText text={block.text} />
              </Text>
            );
          case 'list':
            return (
              <View key={index} style={{ marginBottom: 18 }}>
                {block.items.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    style={{ flexDirection: 'row', marginBottom: 10 }}
                  >
                    <Text
                      style={{
                        color: theme.accent,
                        fontSize: 17,
                        lineHeight: 27,
                        width: 22,
                      }}
                    >
                      {block.ordered ? `${itemIndex + 1}.` : '•'}
                    </Text>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 17.5,
                        lineHeight: 27,
                        color: theme.ink,
                      }}
                    >
                      <InlineText text={item} />
                    </Text>
                  </View>
                ))}
              </View>
            );
          default:
            return null;
        }
      })}
    </View>
  );
}
