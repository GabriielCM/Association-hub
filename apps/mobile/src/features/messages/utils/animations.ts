import type { WithSpringConfig, WithTimingConfig } from 'react-native-reanimated';

/** Timing config for message send/receive slide animation */
export const SEND_TIMING: WithTimingConfig = { duration: 250 };

/** Spring config for general message interactions */
export const SPRING_CONFIG: WithSpringConfig = {
  damping: 18,
  stiffness: 120,
  mass: 0.8,
};

/** Spring config for morph send button animation */
export const MORPH_SPRING: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

/** Spring config for context menu appearance */
export const CONTEXT_MENU_SPRING: WithSpringConfig = {
  damping: 20,
  stiffness: 200,
};

/** Stagger delay for fan-out attachment buttons (ms) */
export const FAN_OUT_STAGGER = 50;

/** Duration for fan-out animation (ms) */
export const FAN_OUT_DURATION = 200;

/** Swipe-to-reply trigger threshold (px) */
export const SWIPE_REPLY_THRESHOLD = 60;

/** Message cluster max time gap (ms) - messages within 2 min are clustered */
export const CLUSTER_TIME_GAP = 2 * 60 * 1000;

/** Cluster gap between consecutive messages from same sender (px) */
export const CLUSTER_MESSAGE_GAP = 2;

/** Normal gap between messages from different senders (px) */
export const NORMAL_MESSAGE_GAP = 8;
