import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QrCodeDisplayProps {
  data: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
}

export function QrCodeDisplay({
  data,
  size = 180,
  backgroundColor = '#fff',
  color = '#000',
}: QrCodeDisplayProps) {
  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel="QR Code da carteirinha"
    >
      <QRCode
        value={data}
        size={size - 8}
        backgroundColor={backgroundColor}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
});
