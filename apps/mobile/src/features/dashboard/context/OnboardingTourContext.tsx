import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
  useMemo,
  type PropsWithChildren,
  type RefObject,
} from 'react';
import { Dimensions, type FlatList, type View } from 'react-native';

import { setBoolean, STORAGE_KEYS } from '@/services/storage/mmkv';

export interface TourStepLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TourStepDefinition {
  name: string;
  title: string;
  text: string;
  order: number;
  ref: RefObject<View | null>;
}

interface OnboardingTourContextValue {
  isActive: boolean;
  currentStepIndex: number;
  steps: TourStepDefinition[];
  currentLayout: TourStepLayout | null;
  registerStep: (step: TourStepDefinition) => void;
  unregisterStep: (name: string) => void;
  goToNext: () => void;
  stop: () => void;
  start: () => void;
  setFlatListRef: (ref: RefObject<FlatList | null>) => void;
}

const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(null);

export function useOnboardingTourContext() {
  const ctx = useContext(OnboardingTourContext);
  if (!ctx) {
    throw new Error('useOnboardingTourContext must be used within OnboardingTourProvider');
  }
  return ctx;
}

function measureStep(step: TourStepDefinition): Promise<TourStepLayout | null> {
  return new Promise((resolve) => {
    if (!step.ref.current) {
      resolve(null);
      return;
    }
    step.ref.current.measureInWindow((x, y, width, height) => {
      if (width === 0 && height === 0) {
        resolve(null);
      } else {
        resolve({ x, y, width, height });
      }
    });
  });
}

export function OnboardingTourProvider({ children }: PropsWithChildren) {
  const stepsMapRef = useRef<Map<string, TourStepDefinition>>(new Map());
  const [steps, setSteps] = useState<TourStepDefinition[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentLayout, setCurrentLayout] = useState<TourStepLayout | null>(null);
  const flatListRef = useRef<RefObject<FlatList | null> | null>(null);

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps],
  );

  const registerStep = useCallback((step: TourStepDefinition) => {
    stepsMapRef.current.set(step.name, step);
    setSteps(Array.from(stepsMapRef.current.values()));
  }, []);

  const unregisterStep = useCallback((name: string) => {
    stepsMapRef.current.delete(name);
    setSteps(Array.from(stepsMapRef.current.values()));
  }, []);

  const setFlatListRefCb = useCallback((ref: RefObject<FlatList | null>) => {
    flatListRef.current = ref;
  }, []);

  const navigateToStep = useCallback(async (index: number, sorted: TourStepDefinition[]) => {
    const step = sorted[index];
    if (!step) return;

    // First attempt to measure
    let layout = await measureStep(step);

    // If element is off-screen, scroll to make it visible
    if (!layout || layout.y < 0 || layout.y + layout.height > Dimensions.get('window').height) {
      // Scroll to top first to reset, then let FlatList settle
      flatListRef.current?.current?.scrollToOffset({ offset: 0, animated: true });
      await new Promise((r) => setTimeout(r, 500));
      layout = await measureStep(step);
    }

    if (layout) {
      setCurrentLayout(layout);
    }
  }, []);

  const start = useCallback(() => {
    const sorted = [...stepsMapRef.current.values()].sort((a, b) => a.order - b.order);
    if (sorted.length === 0) return;

    setIsActive(true);
    setCurrentStepIndex(0);

    // Small delay to let Modal mount and layout settle
    setTimeout(() => {
      navigateToStep(0, sorted);
    }, 100);
  }, [navigateToStep]);

  const goToNext = useCallback(() => {
    const sorted = [...stepsMapRef.current.values()].sort((a, b) => a.order - b.order);
    const nextIndex = currentStepIndex + 1;

    if (nextIndex >= sorted.length) {
      // Tour completed
      setIsActive(false);
      setCurrentLayout(null);
      setCurrentStepIndex(0);
      setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
      return;
    }

    setCurrentStepIndex(nextIndex);

    // Fade tooltip out briefly, measure, then animate to new position
    setCurrentLayout(null);
    setTimeout(() => {
      navigateToStep(nextIndex, sorted);
    }, 150);
  }, [currentStepIndex, navigateToStep]);

  const stop = useCallback(() => {
    setIsActive(false);
    setCurrentLayout(null);
    setCurrentStepIndex(0);
    setBoolean(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
  }, []);

  const value = useMemo<OnboardingTourContextValue>(() => ({
    isActive,
    currentStepIndex,
    steps: sortedSteps,
    currentLayout,
    registerStep,
    unregisterStep,
    goToNext,
    stop,
    start,
    setFlatListRef: setFlatListRefCb,
  }), [
    isActive, currentStepIndex, sortedSteps, currentLayout,
    registerStep, unregisterStep, goToNext, stop, start, setFlatListRefCb,
  ]);

  return (
    <OnboardingTourContext.Provider value={value}>
      {children}
    </OnboardingTourContext.Provider>
  );
}
