import { ScrollView } from 'react-native';
import { YStack, XStack, View } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, Heading, Card, Badge } from '@ahub/ui';
import { formatPoints } from '@ahub/shared/utils';

export default function LojaScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView>
        <YStack padding="$4" gap="$4">
          {/* Header with balance */}
          <XStack justifyContent="space-between" alignItems="center">
            <Heading level={3}>Loja</Heading>
            <Card variant="flat" size="sm">
              <XStack gap="$1" alignItems="center">
                <Text color="secondary" size="sm">
                  Saldo:
                </Text>
                <Text weight="bold" color="accent">
                  {formatPoints(0)}
                </Text>
              </XStack>
            </Card>
          </XStack>

          {/* Categories */}
          <XStack gap="$2">
            <Badge variant="primary">Todos</Badge>
            <Badge variant="ghost">Vestuário</Badge>
            <Badge variant="ghost">Acessórios</Badge>
            <Badge variant="ghost">Serviços</Badge>
          </XStack>

          {/* Products Grid */}
          <XStack flexWrap="wrap" gap="$3">
            <ProductCard
              name="Camiseta A-hub"
              price={5000}
              image="👕"
            />
            <ProductCard
              name="Boné A-hub"
              price={3000}
              image="🧢"
            />
            <ProductCard
              name="Caneca"
              price={2000}
              image="☕"
            />
            <ProductCard
              name="Adesivos"
              price={500}
              image="🏷️"
            />
          </XStack>

          {/* Empty state */}
          <Card variant="flat">
            <YStack
              gap="$3"
              alignItems="center"
              justifyContent="center"
              paddingVertical="$6"
            >
              <Text size="2xl">🛍️</Text>
              <Text weight="semibold">Em breve</Text>
              <Text color="secondary" size="sm" align="center">
                A loja estará disponível em breve com produtos exclusivos
              </Text>
            </YStack>
          </Card>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

function ProductCard({
  name,
  price,
  image,
}: {
  name: string;
  price: number;
  image: string;
}) {
  return (
    <Card variant="elevated" pressable width="47%">
      <YStack gap="$2">
        {/* Product Image */}
        <View
          backgroundColor="$backgroundHover"
          borderRadius="$md"
          height={100}
          alignItems="center"
          justifyContent="center"
        >
          <Text size="2xl">{image}</Text>
        </View>

        {/* Product Info */}
        <Text weight="semibold" numberOfLines={1}>
          {name}
        </Text>
        <Text color="accent" weight="bold">
          {formatPoints(price)} pts
        </Text>
      </YStack>
    </Card>
  );
}
