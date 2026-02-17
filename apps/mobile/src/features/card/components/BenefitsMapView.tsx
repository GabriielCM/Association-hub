import { memo, useMemo, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Text, Avatar, Icon } from '@ahub/ui';
import { MapPin } from '@ahub/ui/src/icons';
import type { PartnerListItem } from '@ahub/shared/types';

// Try to load react-native-maps at module level.
// It calls requireNativeModule('RNMapsAirModule') on import,
// which throws in Expo Go where the native module isn't available.
let RNMapView: React.ComponentType<any> | null = null;
let RNMarker: React.ComponentType<any> | null = null;
let RNCallout: React.ComponentType<any> | null = null;
try {
  const maps = require('react-native-maps');
  RNMapView = maps.default;
  RNMarker = maps.Marker;
  RNCallout = maps.Callout;
} catch {
  // Native module not available (Expo Go)
}

interface BenefitsMapViewProps {
  partners: (PartnerListItem & { _distance?: number })[];
  userLocation?: { lat: number; lng: number } | null;
  onPartnerPress: (partner: PartnerListItem) => void;
}

export const BenefitsMapView = memo(function BenefitsMapView({
  partners,
  userLocation,
  onPartnerPress,
}: BenefitsMapViewProps) {
  const isDark = useColorScheme() === 'dark';
  const mapRef = useRef<any>(null);

  // Only show partners that have coordinates
  const mappablePartners = useMemo(
    () =>
      partners.filter((p) => {
        const lat = (p as unknown as { lat?: number }).lat;
        const lng = (p as unknown as { lng?: number }).lng;
        return lat != null && lng != null;
      }),
    [partners],
  );

  // Calculate initial region from partners or user location
  const initialRegion = useMemo(() => {
    if (userLocation) {
      return {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    if (mappablePartners.length > 0) {
      const first = mappablePartners[0] as unknown as { lat: number; lng: number };
      return {
        latitude: first.lat,
        longitude: first.lng,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    // Default: Brazil center
    return {
      latitude: -15.77,
      longitude: -47.93,
      latitudeDelta: 10,
      longitudeDelta: 10,
    };
  }, [userLocation, mappablePartners]);

  const handleCalloutPress = useCallback(
    (partner: PartnerListItem) => {
      onPartnerPress(partner);
    },
    [onPartnerPress],
  );

  if (!RNMapView || !RNMarker || !RNCallout) {
    return (
      <View style={[styles.container, styles.fallback, isDark && styles.fallbackDark]}>
        <Icon icon={MapPin} size={48} color="#8B5CF6" />
        <Text style={[styles.fallbackTitle, isDark && styles.fallbackTitleDark]}>
          Mapa indisponível
        </Text>
        <Text style={[styles.fallbackText, isDark && styles.fallbackTextDark]}>
          O mapa requer um development build.{'\n'}Use a lista para ver os parceiros.
        </Text>
      </View>
    );
  }

  const MapViewComponent = RNMapView;
  const MarkerComponent = RNMarker;
  const CalloutComponent = RNCallout;

  return (
    <View style={styles.container}>
      <MapViewComponent
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        userInterfaceStyle={isDark ? 'dark' : 'light'}
      >
        {mappablePartners.map((partner) => {
          const coords = partner as unknown as { lat: number; lng: number };
          return (
            <MarkerComponent
              key={partner.id}
              coordinate={{
                latitude: coords.lat,
                longitude: coords.lng,
              }}
            >
              {/* Custom marker */}
              <View style={styles.markerOuter}>
                <Avatar
                  src={partner.logoUrl}
                  name={partner.name}
                  size="xs"
                  style={styles.markerAvatar}
                />
              </View>
              <View style={styles.markerArrow} />

              {/* Callout */}
              <CalloutComponent
                tooltip
                onPress={() => handleCalloutPress(partner)}
              >
                <Pressable style={[styles.callout, isDark && styles.calloutDark]}>
                  <Text
                    style={[styles.calloutName, isDark && styles.calloutNameDark]}
                    numberOfLines={1}
                  >
                    {partner.name}
                  </Text>
                  <Text
                    style={[styles.calloutBenefit, isDark && styles.calloutBenefitDark]}
                    numberOfLines={2}
                  >
                    {partner.benefit}
                  </Text>
                  <Text style={styles.calloutCta}>Ver detalhes →</Text>
                </Pressable>
              </CalloutComponent>
            </MarkerComponent>
          );
        })}
      </MapViewComponent>

      {mappablePartners.length === 0 && (
        <View style={styles.emptyOverlay}>
          <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              Nenhum parceiro com localização disponível
            </Text>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },

  // Marker
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerAvatar: {
    borderRadius: 14,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#8B5CF6',
    alignSelf: 'center',
    marginTop: -1,
  },

  // Callout
  callout: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  calloutDark: {
    backgroundColor: '#1F1F1F',
  },
  calloutName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  calloutNameDark: {
    color: '#F3F4F6',
  },
  calloutBenefit: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 6,
  },
  calloutBenefitDark: {
    color: '#9CA3AF',
  },
  calloutCta: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Empty
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCardDark: {
    backgroundColor: '#1F1F1F',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#9CA3AF',
  },

  // Fallback (Expo Go)
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    gap: 12,
    padding: 32,
  },
  fallbackDark: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  fallbackTitleDark: {
    color: '#F3F4F6',
  },
  fallbackText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  fallbackTextDark: {
    color: '#9CA3AF',
  },
});
