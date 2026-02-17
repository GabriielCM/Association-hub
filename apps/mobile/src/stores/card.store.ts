import { create } from 'zustand';
import type { MemberCard, CardQrCode } from '@ahub/shared/types';

interface CardState {
  cachedCard: MemberCard | null;
  cachedQrCode: CardQrCode | null;
  isFlipped: boolean;
  brightnessIndicatorVisible: boolean;
  entryAnimationDone: boolean;

  setCachedCard: (card: MemberCard) => void;
  setCachedQrCode: (qr: CardQrCode) => void;
  toggleFlip: () => void;
  setFlipped: (flipped: boolean) => void;
  setBrightnessIndicatorVisible: (visible: boolean) => void;
  setEntryAnimationDone: (done: boolean) => void;
}

export const useCardStore = create<CardState>((set) => ({
  cachedCard: null,
  cachedQrCode: null,
  isFlipped: false,
  brightnessIndicatorVisible: false,
  entryAnimationDone: false,

  setCachedCard: (card) => set({ cachedCard: card }),
  setCachedQrCode: (qr) => set({ cachedQrCode: qr }),
  toggleFlip: () => set((state) => ({ isFlipped: !state.isFlipped })),
  setFlipped: (flipped) => set({ isFlipped: flipped }),
  setBrightnessIndicatorVisible: (visible) => set({ brightnessIndicatorVisible: visible }),
  setEntryAnimationDone: (done) => set({ entryAnimationDone: done }),
}));

// Selector hooks
export const useCachedCard = () => useCardStore((s) => s.cachedCard);
export const useCachedQrCode = () => useCardStore((s) => s.cachedQrCode);
export const useIsFlipped = () => useCardStore((s) => s.isFlipped);
export const useBrightnessIndicatorVisible = () => useCardStore((s) => s.brightnessIndicatorVisible);
export const useEntryAnimationDone = () => useCardStore((s) => s.entryAnimationDone);
