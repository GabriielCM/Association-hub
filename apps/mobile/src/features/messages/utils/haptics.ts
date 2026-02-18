import * as Haptics from 'expo-haptics';

export const messageHaptics = {
  /** Haptic feedback when a message is sent successfully */
  send: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  /** Medium impact when long-pressing a message */
  longPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  /** Selection feedback when swipe-to-reply threshold is reached */
  swipeReply: () => Haptics.selectionAsync(),

  /** Light impact when adding a reaction */
  react: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Light impact for swipe actions on conversation list */
  swipeAction: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  /** Selection feedback for record lock/cancel gestures */
  recordGesture: () => Haptics.selectionAsync(),
};
