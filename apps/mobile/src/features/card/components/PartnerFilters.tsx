import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { XStack, YStack } from 'tamagui';
import { Text, Icon } from '@ahub/ui';
import { MagnifyingGlass, X, Tag } from '@ahub/ui/src/icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useCardTheme } from '../hooks/useCardTheme';
import type { CardTheme } from '../hooks/useCardTheme';
import type { PartnerCategory } from '@ahub/shared/types';

export type SortMode = 'featured' | 'distance' | 'recent' | 'name';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'featured', label: 'Destaques' },
  { key: 'distance', label: 'Perto' },
  { key: 'recent', label: 'Novos' },
  { key: 'name', label: 'A-Z' },
];

interface PartnerFiltersProps {
  categories: PartnerCategory[];
  selectedCategory?: string | undefined;
  searchQuery: string;
  sortBy: SortMode;
  onCategoryChange: (category?: string) => void;
  onSearchChange: (query: string) => void;
  onSortChange: (sort: SortMode) => void;
  onMapToggle?: () => void;
  isMapMode?: boolean;
}

export function PartnerFilters({
  categories,
  selectedCategory,
  searchQuery,
  sortBy,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onMapToggle,
  isMapMode = false,
}: PartnerFiltersProps) {
  const ct = useCardTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animated search expansion
  const searchWidth = useSharedValue(0);

  const openSearch = useCallback(() => {
    setIsSearchOpen(true);
    searchWidth.value = withTiming(1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [searchWidth]);

  const closeSearch = useCallback(() => {
    searchWidth.value = withTiming(0, {
      duration: 250,
      easing: Easing.in(Easing.cubic),
    });
    onSearchChange('');
    setTimeout(() => setIsSearchOpen(false), 260);
  }, [searchWidth, onSearchChange]);

  const searchAnimStyle = useAnimatedStyle(() => ({
    flex: searchWidth.value,
    opacity: searchWidth.value,
  }));

  return (
    <YStack gap={10}>
      {/* Row 1: Title + Search + Map toggle */}
      <XStack alignItems="center" justifyContent="space-between" height={40}>
        {!isSearchOpen && (
          <Text style={{ fontSize: 22, fontWeight: '700', color: ct.textPrimary }}>
            Benefícios
          </Text>
        )}

        <XStack alignItems="center" gap={8} flex={isSearchOpen ? 1 : undefined}>
          {isSearchOpen && (
            <Animated.View style={[styles.searchContainer, searchAnimStyle]}>
              <View
                style={[
                  styles.searchInputWrap,
                  { backgroundColor: ct.inputBg },
                ]}
              >
                <Icon icon={MagnifyingGlass} size={16} color={ct.inputPlaceholder} />
                <TextInput
                  ref={inputRef}
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  placeholder="Buscar parceiros..."
                  placeholderTextColor={ct.inputPlaceholder}
                  style={[styles.searchInput, { color: ct.inputText }]}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                <Pressable onPress={closeSearch} hitSlop={8}>
                  <Icon icon={X} size={16} color={ct.inputPlaceholder} />
                </Pressable>
              </View>
            </Animated.View>
          )}

          {!isSearchOpen && (
            <Pressable onPress={openSearch} style={styles.iconBtn} hitSlop={8}>
              <Icon icon={MagnifyingGlass} size={20} color={ct.searchIconColor} />
            </Pressable>
          )}

          {onMapToggle && !isSearchOpen && (
            <Pressable onPress={onMapToggle} style={styles.iconBtn} hitSlop={8}>
              <Text style={[styles.mapIcon, isMapMode && styles.mapIconActive]}>
                {isMapMode ? '☰' : '🗺️'}
              </Text>
            </Pressable>
          )}
        </XStack>
      </XStack>

      {/* Row 2: Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        <CategoryChip
          label="Todos"
          isSelected={!selectedCategory}
          onPress={() => onCategoryChange(undefined)}
          ct={ct}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            icon={cat.icon}
            label={cat.name}
            isSelected={selectedCategory === cat.slug}
            onPress={() => onCategoryChange(cat.slug)}
            ct={ct}
          />
        ))}
      </ScrollView>

      {/* Row 3: Segmented Control */}
      <SegmentedControl
        options={SORT_OPTIONS}
        selected={sortBy}
        onSelect={onSortChange}
        ct={ct}
      />
    </YStack>
  );
}

// ─── Category Chip ───────────────────────────────────────────────

function CategoryChip({
  icon,
  label,
  isSelected,
  onPress,
  ct,
}: {
  icon?: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  ct: CardTheme;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        { backgroundColor: isSelected ? ct.chipActiveBg : ct.chipBg },
      ]}
    >
      {icon ? (
        <Text style={styles.chipIcon}>{icon}</Text>
      ) : (
        <Icon icon={Tag} size={14} color={isSelected ? ct.chipActiveIcon : ct.chipIcon} />
      )}
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: isSelected ? ct.chipActiveText : ct.chipText,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Segmented Control ───────────────────────────────────────────

function SegmentedControl({
  options,
  selected,
  onSelect,
  ct,
}: {
  options: { key: SortMode; label: string }[];
  selected: SortMode;
  onSelect: (key: SortMode) => void;
  ct: CardTheme;
}) {
  const selectedIndex = options.findIndex((o) => o.key === selected);
  const pillPosition = useSharedValue(selectedIndex);

  useEffect(() => {
    pillPosition.value = withTiming(selectedIndex, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [selectedIndex, pillPosition]);

  const pillStyle = useAnimatedStyle(() => ({
    left: `${(pillPosition.value / options.length) * 100}%` as unknown as number,
    width: `${100 / options.length}%` as unknown as number,
  }));

  return (
    <View style={[styles.segmentContainer, { backgroundColor: ct.segmentBg }]}>
      <Animated.View
        style={[
          styles.segmentPill,
          { backgroundColor: ct.segmentPillBg },
          pillStyle,
        ]}
      />
      {options.map((opt) => (
        <Pressable
          key={opt.key}
          style={styles.segmentOption}
          onPress={() => onSelect(opt.key)}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: selected === opt.key ? ct.segmentActiveText : ct.segmentText,
            }}
          >
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Search
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  mapIcon: {
    fontSize: 18,
  },
  mapIconActive: {
    opacity: 0.6,
  },

  // Chips
  chipsContainer: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipIcon: {
    fontSize: 14,
  },

  // Segmented Control
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    position: 'relative',
  },
  segmentPill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
});
