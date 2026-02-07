import { describe, it, expect, beforeEach } from 'vitest';
import { useWalletStore } from '@/stores/wallet.store';
import type { QrScanResult } from '@ahub/shared/types';

const mockScanResult: QrScanResult = {
  type: 'pdv_payment',
  valid: true,
  data: { code: 'ABC123' },
  action: 'Ir para checkout',
};

describe('Wallet Store (Mobile)', () => {
  beforeEach(() => {
    useWalletStore.setState({
      cachedBalance: null,
      lastScanResult: null,
      isProcessing: false,
      flashEnabled: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useWalletStore.getState();
      expect(state.cachedBalance).toBeNull();
      expect(state.lastScanResult).toBeNull();
      expect(state.isProcessing).toBe(false);
      expect(state.flashEnabled).toBe(false);
    });
  });

  describe('setCachedBalance', () => {
    it('should set cached balance', () => {
      useWalletStore.getState().setCachedBalance(1500);
      expect(useWalletStore.getState().cachedBalance).toBe(1500);
    });

    it('should overwrite previous balance', () => {
      useWalletStore.getState().setCachedBalance(1500);
      useWalletStore.getState().setCachedBalance(2000);
      expect(useWalletStore.getState().cachedBalance).toBe(2000);
    });
  });

  describe('scanner state', () => {
    it('setLastScanResult should set result', () => {
      useWalletStore.getState().setLastScanResult(mockScanResult);
      expect(useWalletStore.getState().lastScanResult).toEqual(mockScanResult);
    });

    it('setLastScanResult can clear result', () => {
      useWalletStore.getState().setLastScanResult(mockScanResult);
      useWalletStore.getState().setLastScanResult(null);
      expect(useWalletStore.getState().lastScanResult).toBeNull();
    });

    it('setIsProcessing should update processing state', () => {
      useWalletStore.getState().setIsProcessing(true);
      expect(useWalletStore.getState().isProcessing).toBe(true);
    });

    it('toggleFlash should toggle flash state', () => {
      useWalletStore.getState().toggleFlash();
      expect(useWalletStore.getState().flashEnabled).toBe(true);
      useWalletStore.getState().toggleFlash();
      expect(useWalletStore.getState().flashEnabled).toBe(false);
    });
  });

  describe('resetScanner', () => {
    it('should reset scan result and processing state', () => {
      useWalletStore.getState().setLastScanResult(mockScanResult);
      useWalletStore.getState().setIsProcessing(true);

      useWalletStore.getState().resetScanner();

      const state = useWalletStore.getState();
      expect(state.lastScanResult).toBeNull();
      expect(state.isProcessing).toBe(false);
    });

    it('should preserve flash and balance state', () => {
      useWalletStore.getState().setCachedBalance(1500);
      useWalletStore.getState().toggleFlash();
      useWalletStore.getState().setLastScanResult(mockScanResult);

      useWalletStore.getState().resetScanner();

      const state = useWalletStore.getState();
      expect(state.cachedBalance).toBe(1500);
      expect(state.flashEnabled).toBe(true);
    });
  });

  describe('state isolation', () => {
    it('should preserve scanner state when updating balance', () => {
      useWalletStore.getState().setLastScanResult(mockScanResult);
      useWalletStore.getState().setCachedBalance(1500);
      expect(useWalletStore.getState().lastScanResult).toEqual(mockScanResult);
    });

    it('should preserve balance when toggling flash', () => {
      useWalletStore.getState().setCachedBalance(1500);
      useWalletStore.getState().toggleFlash();
      expect(useWalletStore.getState().cachedBalance).toBe(1500);
    });
  });
});
