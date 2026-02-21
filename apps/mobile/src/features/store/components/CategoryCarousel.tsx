import { FlatList, Pressable, StyleSheet, Image } from 'react-native';
import { YStack, View } from 'tamagui';
import { Text, Card, Icon } from '@ahub/ui';
import { Tag } from '@ahub/ui/src/icons';
import { useStoreTheme } from '../hooks/useStoreTheme';
import type { StoreCategory } from '@ahub/shared/types';

interface CategoryCarouselProps {
  categories: StoreCategory[];
  selectedSlug?: string;
  onSelect: (slug: string) => void;
}

export function CategoryCarousel({
  categories,
  selectedSlug,
  onSelect,
}: CategoryCarouselProps) {
  const st = useStoreTheme();

  return (
    <FlatList
      data={categories}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const isSelected = selectedSlug === item.slug;
        return (
          <Pressable onPress={() => onSelect(item.slug)}>
            <Card
              variant={isSelected ? 'elevated' : 'flat'}
              size="sm"
              style={[
                styles.card,
                isSelected && { borderWidth: 1, borderColor: st.categorySelectedBorder },
              ]}
              {...(st.cardBg ? {
                backgroundColor: st.cardBg,
                borderColor: isSelected ? st.categorySelectedBorder : st.cardBorder,
                borderWidth: 1,
                shadowOpacity: 0,
              } : {})}
            >
              <YStack alignItems="center" gap="$1">
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: st.placeholderBg }]}>
                    <Icon icon={Tag} size="lg" color="muted" />
                  </View>
                )}
                <Text
                  size="xs"
                  weight={isSelected ? 'bold' : 'medium'}
                  numberOfLines={1}
                  style={{ color: isSelected ? st.accent : st.textPrimary }}
                >
                  {item.name}
                </Text>
              </YStack>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    gap: 8,
  },
  card: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
