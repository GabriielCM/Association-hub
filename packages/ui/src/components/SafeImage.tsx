import React from 'react';
import { Image as RNImage } from 'react-native';
import type { ImageStyle, StyleProp, ImageResizeMode } from 'react-native';

// Try to load expo-image at module level.
// expo-image calls requireNativeModule('ExpoImage') on import,
// which throws if the native module isn't in the dev client.
let ExpoImage: React.ComponentType<any> | null = null;
try {
  ExpoImage = require('expo-image').Image;
} catch {
  // Native module not available in this build
}

type ContentFit = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export interface SafeImageProps {
  source: { uri: string } | string | number;
  style?: StyleProp<ImageStyle>;
  contentFit?: ContentFit;
  transition?: number;
  placeholder?: { blurhash?: string };
  [key: string]: unknown;
}

const CONTENT_FIT_MAP: Record<ContentFit, ImageResizeMode> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'stretch',
  none: 'center',
  'scale-down': 'contain',
};

export function SafeImage({
  source,
  style,
  contentFit = 'cover',
  transition,
  placeholder,
  ...rest
}: SafeImageProps) {
  if (ExpoImage) {
    return (
      <ExpoImage
        source={source}
        style={style}
        contentFit={contentFit}
        transition={transition}
        placeholder={placeholder}
        {...rest}
      />
    );
  }

  // Fallback: React Native Image
  const rnSource = typeof source === 'string' ? { uri: source } : source;
  const resizeMode = CONTENT_FIT_MAP[contentFit] || 'cover';

  return (
    <RNImage
      source={rnSource as any}
      style={style}
      resizeMode={resizeMode}
      {...rest}
    />
  );
}
