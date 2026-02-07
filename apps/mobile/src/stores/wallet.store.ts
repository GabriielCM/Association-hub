import { create } from 'zustand';
import type { QrScanResult } from '@ahub/shared/types';

interface WalletState {
  cachedBalance: number | null;
  lastScanResult: QrScanResult | null;
  isProcessing: boolean;
  flashEnabled: boolean;

  setCachedBalance: (balance: number) => void;
  setLastScanResult: (result: QrScanResult | null) => void;
  setIsProcessing: (processing: boolean) => void;
  toggleFlash: () => void;
  resetScanner: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  cachedBalance: null,
  lastScanResult: null,
  isProcessing: false,
  flashEnabled: false,

  setCachedBalance: (balance) => set({ cachedBalance: balance }),
  setLastScanResult: (result) => set({ lastScanResult: result }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  toggleFlash: () => set((state) => ({ flashEnabled: !state.flashEnabled })),
  resetScanner: () =>
    set({ lastScanResult: null, isProcessing: false }),
}));

// Selector hooks
export const useCachedBalance = () =>
  useWalletStore((s) => s.cachedBalance);
export const useLastScanResult = () =>
  useWalletStore((s) => s.lastScanResult);
export const useIsProcessing = () =>
  useWalletStore((s) => s.isProcessing);
export const useFlashEnabled = () =>
  useWalletStore((s) => s.flashEnabled);
