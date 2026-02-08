import { create } from 'zustand';
import type { CheckinResponse } from '@ahub/shared/types';

interface CheckinCelebrationState {
  visible: boolean;
  pointsAwarded: number;
  checkinNumber: number;
  progress: { completed: number; total: number; percentage: number };
  badgeAwarded: boolean;
}

interface EventsState {
  // Check-in celebration overlay
  checkinCelebration: CheckinCelebrationState;

  // Actions
  showCheckinCelebration: (result: CheckinResponse) => void;
  hideCheckinCelebration: () => void;
}

const initialCelebration: CheckinCelebrationState = {
  visible: false,
  pointsAwarded: 0,
  checkinNumber: 0,
  progress: { completed: 0, total: 0, percentage: 0 },
  badgeAwarded: false,
};

export const useEventsStore = create<EventsState>((set) => ({
  checkinCelebration: initialCelebration,

  showCheckinCelebration: (result) =>
    set({
      checkinCelebration: {
        visible: true,
        pointsAwarded: result.pointsAwarded,
        checkinNumber: result.checkinNumber,
        progress: result.progress,
        badgeAwarded: result.badgeAwarded,
      },
    }),

  hideCheckinCelebration: () =>
    set({ checkinCelebration: initialCelebration }),
}));

// Selector hooks
export const useCheckinCelebration = () =>
  useEventsStore((state) => state.checkinCelebration);
