import { create } from 'zustand';
import type { MemberCard, CardQrCode } from '@ahub/shared/types';

interface CardState {
  cachedCard: MemberCard | null;
  cachedQrCode: CardQrCode | null;
  isFlipped: boolean;

  setCachedCard: (card: MemberCard) => void;
  setCachedQrCode: (qr: CardQrCode) => void;
  toggleFlip: () => void;
  setFlipped: (flipped: boolean) => void;
}

export const useCardStore = create<CardState>((set) => ({
  cachedCard: null,
  cachedQrCode: null,
  isFlipped: false,

  setCachedCard: (card) => set({ cachedCard: card }),
  setCachedQrCode: (qr) => set({ cachedQrCode: qr }),
  toggleFlip: () => set((state) => ({ isFlipped: !state.isFlipped })),
  setFlipped: (flipped) => set({ isFlipped: flipped }),
}));

// Selector hooks
export const useCachedCard = () => useCardStore((s) => s.cachedCard);
export const useCachedQrCode = () => useCardStore((s) => s.cachedQrCode);
export const useIsFlipped = () => useCardStore((s) => s.isFlipped);
