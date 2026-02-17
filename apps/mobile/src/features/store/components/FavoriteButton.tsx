import { Pressable, StyleSheet } from 'react-native';
import { Icon } from '@ahub/ui';
import { Heart } from '@ahub/ui/src/icons';
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
      <Icon icon={Heart} size="md" weight={isFavorited ? 'fill' : 'regular'} color={isFavorited ? 'error' : 'muted'} />
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
