import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Pattern, Rect, Path } from 'react-native-svg';

interface CardPatternProps {
  width: number;
  height: number;
  opacity?: number;
}

/**
 * Subtle geometric diamond pattern overlay for the card background.
 * Renders at low opacity (~7%) for a refined, premium texture.
 */
export function CardPattern({ width, height, opacity = 0.07 }: CardPatternProps) {
  return (
    <View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <Pattern
            id="cardGeoPattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M20 0 L40 20 L20 40 L0 20 Z"
              fill="none"
              stroke="#fff"
              strokeWidth="0.5"
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#cardGeoPattern)" />
      </Svg>
    </View>
  );
}
