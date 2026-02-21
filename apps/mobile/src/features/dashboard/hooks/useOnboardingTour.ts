import { useEffect, useRef } from 'react';

import { useOnboardingTourContext } from '../context/OnboardingTourContext';
import { getBoolean, STORAGE_KEYS } from '@/services/storage/mmkv';

export function useOnboardingTour(isReady: boolean) {
  const { start, isActive } = useOnboardingTourContext();
  const hasStarted = useRef(false);

  useEffect(() => {
    const completed = getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (completed || hasStarted.current || !isReady) return;

    const timer = setTimeout(() => {
      hasStarted.current = true;
      start();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isReady, start]);

  return { isTourActive: isActive };
}
