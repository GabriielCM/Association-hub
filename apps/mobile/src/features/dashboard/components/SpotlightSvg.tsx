import Animated, { useAnimatedProps, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface SpotlightSvgProps {
  cutoutX: SharedValue<number>;
  cutoutY: SharedValue<number>;
  cutoutWidth: SharedValue<number>;
  cutoutHeight: SharedValue<number>;
  overlayOpacity: SharedValue<number>;
  backdropColor: string;
  screenWidth: number;
  screenHeight: number;
  borderRadius?: number;
  padding?: number;
}

export function SpotlightSvg({
  cutoutX,
  cutoutY,
  cutoutWidth,
  cutoutHeight,
  overlayOpacity,
  backdropColor,
  screenWidth,
  screenHeight,
  borderRadius = 12,
  padding = 8,
}: SpotlightSvgProps) {
  const cutoutAnimatedProps = useAnimatedProps(() => ({
    x: cutoutX.value - padding,
    y: cutoutY.value - padding,
    width: cutoutWidth.value + padding * 2,
    height: cutoutHeight.value + padding * 2,
    rx: borderRadius,
    ry: borderRadius,
  }));

  const backdropAnimatedProps = useAnimatedProps(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Svg
      width={screenWidth}
      height={screenHeight}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Defs>
        <Mask id="spotlight-mask">
          <Rect x={0} y={0} width={screenWidth} height={screenHeight} fill="white" />
          <AnimatedRect fill="black" animatedProps={cutoutAnimatedProps} />
        </Mask>
      </Defs>

      <AnimatedRect
        x={0}
        y={0}
        width={screenWidth}
        height={screenHeight}
        fill={backdropColor}
        mask="url(#spotlight-mask)"
        animatedProps={backdropAnimatedProps}
      />
    </Svg>
  );
}
