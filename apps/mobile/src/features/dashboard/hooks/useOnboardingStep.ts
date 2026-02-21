import { useRef, useEffect } from 'react';
import { type View } from 'react-native';

import { useOnboardingTourContext } from '../context/OnboardingTourContext';

interface UseOnboardingStepOptions {
  name: string;
  title: string;
  text: string;
  order: number;
}

export function useOnboardingStep({ name, title, text, order }: UseOnboardingStepOptions) {
  const ref = useRef<View>(null);
  const { registerStep, unregisterStep } = useOnboardingTourContext();

  useEffect(() => {
    registerStep({ name, title, text, order, ref });
    return () => unregisterStep(name);
    // Only re-register if identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, order]);

  return { ref };
}
