import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';
import { mockJwtPayload } from '../../test/fixtures/user.fixtures';
import { RankingPeriod } from './dto';

describe('RankingsController', () => {
  let controller: RankingsController;
  let service: any;

  beforeEach(() => {
    service = {
      getPointsRanking: vi.fn(),
      getEventsRanking: vi.fn(),
      getStravaRanking: vi.fn(),
    };

    controller = new RankingsController(service);
  });

  describe('getPointsRanking', () => {
    it('should use default period/limit', async () => {
      const mockResult = { type: 'points', entries: [] };
      service.getPointsRanking.mockResolvedValue(mockResult);

      const result = await controller.getPointsRanking(mockJwtPayload as any, {});

      expect(service.getPointsRanking).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.associationId,
        RankingPeriod.ALL_TIME,
        10,
      );
      expect(result.data).toEqual(mockResult);
    });

    it('should pass custom query params', async () => {
      const mockResult = { type: 'points', entries: [] };
      service.getPointsRanking.mockResolvedValue(mockResult);

      await controller.getPointsRanking(mockJwtPayload as any, {
        period: RankingPeriod.MONTHLY,
        limit: 20,
      });

      expect(service.getPointsRanking).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.associationId,
        RankingPeriod.MONTHLY,
        20,
      );
    });
  });

  describe('getEventsRanking', () => {
    it('should use default period/limit', async () => {
      const mockResult = { type: 'events', entries: [] };
      service.getEventsRanking.mockResolvedValue(mockResult);

      const result = await controller.getEventsRanking(mockJwtPayload as any, {});

      expect(service.getEventsRanking).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.associationId,
        RankingPeriod.ALL_TIME,
        10,
      );
      expect(result.data).toEqual(mockResult);
    });

    it('should pass custom query params', async () => {
      const mockResult = { type: 'events', entries: [] };
      service.getEventsRanking.mockResolvedValue(mockResult);

      await controller.getEventsRanking(mockJwtPayload as any, {
        period: RankingPeriod.WEEKLY,
        limit: 5,
      });

      expect(service.getEventsRanking).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.associationId,
        RankingPeriod.WEEKLY,
        5,
      );
    });
  });

  describe('getStravaRanking', () => {
    it('should use default period/limit', async () => {
      const mockResult = { type: 'strava', entries: [] };
      service.getStravaRanking.mockResolvedValue(mockResult);

      const result = await controller.getStravaRanking(mockJwtPayload as any, {});

      expect(service.getStravaRanking).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.associationId,
        RankingPeriod.ALL_TIME,
        10,
      );
      expect(result.data).toEqual(mockResult);
    });

    it('should pass custom query params', async () => {
      const mockResult = { type: 'strava', entries: [] };
      service.getStravaRanking.mockResolvedValue(mockResult);

      await controller.getStravaRanking(mockJwtPayload as any, {
        period: RankingPeriod.MONTHLY,
        limit: 15,
      });

      expect(service.getStravaRanking).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockJwtPayload.associationId,
        RankingPeriod.MONTHLY,
        15,
      );
    });
  });
});
