import type { ReactNode } from 'react';
import Constants from 'expo-constants';
import { STRIPE_PUBLISHABLE_KEY } from '@/config/constants';

// Expo Go sets appOwnership to 'expo'; dev builds set it to null
const isExpoGo = Constants.appOwnership === 'expo';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let RealStripeProvider: any = null;

if (!isExpoGo) {
  try {
    // Dynamic require to avoid TurboModule crash in Expo Go
    const stripe = require('@stripe/stripe-react-native');
    RealStripeProvider = stripe.StripeProvider;
  } catch {
    // Native module not available
  }
}

export function SafeStripeProvider({ children }: { children: ReactNode }) {
  if (RealStripeProvider && STRIPE_PUBLISHABLE_KEY) {
    return (
      <RealStripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        {children}
      </RealStripeProvider>
    );
  }
  return <>{children}</>;
}

export function isStripeAvailable(): boolean {
  return RealStripeProvider != null;
}
