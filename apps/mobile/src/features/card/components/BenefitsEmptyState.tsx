import { View, StyleSheet, useColorScheme } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Button, Icon } from '@ahub/ui';
import MagnifyingGlass from 'phosphor-react-native/src/icons/MagnifyingGlass';

interface BenefitsEmptyStateProps {
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function BenefitsEmptyState({
  onClearFilters,
  hasActiveFilters = false,
}: BenefitsEmptyStateProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <YStack alignItems="center" paddingVertical={48} paddingHorizontal={24} gap={12}>
      <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
        <Icon icon={MagnifyingGlass} size="xl" color={isDark ? '#6B7280' : '#D1D5DB'} weight="duotone" />
      </View>
      <Text style={[styles.title, isDark && styles.titleDark]}>Nenhum parceiro encontrado</Text>
      <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
        {hasActiveFilters
          ? 'Tente ajustar seus filtros ou buscar por outro termo.'
          : 'Ainda não há parceiros cadastrados.'}
      </Text>
      {hasActiveFilters && onClearFilters && (
        <Button variant="outline" size="sm" onPress={onClearFilters}>
          Limpar filtros
        </Button>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconContainerDark: {
    backgroundColor: '#1F1F1F',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  titleDark: {
    color: '#E5E7EB',
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleDark: {
    color: '#6B7280',
  },
});
