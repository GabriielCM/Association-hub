import { useEffect, useRef, useState } from 'react';
import { useCopilot } from 'react-native-copilot';

import { getBoolean, setBoolean, STORAGE_KEYS } from '@/services/storage/mmkv';

export function useOnboardingTour(isReady: boolean) {
  const { start, copilotEvents } = useCopilot();
  const hasStarted = useRef(false);
  const [isTourActive, setIsTourActive] = useState(false);

  // Start the tour when data is ready
  useEffect(() => {
    const completed = getBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED);
    if (completed || hasStarted.current || !isReady) return;

    const timer = setTimeout(() => {
      hasStarted.current = true;
      start();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isReady, start]);

  // Track tour active state + persist completion
  useEffect(() => {
    const handleStart = () => setIsTourActive(true);
    const handleStop = () => {
      setIsTourActive(false);
      setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    };

    copilotEvents.on('start', handleStart);
    copilotEvents.on('stop', handleStop);

    return () => {
      copilotEvents.off('start', handleStart);
      copilotEvents.off('stop', handleStop);
    };
  }, [copilotEvents]);

  return { isTourActive };
}
