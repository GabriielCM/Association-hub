import { create } from 'zustand';
import type { QrScanResult } from '@ahub/shared/types';

interface WalletState {
  cachedBalance: number | null;
  lastScanResult: QrScanResult | null;
  isProcessing: boolean;
  flashEnabled: boolean;
  balanceHidden: boolean;
  scanHistory: string[];

  setCachedBalance: (balance: number) => void;
  setLastScanResult: (result: QrScanResult | null) => void;
  setIsProcessing: (processing: boolean) => void;
  toggleFlash: () => void;
  resetScanner: () => void;
  toggleBalanceHidden: () => void;
  addScanHistory: (data: string) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  cachedBalance: null,
  lastScanResult: null,
  isProcessing: false,
  flashEnabled: false,
  balanceHidden: false,
  scanHistory: [],

  setCachedBalance: (balance) => set({ cachedBalance: balance }),
  setLastScanResult: (result) => set({ lastScanResult: result }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  toggleFlash: () => set((state) => ({ flashEnabled: !state.flashEnabled })),
  resetScanner: () =>
    set({ lastScanResult: null, isProcessing: false }),
  toggleBalanceHidden: () =>
    set((state) => ({ balanceHidden: !state.balanceHidden })),
  addScanHistory: (data) =>
    set((state) => ({ scanHistory: [data, ...state.scanHistory].slice(0, 5) })),
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
export const useBalanceHidden = () =>
  useWalletStore((s) => s.balanceHidden);
export const useScanHistory = () =>
  useWalletStore((s) => s.scanHistory);
