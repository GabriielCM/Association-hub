import { View, StyleSheet } from 'react-native';
import { YStack } from 'tamagui';
import { Text, Button, Icon } from '@ahub/ui';

import { useCardTheme } from '../hooks/useCardTheme';
import { MagnifyingGlass } from 'phosphor-react-native';
interface BenefitsEmptyStateProps {
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function BenefitsEmptyState({
  onClearFilters,
  hasActiveFilters = false,
}: BenefitsEmptyStateProps) {
  const ct = useCardTheme();

  return (
    <YStack alignItems="center" paddingVertical={48} paddingHorizontal={24} gap={12}>
      <View style={[styles.iconContainer, { backgroundColor: ct.emptyIconBg }]}>
        <Icon icon={MagnifyingGlass} size="xl" color={ct.emptyIconColor} weight="duotone" />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: ct.textPrimary, textAlign: 'center' }}>
        Nenhum parceiro encontrado
      </Text>
      <Text style={{ fontSize: 14, color: ct.textSecondary, textAlign: 'center', lineHeight: 20 }}>
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});
