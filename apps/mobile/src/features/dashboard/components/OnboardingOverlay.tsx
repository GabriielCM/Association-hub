import { useEffect, useMemo } from 'react';
import { Modal, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useOnboardingTourContext } from '../context/OnboardingTourContext';
import { useDashboardTheme } from '../hooks/useDashboardTheme';
import { SpotlightSvg } from './SpotlightSvg';
import { OnboardingTooltip } from './OnboardingTooltip';

const ANIM_DURATION = 300;
const TOOLTIP_GAP = 12;
const CUTOUT_PADDING = 8;
const TOOLTIP_ESTIMATED_HEIGHT = 180;

export function OnboardingOverlay() {
  const {
    isActive,
    currentStepIndex,
    steps,
    currentLayout,
    goToNext,
    stop,
  } = useOnboardingTourContext();

  const dt = useDashboardTheme();
  const { width: screenW, height: screenH } = useWindowDimensions();

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.order - b.order),
    [steps],
  );
  const currentStep = sortedSteps[currentStepIndex];
  const isLastStep = currentStepIndex === sortedSteps.length - 1;

  // Shared values for animated cutout
  const cutoutX = useSharedValue(screenW / 2);
  const cutoutY = useSharedValue(screenH / 2);
  const cutoutWidth = useSharedValue(0);
  const cutoutHeight = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  // Shared values for tooltip
  const tooltipY = useSharedValue(0);
  const tooltipOpacity = useSharedValue(0);

  // Animate overlay fade in/out
  useEffect(() => {
    if (isActive) {
      overlayOpacity.value = withTiming(1, { duration: 400 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      tooltipOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [isActive, overlayOpacity, tooltipOpacity]);

  // Animate cutout to current layout
  useEffect(() => {
    if (!isActive || !currentLayout) {
      tooltipOpacity.value = withTiming(0, { duration: 150 });
      return;
    }

    const { x, y, width, height } = currentLayout;
    const easing = Easing.out(Easing.cubic);

    cutoutX.value = withTiming(x, { duration: ANIM_DURATION, easing });
    cutoutY.value = withTiming(y, { duration: ANIM_DURATION, easing });
    cutoutWidth.value = withTiming(width, { duration: ANIM_DURATION, easing });
    cutoutHeight.value = withTiming(height, { duration: ANIM_DURATION, easing });

    // Position tooltip above or below cutout
    const spaceBelow = screenH - (y + height + CUTOUT_PADDING + TOOLTIP_GAP);
    const spaceAbove = y - CUTOUT_PADDING - TOOLTIP_GAP;

    let newTooltipY: number;
    if (spaceBelow >= TOOLTIP_ESTIMATED_HEIGHT) {
      newTooltipY = y + height + CUTOUT_PADDING + TOOLTIP_GAP;
    } else if (spaceAbove >= TOOLTIP_ESTIMATED_HEIGHT) {
      newTooltipY = y - CUTOUT_PADDING - TOOLTIP_GAP - TOOLTIP_ESTIMATED_HEIGHT;
    } else {
      // Not enough space either way — place at bottom third
      newTooltipY = screenH - TOOLTIP_ESTIMATED_HEIGHT - 40;
    }

    tooltipY.value = withTiming(newTooltipY, { duration: ANIM_DURATION, easing });

    // Fade tooltip in after cutout animation starts
    setTimeout(() => {
      tooltipOpacity.value = withTiming(1, { duration: 200 });
    }, ANIM_DURATION * 0.4);
  }, [
    isActive, currentLayout, screenH,
    cutoutX, cutoutY, cutoutWidth, cutoutHeight,
    tooltipY, tooltipOpacity,
  ]);

  const tooltipAnimatedStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: 16,
    right: 16,
    top: tooltipY.value,
    opacity: tooltipOpacity.value,
  }));

  if (!isActive) return null;

  const backdropColor = dt.isDark ? 'rgba(13,5,32,0.85)' : 'rgba(0,0,0,0.75)';

  return (
    <Modal transparent animationType="none" visible={isActive}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-only">
        <SpotlightSvg
          cutoutX={cutoutX}
          cutoutY={cutoutY}
          cutoutWidth={cutoutWidth}
          cutoutHeight={cutoutHeight}
          overlayOpacity={overlayOpacity}
          backdropColor={backdropColor}
          screenWidth={screenW}
          screenHeight={screenH}
          borderRadius={12}
          padding={CUTOUT_PADDING}
        />

        {currentStep && (
          <Animated.View style={tooltipAnimatedStyle} pointerEvents="box-none">
            <OnboardingTooltip
              title={currentStep.title}
              text={currentStep.text}
              stepIndex={currentStepIndex}
              totalSteps={sortedSteps.length}
              isLastStep={isLastStep}
              onNext={goToNext}
              onSkip={stop}
            />
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}
