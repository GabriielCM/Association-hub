import { FlatList, Pressable, StyleSheet, Image } from 'react-native';
import { YStack, View } from 'tamagui';
import { Text, Card, Icon } from '@ahub/ui';
import { Tag } from '@ahub/ui/src/icons';
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
  return (
    <FlatList
      data={categories}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable onPress={() => onSelect(item.slug)}>
          <Card
            variant={selectedSlug === item.slug ? 'elevated' : 'flat'}
            size="sm"
            style={[
              styles.card,
              selectedSlug === item.slug && styles.cardSelected,
            ]}
          >
            <YStack alignItems="center" gap="$1">
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon icon={Tag} size="lg" color="muted" />
                </View>
              )}
              <Text
                size="xs"
                weight={selectedSlug === item.slug ? 'bold' : 'medium'}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </YStack>
          </Card>
        </Pressable>
      )}
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
  cardSelected: {
    borderWidth: 1,
    borderColor: '#7C3AED',
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
