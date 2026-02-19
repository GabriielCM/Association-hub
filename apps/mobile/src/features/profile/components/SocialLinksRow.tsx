import { type ReactNode } from 'react';
import { Pressable, Linking, StyleSheet } from 'react-native';
import { XStack } from 'tamagui';
import { Text } from '@ahub/ui';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import type { SocialLinks } from '@ahub/shared/types';

interface SocialLinksRowProps {
  socialLinks: SocialLinks;
}

const SOCIAL_CONFIG: {
  key: keyof SocialLinks;
  icon: ReactNode;
  getUrl: (username: string) => string;
}[] = [
  {
    key: 'instagram',
    icon: <FontAwesome5 name="instagram" size={16} color="#E4405F" />,
    getUrl: (username: string) => `https://instagram.com/${username}`,
  },
  {
    key: 'facebook',
    icon: <FontAwesome5 name="facebook" size={16} color="#1877F2" />,
    getUrl: (username: string) => `https://facebook.com/${username}`,
  },
  {
    key: 'x',
    icon: <FontAwesome6 name="x-twitter" size={16} color="#000000" />,
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
            {config.icon}
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
