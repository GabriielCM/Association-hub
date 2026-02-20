import { memo, useMemo, useCallback, useRef } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Avatar, Icon } from '@ahub/ui';
import { MapPin } from '@ahub/ui/src/icons';
import { useCardTheme } from '../hooks/useCardTheme';
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
  const ct = useCardTheme();
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
      <View style={[styles.container, styles.fallback, { backgroundColor: ct.mapFallbackBg }]}>
        <Icon icon={MapPin} size={48} color={ct.accent} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: ct.textPrimary }}>
          Mapa indisponível
        </Text>
        <Text style={{ fontSize: 13, color: ct.textSecondary, textAlign: 'center', lineHeight: 18 }}>
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
        userInterfaceStyle={ct.mapStyle}
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
              <View style={[styles.markerOuter, { backgroundColor: ct.accent }]}>
                <Avatar
                  src={partner.logoUrl}
                  name={partner.name}
                  size="xs"
                  style={styles.markerAvatar}
                />
              </View>
              <View style={[styles.markerArrow, { borderTopColor: ct.accent }]} />

              {/* Callout */}
              <CalloutComponent
                tooltip
                onPress={() => handleCalloutPress(partner)}
              >
                <Pressable style={[styles.callout, { backgroundColor: ct.surfaceBg }]}>
                  <Text
                    style={{ fontSize: 15, fontWeight: '600', color: ct.textPrimary, marginBottom: 2 }}
                    numberOfLines={1}
                  >
                    {partner.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: ct.textSecondary, lineHeight: 16, marginBottom: 6 }}
                    numberOfLines={2}
                  >
                    {partner.benefit}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: ct.accent }}>
                    Ver detalhes →
                  </Text>
                </Pressable>
              </CalloutComponent>
            </MarkerComponent>
          );
        })}
      </MapViewComponent>

      {mappablePartners.length === 0 && (
        <View style={styles.emptyOverlay}>
          <View style={[styles.emptyCard, { backgroundColor: ct.surfaceBg }]}>
            <Text style={{ fontSize: 14, color: ct.textSecondary, textAlign: 'center' }}>
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
    alignSelf: 'center',
    marginTop: -1,
  },

  // Callout
  callout: {
    width: 220,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Empty
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  emptyCard: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Fallback (Expo Go)
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 32,
  },
});
