import { describe, it, expect, beforeEach } from 'vitest';
import { useCardStore } from '@/stores/card.store';
import type { MemberCard, CardQrCode } from '@ahub/shared/types';

const mockCard: MemberCard = {
  id: 'card-1',
  cardNumber: 'AHUB-00001',
  status: 'ACTIVE',
  user: {
    name: 'João Silva',
    avatarUrl: 'https://example.com/avatar.jpg',
    memberSince: new Date('2025-01-01'),
  },
  association: {
    name: 'Associação Teste',
    logoUrl: 'https://example.com/logo.png',
    phone: '11999999999',
    email: 'contato@assoc.com',
  },
};

const mockQrCode: CardQrCode = {
  qrCodeData: 'AHUB-CARD-TOKEN-ABC123',
  qrCodeHash: 'sha256-hash-value',
  cardNumber: 'AHUB-00001',
};

describe('Card Store (Mobile)', () => {
  beforeEach(() => {
    useCardStore.setState({
      cachedCard: null,
      cachedQrCode: null,
      isFlipped: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useCardStore.getState();
      expect(state.cachedCard).toBeNull();
      expect(state.cachedQrCode).toBeNull();
      expect(state.isFlipped).toBe(false);
    });
  });

  describe('setCachedCard', () => {
    it('should set cached card', () => {
      useCardStore.getState().setCachedCard(mockCard);
      expect(useCardStore.getState().cachedCard).toEqual(mockCard);
    });

    it('should overwrite previous card', () => {
      useCardStore.getState().setCachedCard(mockCard);
      const updatedCard = { ...mockCard, cardNumber: 'AHUB-00002' };
      useCardStore.getState().setCachedCard(updatedCard);
      expect(useCardStore.getState().cachedCard?.cardNumber).toBe('AHUB-00002');
    });
  });

  describe('setCachedQrCode', () => {
    it('should set cached QR code', () => {
      useCardStore.getState().setCachedQrCode(mockQrCode);
      expect(useCardStore.getState().cachedQrCode).toEqual(mockQrCode);
    });

    it('should overwrite previous QR code', () => {
      useCardStore.getState().setCachedQrCode(mockQrCode);
      const updatedQr = { ...mockQrCode, qrCodeData: 'NEW-TOKEN' };
      useCardStore.getState().setCachedQrCode(updatedQr);
      expect(useCardStore.getState().cachedQrCode?.qrCodeData).toBe('NEW-TOKEN');
    });
  });

  describe('toggleFlip', () => {
    it('should toggle isFlipped from false to true', () => {
      useCardStore.getState().toggleFlip();
      expect(useCardStore.getState().isFlipped).toBe(true);
    });

    it('should toggle isFlipped from true to false', () => {
      useCardStore.getState().toggleFlip();
      useCardStore.getState().toggleFlip();
      expect(useCardStore.getState().isFlipped).toBe(false);
    });
  });

  describe('setFlipped', () => {
    it('should set isFlipped to true', () => {
      useCardStore.getState().setFlipped(true);
      expect(useCardStore.getState().isFlipped).toBe(true);
    });

    it('should set isFlipped to false', () => {
      useCardStore.getState().setFlipped(true);
      useCardStore.getState().setFlipped(false);
      expect(useCardStore.getState().isFlipped).toBe(false);
    });
  });

  describe('state isolation', () => {
    it('should preserve card data when toggling flip', () => {
      useCardStore.getState().setCachedCard(mockCard);
      useCardStore.getState().setCachedQrCode(mockQrCode);
      useCardStore.getState().toggleFlip();

      const state = useCardStore.getState();
      expect(state.cachedCard).toEqual(mockCard);
      expect(state.cachedQrCode).toEqual(mockQrCode);
      expect(state.isFlipped).toBe(true);
    });

    it('should preserve flip state when updating card', () => {
      useCardStore.getState().toggleFlip();
      useCardStore.getState().setCachedCard(mockCard);
      expect(useCardStore.getState().isFlipped).toBe(true);
    });
  });
});
