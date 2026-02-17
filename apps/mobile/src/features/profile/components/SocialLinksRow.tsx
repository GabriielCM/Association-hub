import { Pressable, Linking, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { InstagramLogo, FacebookLogo, XLogo } from 'phosphor-react-native';
import type { SocialLinks } from '@ahub/shared/types';

interface SocialLinksRowProps {
  socialLinks: SocialLinks;
}

const SOCIAL_CONFIG = [
  {
    key: 'instagram' as const,
    Icon: InstagramLogo,
    getUrl: (username: string) => `https://instagram.com/${username}`,
  },
  {
    key: 'facebook' as const,
    Icon: FacebookLogo,
    getUrl: (username: string) => `https://facebook.com/${username}`,
  },
  {
    key: 'x' as const,
    Icon: XLogo,
    getUrl: (username: string) => `https://x.com/${username}`,
  },
];

export function SocialLinksRow({ socialLinks }: SocialLinksRowProps) {
  const activeLinks = SOCIAL_CONFIG.filter(
    (config) => socialLinks[config.key],
  );

  if (activeLinks.length === 0) return null;

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
            <config.Icon size={18} color="#9CA3AF" weight="regular" />
            <Text color="tertiary" size="xs">
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
});
