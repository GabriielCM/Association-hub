import { Pressable, Linking, StyleSheet, View } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import type { SocialLinks } from '@ahub/shared/types';
import { useProfileTheme } from '../hooks/useProfileTheme';

interface SocialLinksRowProps {
  socialLinks: SocialLinks;
}

const SOCIAL_CONFIG = [
  { key: 'instagram' as const, getUrl: (u: string) => `https://instagram.com/${u}` },
  { key: 'facebook' as const, getUrl: (u: string) => `https://facebook.com/${u}` },
  { key: 'x' as const, getUrl: (u: string) => `https://x.com/${u}` },
];

export function SocialLinksRow({ socialLinks }: SocialLinksRowProps) {
  const pt = useProfileTheme();

  const activeLinks = SOCIAL_CONFIG.filter(
    (config) => socialLinks[config.key],
  );

  if (activeLinks.length === 0) return null;

  function renderIcon(key: string) {
    switch (key) {
      case 'instagram':
        return <FontAwesome5 name="instagram" size={16} color="#E4405F" />;
      case 'facebook':
        return <FontAwesome5 name="facebook" size={16} color="#1877F2" />;
      case 'x':
        return pt.isDark ? (
          <View style={styles.xIconDark}>
            <FontAwesome6 name="x-twitter" size={12} color="#FFFFFF" />
          </View>
        ) : (
          <FontAwesome6 name="x-twitter" size={16} color="#000000" />
        );
      default:
        return null;
    }
  }

  return (
    <XStack gap="$3" justifyContent="center" flexWrap="wrap">
      {activeLinks.map((config) => {
        const username = socialLinks[config.key]!;
        return (
          <Pressable
            key={config.key}
            onPress={() => Linking.openURL(config.getUrl(username))}
            style={styles.link}
          >
            {renderIcon(config.key)}
            <Text color="tertiary" size="xs" style={{ color: pt.textTertiary }}>
              @{username}
            </Text>
          </Pressable>
        );
      })}
    </XStack>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xIconDark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
