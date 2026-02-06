import { describe, it, expect, beforeEach } from 'vitest';
import { usePointsStore } from '@/stores/points.store';
import type { RecentRecipient } from '@ahub/shared/types';

const mockRecipient: RecentRecipient = {
  userId: 'user-2',
  name: 'Jane Doe',
  avatar: 'https://example.com/avatar.jpg',
  lastTransferAt: new Date(),
};

describe('Points Store (Mobile)', () => {
  beforeEach(() => {
    usePointsStore.setState({
      cachedBalance: null,
      transferWizard: {
        step: 'recipient',
        recipient: null,
        amount: 0,
        message: '',
      },
      celebration: {
        visible: false,
        points: 0,
        eventName: '',
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = usePointsStore.getState();
      expect(state.cachedBalance).toBeNull();
      expect(state.transferWizard.step).toBe('recipient');
      expect(state.transferWizard.recipient).toBeNull();
      expect(state.transferWizard.amount).toBe(0);
      expect(state.transferWizard.message).toBe('');
      expect(state.celebration.visible).toBe(false);
      expect(state.celebration.points).toBe(0);
    });
  });

  describe('setCachedBalance', () => {
    it('should set cached balance', () => {
      usePointsStore.getState().setCachedBalance(1500);
      expect(usePointsStore.getState().cachedBalance).toBe(1500);
    });

    it('should overwrite previous balance', () => {
      usePointsStore.getState().setCachedBalance(1500);
      usePointsStore.getState().setCachedBalance(2000);
      expect(usePointsStore.getState().cachedBalance).toBe(2000);
    });
  });

  describe('transfer wizard', () => {
    it('setTransferStep should update step', () => {
      usePointsStore.getState().setTransferStep('amount');
      expect(usePointsStore.getState().transferWizard.step).toBe('amount');
    });

    it('setTransferRecipient should set recipient and advance to amount step', () => {
      usePointsStore.getState().setTransferRecipient(mockRecipient);
      const state = usePointsStore.getState();
      expect(state.transferWizard.recipient).toEqual(mockRecipient);
      expect(state.transferWizard.step).toBe('amount');
    });

    it('setTransferAmount should update amount', () => {
      usePointsStore.getState().setTransferAmount(250);
      expect(usePointsStore.getState().transferWizard.amount).toBe(250);
    });

    it('setTransferMessage should update message', () => {
      usePointsStore.getState().setTransferMessage('Thanks!');
      expect(usePointsStore.getState().transferWizard.message).toBe('Thanks!');
    });

    it('resetTransfer should reset wizard to initial state', () => {
      usePointsStore.getState().setTransferRecipient(mockRecipient);
      usePointsStore.getState().setTransferAmount(250);
      usePointsStore.getState().setTransferMessage('Test');
      usePointsStore.getState().setTransferStep('confirm');

      usePointsStore.getState().resetTransfer();

      const state = usePointsStore.getState();
      expect(state.transferWizard.step).toBe('recipient');
      expect(state.transferWizard.recipient).toBeNull();
      expect(state.transferWizard.amount).toBe(0);
      expect(state.transferWizard.message).toBe('');
    });

    it('should preserve other state when updating wizard', () => {
      usePointsStore.getState().setCachedBalance(1500);
      usePointsStore.getState().setTransferRecipient(mockRecipient);
      expect(usePointsStore.getState().cachedBalance).toBe(1500);
    });
  });

  describe('celebration', () => {
    it('showCelebration should show overlay with data', () => {
      usePointsStore.getState().showCelebration(500, 'Check-in Evento');
      const state = usePointsStore.getState();
      expect(state.celebration.visible).toBe(true);
      expect(state.celebration.points).toBe(500);
      expect(state.celebration.eventName).toBe('Check-in Evento');
    });

    it('hideCelebration should reset overlay', () => {
      usePointsStore.getState().showCelebration(500, 'Test');
      usePointsStore.getState().hideCelebration();
      const state = usePointsStore.getState();
      expect(state.celebration.visible).toBe(false);
      expect(state.celebration.points).toBe(0);
      expect(state.celebration.eventName).toBe('');
    });

    it('should preserve other state when showing celebration', () => {
      usePointsStore.getState().setCachedBalance(2000);
      usePointsStore.getState().setTransferAmount(100);
      usePointsStore.getState().showCelebration(300, 'Event');

      const state = usePointsStore.getState();
      expect(state.cachedBalance).toBe(2000);
      expect(state.transferWizard.amount).toBe(100);
    });
  });
});
