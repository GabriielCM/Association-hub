import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@ahub/ui';
import { useToggleFavorite } from '../hooks/useFavorites';

interface FavoriteButtonProps {
  productId: string;
  isFavorited?: boolean;
}

export function FavoriteButton({
  productId,
  isFavorited,
}: FavoriteButtonProps) {
  const toggleFavorite = useToggleFavorite();

  const handlePress = () => {
    toggleFavorite.mutate(productId);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.button}
      hitSlop={8}
      disabled={toggleFavorite.isPending}
    >
      <Text size="base">{isFavorited ? '❤️' : '🤍'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
