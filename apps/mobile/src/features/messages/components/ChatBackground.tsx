import { memo } from 'react';
import { useColorScheme, StyleSheet } from 'react-native';
import { View } from 'react-native';
import Svg, { Circle, Pattern, Defs, Rect } from 'react-native-svg';

/**
 * Subtle geometric pattern background for the chat screen.
 * Renders a repeating dot grid pattern at very low opacity.
 * Complementes the glassmorphism bubble design.
 */
export const ChatBackground = memo(function ChatBackground() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const dotColor = isDark ? 'rgba(139, 92, 246, 0.06)' : 'rgba(139, 92, 246, 0.04)';
  const dotRadius = 1.5;
  const spacing = 24;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="dotPattern"
            x="0"
            y="0"
            width={spacing}
            height={spacing}
            patternUnits="userSpaceOnUse"
          >
            <Circle
              cx={spacing / 2}
              cy={spacing / 2}
              r={dotRadius}
              fill={dotColor}
            />
          </Pattern>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#dotPattern)"
        />
      </Svg>
    </View>
  );
});
