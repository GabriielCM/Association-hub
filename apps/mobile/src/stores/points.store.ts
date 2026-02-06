import { create } from 'zustand';
import type { RecentRecipient } from '@ahub/shared/types';

interface TransferWizardState {
  step: 'recipient' | 'amount' | 'confirm';
  recipient: RecentRecipient | null;
  amount: number;
  message: string;
}

interface CelebrationState {
  visible: boolean;
  points: number;
  eventName: string;
}

interface PointsState {
  // Cached balance for offline
  cachedBalance: number | null;

  // Transfer wizard
  transferWizard: TransferWizardState;

  // Celebration overlay
  celebration: CelebrationState;

  // Actions
  setCachedBalance: (balance: number) => void;
  setTransferStep: (step: TransferWizardState['step']) => void;
  setTransferRecipient: (recipient: RecentRecipient) => void;
  setTransferAmount: (amount: number) => void;
  setTransferMessage: (message: string) => void;
  resetTransfer: () => void;
  showCelebration: (points: number, eventName: string) => void;
  hideCelebration: () => void;
}

const initialTransferWizard: TransferWizardState = {
  step: 'recipient',
  recipient: null,
  amount: 0,
  message: '',
};

const initialCelebration: CelebrationState = {
  visible: false,
  points: 0,
  eventName: '',
};

export const usePointsStore = create<PointsState>((set) => ({
  cachedBalance: null,
  transferWizard: initialTransferWizard,
  celebration: initialCelebration,

  setCachedBalance: (balance) => set({ cachedBalance: balance }),

  setTransferStep: (step) =>
    set((state) => ({
      transferWizard: { ...state.transferWizard, step },
    })),

  setTransferRecipient: (recipient) =>
    set((state) => ({
      transferWizard: { ...state.transferWizard, recipient, step: 'amount' },
    })),

  setTransferAmount: (amount) =>
    set((state) => ({
      transferWizard: { ...state.transferWizard, amount },
    })),

  setTransferMessage: (message) =>
    set((state) => ({
      transferWizard: { ...state.transferWizard, message },
    })),

  resetTransfer: () => set({ transferWizard: initialTransferWizard }),

  showCelebration: (points, eventName) =>
    set({ celebration: { visible: true, points, eventName } }),

  hideCelebration: () => set({ celebration: initialCelebration }),
}));

// Selector hooks
export const useCachedBalance = () =>
  usePointsStore((state) => state.cachedBalance);
export const useTransferWizard = () =>
  usePointsStore((state) => state.transferWizard);
export const useCelebration = () =>
  usePointsStore((state) => state.celebration);
