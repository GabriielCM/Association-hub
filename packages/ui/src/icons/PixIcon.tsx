import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface PixIconProps {
  size?: number;
  color?: string;
}

/**
 * Official PIX logo as SVG.
 * Accepts size + color props to match Phosphor icon interface.
 */
export function PixIcon({ size = 20, color = '#32BCAD' }: PixIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path
        d="M395.3 315.5c-13.5 0-26.2-5.3-35.8-14.8l-85.7-85.7c-5.1-5.1-14-5.1-19.2 0l-85.7 85.7c-9.5 9.5-22.3 14.8-35.8 14.8h-17.7l108.4 108.4c26.2 26.2 68.6 26.2 94.8 0l108.4-108.4h-31.7z"
        fill={color}
      />
      <Path
        d="M133.1 196.5c13.5 0 26.2 5.3 35.8 14.8l85.7 85.7c5.3 5.3 13.9 5.3 19.2 0l85.7-85.7c9.5-9.5 22.3-14.8 35.8-14.8h31.7L318.6 88.1c-26.2-26.2-68.6-26.2-94.8 0L115.4 196.5h17.7z"
        fill={color}
      />
      <Path
        d="M88.1 318.6l38.7 38.7c2.8-1.2 5.8-1.8 8.8-1.8 17.8 0 34.5-6.9 47.1-19.5l85.7-85.7c2.7-2.7 6.2-4 9.6-4 3.5 0 6.9 1.3 9.6 4l85.7 85.7c12.6 12.6 29.3 19.5 47.1 19.5 3 0 6 .6 8.8 1.8l38.7-38.7c26.2-26.2 26.2-68.6 0-94.8l-38.7-38.7c-2.8 1.2-5.8 1.8-8.8 1.8-17.8 0-34.5 6.9-47.1 19.5l-85.7 85.7c-5.3 5.3-13.9 5.3-19.2 0l-85.7-85.7c-12.6-12.6-29.3-19.5-47.1-19.5-3 0-6-.6-8.8-1.8l-38.7 38.7c-26.2 26.2-26.2 68.7 0 94.8z"
        fill={color}
      />
    </Svg>
  );
}
